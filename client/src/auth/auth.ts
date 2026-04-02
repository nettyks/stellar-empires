/**
 * AuthManager — Gestion de l'authentification Supabase côté client
 * Supabase gère les tokens (stockés dans localStorage)
 */

import { supabase } from '../lib/supabase'
import { config } from '../config'

export interface AuthUser {
  id: string
  email: string
  username: string
  accessToken: string
}

type AuthStateCallback = (user: AuthUser | null) => void

class AuthManager {
  private _user: AuthUser | null = null
  private _callbacks: AuthStateCallback[] = []

  get user(): AuthUser | null {
    return this._user
  }

  get token(): string | null {
    return this._user?.accessToken ?? null
  }

  onAuthChange(cb: AuthStateCallback) {
    this._callbacks.push(cb)
    // Notifier immédiatement l'état courant
    cb(this._user)
  }

  private _notify(user: AuthUser | null) {
    this._user = user
    this._callbacks.forEach(cb => cb(user))
  }

  async init() {
    // Écouter les changements de session Supabase
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const username = await this._getUsername(session.user.id)
        this._notify({
          id: session.user.id,
          email: session.user.email ?? '',
          username,
          accessToken: session.access_token,
        })
      } else {
        this._notify(null)
      }
    })

    // Récupérer la session existante
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const username = await this._getUsername(session.user.id)
      this._notify({
        id: session.user.id,
        email: session.user.email ?? '',
        username,
        accessToken: session.access_token,
      })
    }
  }

  private async _getUsername(userId: string): Promise<string> {
    // Essayer de récupérer le username via les user_metadata Supabase
    const { data: { user } } = await supabase.auth.getUser()
    return (user?.user_metadata?.username as string) ?? `Joueur_${userId.slice(0, 4)}`
  }

  async register(email: string, password: string, username: string): Promise<{ error?: string }> {
    if (username.trim().length < 2) {
      return { error: 'Le nom de secteur doit avoir au moins 2 caractères' }
    }
    if (password.length < 6) {
      return { error: 'Le mot de passe doit avoir au moins 6 caractères' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.trim() },
      },
    })

    if (error) return { error: error.message }
    if (!data.user) return { error: 'Erreur lors de la création du compte' }

    // Initialiser le joueur côté serveur
    const initError = await this._initPlayer(data.user.id, username.trim(), data.session?.access_token ?? '')
    if (initError) console.warn('[Auth] Init player warning:', initError)

    return {}
  }

  async login(email: string, password: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  async logout() {
    await supabase.auth.signOut()
  }

  private async _initPlayer(userId: string, username: string, token: string): Promise<string | null> {
    try {
      const res = await fetch(`${config.serverUrl}/api/player/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        return (json as { error?: string }).error ?? `HTTP ${res.status}`
      }
      return null
    } catch (e) {
      return String(e)
    }
  }
}

export const authManager = new AuthManager()
