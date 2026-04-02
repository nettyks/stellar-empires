import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

// Extension du type Request pour exposer userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Token invalide ou expiré' })
    return
  }

  req.userId = user.id
  next()
}
