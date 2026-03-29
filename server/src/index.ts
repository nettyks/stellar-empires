import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import dotenv from 'dotenv'
import { gameRouter } from './routes/game'
import { GameManager } from './game/GameManager'

dotenv.config()

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

// Middleware
app.use(cors())
app.use(express.json())

// Routes API
app.use('/api/game', gameRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Stellar Empires' })
})

// Gestionnaire de jeu (WebSockets)
const gameManager = new GameManager(wss)
gameManager.start()

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Serveur Stellar Empires démarré sur le port ${PORT}`)
})
