// Types partagés entre le frontend et le backend

export interface Player {
  id: string
  username: string
  createdAt: string
}

export interface Planet {
  id: string
  name: string
  ownerId: string | null
  x: number
  y: number
  resources: Resources
  population: number
}

export interface Resources {
  minerals: number
  energy: number
  food: number
  credits: number
}

// Messages WebSocket
export type ServerMessage =
  | { type: 'CONNECTED'; message: string }
  | { type: 'JOINED'; playerId: string; username: string }
  | { type: 'PLAYER_COUNT'; count: number }
  | { type: 'ERROR'; message: string }

export type ClientMessage =
  | { type: 'JOIN'; username: string }
  | { type: 'COLONIZE'; planetId: string }
  | { type: 'TRADE'; targetPlayerId: string; offer: Partial<Resources>; request: Partial<Resources> }
