/**
 * Stellar Empires — UI Manager
 * Gestion de la navigation entre les écrans et des interactions UI
 * S'exécute en overlay par-dessus le canvas Phaser.js
 */

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
  private currentScreen = 'dashboard'
  private currentBuilding = 'o2gen'
  private currentTech = 'shielding'
  private currentFleet = 'alpha'
  private turn = 14
  private credits = 142847

  constructor() {
    this.init()
  }

  init() {
    // Écouter les clics sur la sidebar
    document.querySelectorAll<HTMLElement>('.sidebar-nav-item[data-screen]').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen
        if (screen) this.showScreen(screen)
      })
    })

    // Afficher le dashboard par défaut
    this.showScreen('dashboard')
  }

  showScreen(screenId: string) {
    // Cacher tous les écrans
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))

    // Activer l'écran cible
    const target = document.getElementById(`screen-${screenId}`)
    if (target) {
      target.classList.add('active')
      this.currentScreen = screenId
    }

    // Mettre à jour la sidebar
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.remove('active')
      if ((item as HTMLElement).dataset.screen === screenId) {
        item.classList.add('active')
      }
    })

    // Ajustements spécifiques par écran
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

    // Mettre à jour la sélection visuelle
    document.querySelectorAll('.building-card').forEach(card => {
      card.classList.remove('selected')
    })

    const cards = document.querySelectorAll<HTMLElement>('.building-card:not(.unavailable)')
    cards.forEach(card => {
      if (card.getAttribute('onclick')?.includes(buildingId)) {
        card.classList.add('selected')
      }
    })

    // Mettre à jour le panneau de détail
    const nameEl = document.getElementById('build-detail-name')
    const iconEl = document.getElementById('build-detail-icon')
    const descEl = document.getElementById('build-detail-desc')
    const costEl = document.getElementById('build-detail-cost')
    const upkeepEl = document.getElementById('build-detail-upkeep')
    const outputEl = document.getElementById('build-detail-output')
    const timeEl = document.getElementById('build-detail-time')
    const balanceEl = document.getElementById('build-detail-balance')
    const badgeEl = document.getElementById('build-detail-badge')

    if (nameEl) nameEl.textContent = data.name
    if (iconEl) iconEl.textContent = data.icon
    if (descEl) descEl.textContent = data.desc
    if (costEl) costEl.textContent = data.cost
    if (upkeepEl) upkeepEl.textContent = data.upkeep
    if (outputEl) outputEl.textContent = data.output
    if (timeEl) timeEl.textContent = data.time
    if (balanceEl) balanceEl.textContent = data.balance
    if (badgeEl) {
      badgeEl.textContent = data.available ? 'Disponible' : 'Verrouillé'
      badgeEl.style.background = data.available ? '' : '#ffdad7'
      badgeEl.style.color = data.available ? '' : '#9f403d'
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

  endTurn() {
    this.turn++
    this.credits += Math.floor(Math.random() * 3000 + 2000)

    const turnEl = document.getElementById('turn-counter')
    const creditsEl = document.getElementById('res-credits')

    if (turnEl) turnEl.textContent = `TOUR ${this.turn}`
    if (creditsEl) creditsEl.textContent = this.credits.toLocaleString('fr-FR')

    // Flash de feedback visuel
    const overlay = document.getElementById('ui-overlay')
    if (overlay) {
      overlay.style.transition = 'opacity 0.1s'
      overlay.style.opacity = '0.7'
      setTimeout(() => {
        overlay.style.opacity = '1'
      }, 150)
    }

    console.log(`[Stellar Empires] Tour ${this.turn} — Crédits: ${this.credits}`)
  }

  requisitionBuilding() {
    const data = BUILDINGS[this.currentBuilding]
    if (!data || !data.available) return

    const costValue = parseInt(data.cost.replace(/[^\d]/g, ''))
    if (this.credits < costValue) {
      alert('Crédits insuffisants pour cette construction.')
      return
    }

    this.credits -= costValue
    const creditsEl = document.getElementById('res-credits')
    if (creditsEl) creditsEl.textContent = this.credits.toLocaleString('fr-FR')

    console.log(`[Stellar Empires] Construction lancée: ${data.name} — Coût: ${costValue} cr`)
    alert(`Construction de "${data.name}" lancée ! Complétée dans ${data.time}.`)
  }
}

// ============================================================
// INITIALISATION
// ============================================================
// Exposer l'instance globalement pour les gestionnaires onclick HTML
declare global {
  interface Window {
    ui: UIManager
  }
}

const uiInstance = new UIManager()
window.ui = uiInstance

export { UIManager }
