import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'

export const playerRouter = Router()

// POST /api/player/init — Initialise le joueur en DB après inscription Supabase Auth
// Idempotent : si le joueur existe déjà, renvoie ses données
playerRouter.post('/init', requireAuth, async (req, res) => {
  const playerId = req.userId!
  const { username } = req.body as { username?: string }

  if (!username || username.trim().length < 2) {
    res.status(400).json({ error: 'Username requis (2 caractères minimum)' })
    return
  }

  // Vérifier si le joueur existe déjà
  const { data: existing } = await supabase
    .from('players')
    .select('id, username')
    .eq('id', playerId)
    .single()

  if (existing) {
    res.json({ message: 'Joueur déjà initialisé', playerId })
    return
  }

  // Créer le joueur
  const { error: playerError } = await supabase
    .from('players')
    .insert({ id: playerId, username: username.trim() })

  if (playerError) {
    console.error('Erreur création joueur:', playerError)
    res.status(500).json({ error: 'Erreur lors de la création du joueur' })
    return
  }

  // Créer les ressources initiales
  const { error: resourcesError } = await supabase
    .from('player_resources')
    .insert({
      player_id: playerId,
      credits: 142847,
      energy: 94,
      food: 72,
      minerals: 340,
    })

  if (resourcesError) {
    console.error('Erreur création ressources:', resourcesError)
    res.status(500).json({ error: 'Erreur lors de la création des ressources' })
    return
  }

  // Créer la planète initiale (position aléatoire sur la carte)
  const homeX = 200 + Math.random() * 100
  const homeY = 200 + Math.random() * 100

  const { error: planetError } = await supabase
    .from('planets')
    .insert({
      name: `Secteur ${username.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9 + 1)}`,
      owner_id: playerId,
      x: homeX,
      y: homeY,
      size: 5,
      type: 'tellurique',
      population: 12400,
      colonized_at: new Date().toISOString(),
    })

  if (planetError) {
    console.error('Erreur création planète:', planetError)
    // Non bloquant — le joueur est créé quand même
  }

  res.status(201).json({ message: 'Joueur initialisé avec succès', playerId })
})

// GET /api/player/state — Renvoie l'état complet du joueur (ressources, planète, tour, bâtiments)
playerRouter.get('/state', requireAuth, async (req, res) => {
  const playerId = req.userId!

  // Récupérer en parallèle
  const [playerResult, resourcesResult, planetResult, buildingsResult, turnsResult] =
    await Promise.all([
      supabase.from('players').select('id, username, score').eq('id', playerId).single(),
      supabase.from('player_resources').select('*').eq('player_id', playerId).single(),
      supabase.from('planets').select('*').eq('owner_id', playerId).order('colonized_at').limit(1).single(),
      supabase.from('game_events').select('data').eq('player_id', playerId).eq('type', 'BUILDING_COMPLETED'),
      supabase.from('game_events').select('id').eq('player_id', playerId).eq('type', 'TURN_COMPLETED'),
    ])

  if (playerResult.error || !playerResult.data) {
    res.status(404).json({ error: 'Joueur introuvable' })
    return
  }

  const player = playerResult.data
  const resources = resourcesResult.data ?? { credits: 0, energy: 0, food: 0, minerals: 0 }
  const planet = planetResult.data
  const turnCount = (turnsResult.data?.length ?? 0) + 1

  // Extraire les IDs de bâtiments construits
  const buildings: string[] = (buildingsResult.data ?? [])
    .map((e) => {
      const d = e.data as { buildingId?: string } | null
      return d?.buildingId ?? null
    })
    .filter((b): b is string => b !== null)

  res.json({
    player: { id: player.id, username: player.username, score: player.score ?? 0 },
    resources: {
      credits: resources.credits ?? 0,
      energy: resources.energy ?? 0,
      food: resources.food ?? 0,
      minerals: resources.minerals ?? 0,
    },
    planet: planet
      ? {
          id: planet.id,
          name: planet.name,
          population: planet.population ?? 0,
          type: planet.type ?? 'tellurique',
        }
      : null,
    turn: turnCount,
    buildings,
  })
})
