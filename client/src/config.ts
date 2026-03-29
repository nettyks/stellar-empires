// Configuration de l'environnement
const isDev = import.meta.env.DEV

export const config = {
  serverUrl: isDev
    ? 'http://localhost:3001'
    : 'https://stellar-empires-production.up.railway.app',

  wsUrl: isDev
    ? 'ws://localhost:3001'
    : 'wss://stellar-empires-production.up.railway.app'
}
