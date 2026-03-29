import { WebSocketServer, WebSocket } from 'ws'

interface Player {
  id: string
  ws: WebSocket
  username: string
}

export class GameManager {
  private wss: WebSocketServer
  private players: Map<string, Player> = new Map()

  constructor(wss: WebSocketServer) {
    this.wss = wss
  }

  start() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🌍 Nouveau joueur connecté')

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (e) {
          console.error('Message invalide:', e)
        }
      })

      ws.on('close', () => {
        this.handleDisconnect(ws)
      })

      ws.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'Bienvenue dans Stellar Empires !'
      }))
    })
  }

  private handleMessage(ws: WebSocket, message: { type: string; [key: string]: unknown }) {
    switch (message.type) {
      case 'JOIN':
        this.handleJoin(ws, message)
        break
      default:
        console.log('Message reçu:', message.type)
    }
  }

  private handleJoin(ws: WebSocket, message: { type: string; [key: string]: unknown }) {
    const playerId = crypto.randomUUID()
    const player: Player = {
      id: playerId,
      ws,
      username: (message.username as string) || `Joueur_${playerId.slice(0, 4)}`
    }
    this.players.set(playerId, player)

    ws.send(JSON.stringify({
      type: 'JOINED',
      playerId,
      username: player.username
    }))

    console.log(`👤 ${player.username} a rejoint la partie`)
    this.broadcastPlayerCount()
  }

  private handleDisconnect(ws: WebSocket) {
    for (const [id, player] of this.players.entries()) {
      if (player.ws === ws) {
        console.log(`👤 ${player.username} s'est déconnecté`)
        this.players.delete(id)
        break
      }
    }
    this.broadcastPlayerCount()
  }

  private broadcastPlayerCount() {
    const count = this.players.size
    const message = JSON.stringify({ type: 'PLAYER_COUNT', count })
    this.players.forEach(player => {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(message)
      }
    })
  }
}
