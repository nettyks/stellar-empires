/**
 * auth-ui.ts — Contrôleur de l'écran de connexion / inscription
 * Gère les formulaires et pilote l'affichage auth vs jeu
 */

import { authManager } from './auth'

class AuthUI {
  private authOverlay = document.getElementById('auth-overlay')!
  private uiOverlay   = document.getElementById('ui-overlay')!

  constructor() {
    authManager.onAuthChange((user) => {
      if (user) {
        this._showGame(user.username)
      } else {
        this._showAuth()
      }
    })

    authManager.init()
  }

  showTab(tab: 'login' | 'register') {
    const loginForm    = document.getElementById('form-login')!
    const registerForm = document.getElementById('form-register')!
    const tabLogin     = document.getElementById('tab-login')!
    const tabRegister  = document.getElementById('tab-register')!

    if (tab === 'login') {
      loginForm.style.display    = ''
      registerForm.style.display = 'none'
      tabLogin.classList.add('active')
      tabRegister.classList.remove('active')
    } else {
      loginForm.style.display    = 'none'
      registerForm.style.display = ''
      tabLogin.classList.remove('active')
      tabRegister.classList.add('active')
    }
  }

  async login(e: Event) {
    e.preventDefault()
    const email    = (document.getElementById('login-email')    as HTMLInputElement).value
    const password = (document.getElementById('login-password') as HTMLInputElement).value
    const btn      = document.getElementById('login-btn')       as HTMLButtonElement
    const btnText  = document.getElementById('login-btn-text')!
    const errEl    = document.getElementById('login-error')!

    btn.disabled   = true
    btnText.textContent = 'Connexion en cours…'
    errEl.style.display = 'none'

    const { error } = await authManager.login(email, password)

    if (error) {
      errEl.textContent   = error
      errEl.style.display = 'block'
      btn.disabled        = false
      btnText.textContent = 'Accéder au Commandement'
    }
    // Si succès, onAuthChange s'en charge automatiquement
  }

  async register(e: Event) {
    e.preventDefault()
    const username = (document.getElementById('reg-username') as HTMLInputElement).value
    const email    = (document.getElementById('reg-email')    as HTMLInputElement).value
    const password = (document.getElementById('reg-password') as HTMLInputElement).value
    const btn      = document.getElementById('register-btn')  as HTMLButtonElement
    const btnText  = document.getElementById('register-btn-text')!
    const errEl    = document.getElementById('register-error')!

    btn.disabled   = true
    btnText.textContent = 'Fondation en cours…'
    errEl.style.display = 'none'

    const { error } = await authManager.register(email, password, username)

    if (error) {
      errEl.textContent   = error
      errEl.style.display = 'block'
      btn.disabled        = false
      btnText.textContent = 'Fonder mon Secteur'
    }
    // Si succès, onAuthChange s'en charge automatiquement
  }

  async logout() {
    await authManager.logout()
  }

  private _showGame(username: string) {
    if (this.authOverlay) this.authOverlay.style.display = 'none'
    if (this.uiOverlay)   this.uiOverlay.style.display   = ''

    // Mettre à jour le nom dans la sidebar
    const nameEl   = document.getElementById('sidebar-username')
    const avatarEl = document.getElementById('sidebar-avatar')
    if (nameEl)   nameEl.textContent   = username
    if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase()

    // Déclencher le chargement des données réelles
    window.dispatchEvent(new CustomEvent('stellar:auth-ready', { detail: { token: authManager.token } }))
  }

  private _showAuth() {
    if (this.uiOverlay)   this.uiOverlay.style.display   = 'none'
    if (this.authOverlay) this.authOverlay.style.display  = ''
  }
}

const authUI = new AuthUI()

// Exposer globalement pour les onclick HTML
declare global {
  interface Window { authUI: AuthUI }
}
window.authUI = authUI
