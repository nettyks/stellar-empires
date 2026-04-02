import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'
import { processTurn } from '../game/TurnEngine'

export const gameRouter = Router()

gameRouter.get('/status', (_req, res) => {
  res.json({
    name: 'Stellar Empires',
    version: '0.2.0',
    status: 'en développement',
  })
})

// POST /api/game/end-turn — Calcule un tour et met à jour les ressources en DB
gameRouter.post('/end-turn', requireAuth, async (req, res) => {
  const playerId = req.userId!

  // Charger ressources + bâtiments construits
  const [resourcesResult, buildingsResult] = await Promise.all([
    supabase.from('player_resources').select('*').eq('player_id', playerId).single(),
    supabase.from('game_events').select('data').eq('player_id', playerId).eq('type', 'BUILDING_COMPLETED'),
  ])

  if (resourcesResult.error || !resourcesResult.data) {
    res.status(404).json({ error: 'Ressources introuvables' })
    return
  }

  const current = resourcesResult.data
  const buildings: string[] = (buildingsResult.data ?? [])
    .map((e) => {
      const d = e.data as { buildingId?: string } | null
      return d?.buildingId ?? null
    })
    .filter((b): b is string => b !== null)

  const report = processTurn(
    {
      credits:  current.credits  ?? 0,
      energy:   current.energy   ?? 0,
      food:     current.food     ?? 0,
      minerals: current.minerals ?? 0,
    },
    buildings
  )

  // Mettre à jour les ressources en DB
  const { error: updateError } = await supabase
    .from('player_resources')
    .update({
      credits:    report.newResources.credits,
      energy:     report.newResources.energy,
      food:       report.newResources.food,
      minerals:   report.newResources.minerals,
      updated_at: new Date().toISOString(),
    })
    .eq('player_id', playerId)

  if (updateError) {
    console.error('Erreur mise à jour ressources:', updateError)
    res.status(500).json({ error: 'Erreur lors du calcul du tour' })
    return
  }

  // Enregistrer l'événement de fin de tour
  await supabase.from('game_events').insert({
    player_id: playerId,
    type: 'TURN_COMPLETED',
    data: {
      creditsGain:  report.creditsGain,
      energyGain:   report.energyGain,
      foodGain:     report.foodGain,
      mineralsGain: report.mineralsGain,
      upkeepCost:   report.upkeepCost,
    },
  })

  res.json({
    report,
    resources: report.newResources,
  })
})

// POST /api/game/build — Lance la construction d'un bâtiment
gameRouter.post('/build', requireAuth, async (req, res) => {
  const playerId = req.userId!
  const { buildingId } = req.body as { buildingId?: string }

  const BUILDING_COSTS: Record<string, number> = {
    o2gen:      8400,
    hab:        12200,
    logistics:  9800,
    greenhouse: 6600,
    energy:     18000,
    research:   15500,
  }

  if (!buildingId || !BUILDING_COSTS[buildingId]) {
    res.status(400).json({ error: 'Bâtiment invalide' })
    return
  }

  const cost = BUILDING_COSTS[buildingId]

  // Vérifier les crédits disponibles
  const { data: resources, error: resError } = await supabase
    .from('player_resources')
    .select('credits')
    .eq('player_id', playerId)
    .single()

  if (resError || !resources) {
    res.status(404).json({ error: 'Ressources introuvables' })
    return
  }

  if ((resources.credits ?? 0) < cost) {
    res.status(400).json({ error: 'Crédits insuffisants', required: cost, available: resources.credits })
    return
  }

  // Vérifier que le bâtiment n'est pas déjà construit
  const { data: existing } = await supabase
    .from('game_events')
    .select('id')
    .eq('player_id', playerId)
    .eq('type', 'BUILDING_COMPLETED')
    .filter('data->>buildingId', 'eq', buildingId)
    .limit(1)

  if (existing && existing.length > 0) {
    res.status(400).json({ error: 'Ce bâtiment est déjà construit' })
    return
  }

  // Déduire les crédits
  const { error: updateError } = await supabase
    .from('player_resources')
    .update({
      credits:    (resources.credits ?? 0) - cost,
      updated_at: new Date().toISOString(),
    })
    .eq('player_id', playerId)

  if (updateError) {
    res.status(500).json({ error: 'Erreur lors de la déduction des crédits' })
    return
  }

  // Enregistrer la construction comme terminée (pour simplifier : immédiat)
  await supabase.from('game_events').insert({
    player_id: playerId,
    type: 'BUILDING_COMPLETED',
    data: { buildingId },
  })

  const newCredits = (resources.credits ?? 0) - cost

  res.json({
    message: `Construction de ${buildingId} lancée avec succès`,
    credits: newCredits,
  })
})
