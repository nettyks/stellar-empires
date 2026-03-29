import { Router } from 'express'

export const gameRouter = Router()

gameRouter.get('/status', (_req, res) => {
  res.json({
    name: 'Stellar Empires',
    version: '0.1.0',
    status: 'en développement'
  })
})
