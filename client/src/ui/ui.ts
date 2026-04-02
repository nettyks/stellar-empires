/**
 * Stellar Empires — UI Manager
 * Gestion de la navigation entre les écrans et des interactions UI
 * S'exécute en overlay par-dessus le canvas Phaser.js
 */

import { config } from '../config'
import { authManager } from '../auth/auth'

interface BuildingData {
  name: string
  desc: string
  icon: string
  cost: string
  upkeep: string
  output: string
  time: string
  balance: string
  available: boolean
}

interface TechData {
  name: string
  icon: string
  desc: string
  status: string
}

interface PlayerState {
  player: { id: string; username: string; score: number }
  resources: { credits: number; energy: number; food: number; minerals: number }
  planet: { id: string; name: string; population: number; type: string } | null
  turn: number
  buildings: string[]
}

// ============================================================
// DONNÉES DES BÂTIMENTS
// ============================================================
const BUILDINGS: Record<string, BuildingData> = {
  o2gen: {
    name: 'Générateur O2',
    desc: "Produit de l'oxygène par électrolyse de l'eau. Capacité pour 500 habitants. Maintenance régulière requise.",
    icon: 'air',
    cost: '8 400 cr',
    upkeep: '-320 cr',
    output: '+12% O2 / tour',
    time: '2 tours',
    balance: '134 447 cr',
    available: true,
  },
  hab: {
    name: 'Module Habitation',
    desc: 'Logements pour 200 nouveaux colons. Augmente la satisfaction de la population et génère des revenus fiscaux.',
    icon: 'apartment',
    cost: '12 200 cr',
    upkeep: '-480 cr',
    output: '+200 pop. / tour',
    time: '3 tours',
    balance: '130 647 cr',
    available: true,
  },
  logistics: {
    name: 'Centre Logistique',
    desc: 'Hub de distribution qui optimise les routes commerciales et réduit les coûts de transport de 20%.',
    icon: 'local_shipping',
    cost: '9 800 cr',
    upkeep: '-390 cr',
    output: '-20% coûts transport',
    time: '2 tours',
    balance: '133 047 cr',
    available: true,
  },
  greenhouse: {
    name: 'Serre Hydroponique',
    desc: "Culture alimentaire en apesanteur par technologie hydroponique. Résout la pénurie alimentaire du secteur.",
    icon: 'grass',
    cost: '6 600 cr',
    upkeep: '-260 cr',
    output: '+18% nourriture / tour',
    time: '2 tours',
    balance: '136 247 cr',
    available: true,
  },
  energy: {
    name: 'Réacteur Énergétique',
    desc: 'Réacteur à fusion contrôlée de deuxième génération. Produit une énergie stable et abondante.',
    icon: 'bolt',
    cost: '18 000 cr',
    upkeep: '-720 cr',
    output: '+35% énergie / tour',
    time: '4 tours',
    balance: '124 847 cr',
    available: true,
  },
  research: {
    name: 'Centre R&D',
    desc: 'Laboratoire de recherche avancée. Accélère la progression de l\'arbre technologique de 15%.',
    icon: 'science',
    cost: '15 500 cr',
    upkeep: '-620 cr',
    output: '+15% vitesse R&D',
    time: '3 tours',
    balance: '127 347 cr',
    available: true,
  },
  port: {
    name: 'Port Spatial',
    desc: 'Hub spatial de niveau 3 permettant le commerce avec les secteurs éloignés. Débloque les routes longue distance.',
    icon: 'anchor',
    cost: '42 000 cr',
    upkeep: '-1 680 cr',
    output: 'Déblocage commerce LR',
    time: '6 tours',
    balance: 'Fonds insuffisants',
    available: false,
  },
}

// ============================================================
// DONNÉES TECHNOLOGIQUES
// ============================================================
const TECHS: Record<string, TechData> = {
  hydroponics: {
    name: 'Hydroponique',
    icon: 'grass',
    desc: 'Culture alimentaire en microgravité. Permet la production alimentaire dans les modules pressurisés. Complété au tour 8.',
    status: 'Complété',
  },
  shielding: {
    name: 'Blindage Statique',
    icon: 'shield',
    desc: 'Protection avancée des modules contre les radiations solaires. Réduit les coûts de maintenance de 15% et augmente la durabilité de 30%.',
    status: 'En cours (72%)',
  },
  recycling: {
    name: 'Recyclage Avancé',
    icon: 'recycling',
    desc: 'Système de récupération et réutilisation des matériaux. Réduit les déchets de 40% et diminue les coûts de production.',
    status: 'Complété',
  },
  algae: {
    name: "Synthèse d'Algues",
    icon: 'water',
    desc: 'Production O2 par photosynthèse à grande échelle. Prérequis: Blindage Statique (Niv. 1).',
    status: 'Verrouillé',
  },
  fusion: {
    name: 'Micro-Fusion',
    icon: 'local_fire_department',
    desc: 'Génération d\'énergie à haute densité par fusion nucléaire miniaturisée. Prérequis: Recyclage Avancé.',
    status: 'Verrouillé',
  },
  transport: {
    name: 'Transport Orbital',
    icon: 'rocket_launch',
    desc: 'Infrastructure pour le commerce inter-sectoriel longue distance. Prérequis: Centre Logistique construit.',
    status: 'Verrouillé',
  },
  quantum: {
    name: 'Noyau Quantique',
    icon: 'memory',
    desc: 'Système de traitement computationnel quantique. Débloque les technologies de niveau 4.',
    status: 'Verrouillé',
  },
  terraforming: {
    name: 'Terraformation',
    icon: 'public',
    desc: 'Modification environnementale à l\'échelle planétaire. Technologie ultime permettant la colonisation de planètes hostiles.',
    status: 'Verrouillé',
  },
}

// ============================================================
// UI MANAGER
// ============================================================
class UIManager {
  private currentScreen  = 'dashboard'
  private currentBuilding = 'o2gen'
  private currentTech    = 'shielding'
  private currentFleet   = 'alpha'
  private turn           = 1
  private credits        = 0
  private constructedBuildings: Set<string> = new Set()

  constructor() {
    this.init()
    // Charger les données réelles dès que l'auth est prête
    window.addEventListener('stellar:auth-ready', () => {
      this.loadPlayerState()
    })
  }

  init() {
    document.querySelectorAll<HTMLElement>('.sidebar-nav-item[data-screen]').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen
        if (screen) this.showScreen(screen)
      })
    })
    this.showScreen('dashboard')
  }

  // ----------------------------------------------------------
  // Chargement des données réelles depuis le serveur
  // ----------------------------------------------------------
  async loadPlayerState() {
    const token = authManager.token
    if (!token) return

    try {
      const res = await fetch(`${config.serverUrl}/api/player/state`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.error('[UI] Erreur chargement état joueur:', res.status)
        return
      }

      const state: PlayerState = await res.json()
      this._applyState(state)
    } catch (e) {
      console.error('[UI] Erreur réseau:', e)
    }
  }

  private _applyState(state: PlayerState) {
    this.turn    = state.turn
    this.credits = state.resources.credits
    this.constructedBuildings = new Set(state.buildings)

    // Mettre à jour le compteur de tour
    const turnEl = document.getElementById('turn-counter')
    if (turnEl) turnEl.textContent = `TOUR ${this.turn}`

    // Mettre à jour les ressources dans la top nav
    const creditsEl = document.getElementById('res-credits')
    if (creditsEl) creditsEl.textContent = this.credits.toLocaleString('fr-FR')

    const energyEl    = document.getElementById('res-energy')
    const energyBarEl = document.getElementById('res-energy-bar')
    if (energyEl)    energyEl.textContent    = `${state.resources.energy}%`
    if (energyBarEl) energyBarEl.style.width = `${state.resources.energy}%`

    const o2El    = document.getElementById('res-o2')
    const o2BarEl = document.getElementById('res-o2-bar')
    // O2 calculé comme proxy de food
    const o2 = state.resources.food
    if (o2El)    o2El.textContent    = `${o2}%`
    if (o2BarEl) o2BarEl.style.width = `${o2}%`

    const popEl = document.getElementById('res-pop')
    if (popEl && state.planet) popEl.textContent = state.planet.population.toLocaleString('fr-FR')

    // Mettre à jour le nom du secteur
    const sectorNameEl = document.querySelector('.sector-name')
    if (sectorNameEl && state.planet) sectorNameEl.textContent = state.planet.name

    // Mettre à jour le badge tour dans le dashboard
    const dashTourBadge = document.querySelector('.panel-badge-dark')
    if (dashTourBadge) dashTourBadge.textContent = `TOUR ${this.turn}`

    // Marquer les bâtiments construits comme déjà acquis
    this._refreshBuildingCards()

    console.log(`[Stellar Empires] État chargé — Tour ${this.turn} — ${this.credits.toLocaleString('fr-FR')} cr`)
  }

  private _refreshBuildingCards() {
    document.querySelectorAll<HTMLElement>('.building-card').forEach(card => {
      const onclick = card.getAttribute('onclick') ?? ''
      const match = onclick.match(/selectBuilding\('(\w+)'\)/)
      if (match) {
        const bId = match[1]
        if (this.constructedBuildings.has(bId)) {
          card.classList.add('constructed')
          card.setAttribute('title', 'Bâtiment construit')
        }
      }
    })
  }

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------
  showScreen(screenId: string) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))

    const target = document.getElementById(`screen-${screenId}`)
    if (target) {
      target.classList.add('active')
      this.currentScreen = screenId
    }

    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.remove('active')
      if ((item as HTMLElement).dataset.screen === screenId) {
        item.classList.add('active')
      }
    })

    if (screenId === 'starmap') {
      document.getElementById('content-area')!.style.background = 'transparent'
    } else {
      document.getElementById('content-area')!.style.background = ''
    }
  }

  selectBuilding(buildingId: string) {
    this.currentBuilding = buildingId
    const data = BUILDINGS[buildingId]
    if (!data) return

    document.querySelectorAll('.building-card').forEach(card => {
      card.classList.remove('selected')
    })

    const cards = document.querySelectorAll<HTMLElement>('.building-card:not(.unavailable)')
    cards.forEach(card => {
      if (card.getAttribute('onclick')?.includes(buildingId)) {
        card.classList.add('selected')
      }
    })

    const nameEl    = document.getElementById('build-detail-name')
    const iconEl    = document.getElementById('build-detail-icon')
    const descEl    = document.getElementById('build-detail-desc')
    const costEl    = document.getElementById('build-detail-cost')
    const upkeepEl  = document.getElementById('build-detail-upkeep')
    const outputEl  = document.getElementById('build-detail-output')
    const timeEl    = document.getElementById('build-detail-time')
    const balanceEl = document.getElementById('build-detail-balance')
    const badgeEl   = document.getElementById('build-detail-badge')

    // Afficher le solde après déduction réel
    const costValue = parseInt(data.cost.replace(/[^\d]/g, ''))
    const afterBalance = this.constructedBuildings.has(buildingId)
      ? 'Déjà construit'
      : this.credits >= costValue
        ? `${(this.credits - costValue).toLocaleString('fr-FR')} cr`
        : 'Fonds insuffisants'

    if (nameEl)    nameEl.textContent    = data.name
    if (iconEl)    iconEl.textContent    = data.icon
    if (descEl)    descEl.textContent    = data.desc
    if (costEl)    costEl.textContent    = data.cost
    if (upkeepEl)  upkeepEl.textContent  = data.upkeep
    if (outputEl)  outputEl.textContent  = data.output
    if (timeEl)    timeEl.textContent    = data.time
    if (balanceEl) balanceEl.textContent = afterBalance

    if (badgeEl) {
      const isBuilt = this.constructedBuildings.has(buildingId)
      badgeEl.textContent = isBuilt ? 'Construit' : data.available ? 'Disponible' : 'Verrouillé'
      badgeEl.style.background = isBuilt ? '#c4eaf0' : data.available ? '' : '#ffdad7'
      badgeEl.style.color = isBuilt ? '#1a4f56' : data.available ? '' : '#9f403d'
    }
  }

  selectTech(techId: string) {
    this.currentTech = techId
    const data = TECHS[techId]
    if (!data) return

    const nameEl = document.getElementById('tech-detail-name')
    const iconEl = document.getElementById('tech-detail-icon')
    const descEl = document.getElementById('tech-detail-desc')

    if (nameEl) nameEl.textContent = data.name
    if (iconEl) iconEl.textContent = data.icon
    if (descEl) descEl.textContent = data.desc
  }

  selectFleet(fleetId: string) {
    this.currentFleet = fleetId
    document.querySelectorAll('.fleet-item').forEach(item => {
      item.classList.remove('selected')
      if ((item as HTMLElement).getAttribute('onclick')?.includes(fleetId)) {
        item.classList.add('selected')
      }
    })
  }

  async endTurn() {
    const token = authManager.token
    if (!token) {
      alert('Vous devez être connecté pour terminer un tour.')
      return
    }

    try {
      const res = await fetch(`${config.serverUrl}/api/game/end-turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        console.error('[UI] Erreur fin de tour:', json)
        return
      }

      const data = await res.json() as {
        report: { creditsGain: number; energyGain: number; foodGain: number; mineralsGain: number }
        resources: { credits: number; energy: number; food: number; minerals: number }
      }

      this.turn++
      this.credits = data.resources.credits

      // Mettre à jour l'UI
      const turnEl    = document.getElementById('turn-counter')
      const creditsEl = document.getElementById('res-credits')
      const energyEl  = document.getElementById('res-energy')
      const energyBar = document.getElementById('res-energy-bar')
      const o2El      = document.getElementById('res-o2')
      const o2Bar     = document.getElementById('res-o2-bar')

      if (turnEl)    turnEl.textContent    = `TOUR ${this.turn}`
      if (creditsEl) creditsEl.textContent = this.credits.toLocaleString('fr-FR')
      if (energyEl)  energyEl.textContent  = `${data.resources.energy}%`
      if (energyBar) energyBar.style.width = `${data.resources.energy}%`
      if (o2El)      o2El.textContent      = `${data.resources.food}%`
      if (o2Bar)     o2Bar.style.width     = `${data.resources.food}%`

      // Badge dashboard
      const dashTourBadge = document.querySelector('.panel-badge-dark')
      if (dashTourBadge) dashTourBadge.textContent = `TOUR ${this.turn}`

      // Flash visuel
      const overlay = document.getElementById('ui-overlay')
      if (overlay) {
        overlay.style.transition = 'opacity 0.1s'
        overlay.style.opacity = '0.7'
        setTimeout(() => { overlay.style.opacity = '1' }, 150)
      }

      const gain = data.report.creditsGain
      console.log(`[Stellar Empires] Tour ${this.turn} — +${gain.toLocaleString('fr-FR')} cr — Total: ${this.credits.toLocaleString('fr-FR')} cr`)
    } catch (e) {
      console.error('[UI] Erreur réseau fin de tour:', e)
    }
  }

  async requisitionBuilding() {
    const data = BUILDINGS[this.currentBuilding]
    if (!data || !data.available) return

    if (this.constructedBuildings.has(this.currentBuilding)) {
      alert('Ce bâtiment est déjà construit.')
      return
    }

    const token = authManager.token
    if (!token) {
      alert('Vous devez être connecté.')
      return
    }

    const costValue = parseInt(data.cost.replace(/[^\d]/g, ''))
    if (this.credits < costValue) {
      alert('Crédits insuffisants pour cette construction.')
      return
    }

    try {
      const res = await fetch(`${config.serverUrl}/api/game/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ buildingId: this.currentBuilding }),
      })

      const json = await res.json() as { error?: string; credits?: number; message?: string }

      if (!res.ok) {
        alert(json.error ?? 'Erreur lors de la construction.')
        return
      }

      this.credits = json.credits ?? this.credits - costValue
      this.constructedBuildings.add(this.currentBuilding)

      const creditsEl = document.getElementById('res-credits')
      if (creditsEl) creditsEl.textContent = this.credits.toLocaleString('fr-FR')

      this._refreshBuildingCards()
      this.selectBuilding(this.currentBuilding) // rafraîchir le panneau détail

      console.log(`[Stellar Empires] Construction lancée: ${data.name} — Coût: ${costValue} cr`)
      alert(`Construction de "${data.name}" lancée !`)
    } catch (e) {
      console.error('[UI] Erreur réseau construction:', e)
    }
  }
}

// ============================================================
// INITIALISATION
// ============================================================
declare global {
  interface Window {
    ui: UIManager
  }
}

const uiInstance = new UIManager()
window.ui = uiInstance

export { UIManager }
