/**
 * TurnEngine — Calcul des ressources à chaque fin de tour
 * Entrée : ressources actuelles + liste des bâtiments construits
 * Sortie : nouvelles ressources + rapport du tour
 */

interface Resources {
  credits: number
  energy: number
  food: number
  minerals: number
}

interface TurnReport {
  creditsGain: number
  energyGain: number
  foodGain: number
  mineralsGain: number
  upkeepCost: number
  newResources: Resources
}

// Coût de maintenance par bâtiment (crédits/tour)
const BUILDING_UPKEEP: Record<string, number> = {
  o2gen:      320,
  hab:        480,
  logistics:  390,
  greenhouse: 260,
  energy:     720,
  research:   620,
}

export function processTurn(resources: Resources, buildings: string[]): TurnReport {
  // Revenus de base
  let creditsGain = 2000
  let energyGain  = 6
  let foodGain    = 6
  let mineralsGain = 4

  // Bonus production des bâtiments
  for (const b of buildings) {
    switch (b) {
      case 'greenhouse': foodGain    = Math.floor(foodGain * 1.18);    break
      case 'energy':     energyGain  = Math.floor(energyGain * 1.35);  break
      case 'logistics':  creditsGain = Math.floor(creditsGain * 1.20); break
      case 'hab':        creditsGain += 800;                            break
      case 'research':   break // bonus R&D géré séparément
    }
  }

  // Coût de maintenance total
  const upkeepCost = buildings.reduce((sum, b) => sum + (BUILDING_UPKEEP[b] ?? 0), 0)
  creditsGain -= upkeepCost

  // Appliquer les changements (avec planchers à 0, plafonds à 100 pour %)
  const newResources: Resources = {
    credits:  Math.max(0, resources.credits + creditsGain),
    energy:   Math.min(100, Math.max(0, resources.energy + energyGain)),
    food:     Math.min(100, Math.max(0, resources.food + foodGain)),
    minerals: Math.max(0, resources.minerals + mineralsGain),
  }

  return {
    creditsGain,
    energyGain,
    foodGain,
    mineralsGain,
    upkeepCost,
    newResources,
  }
}
