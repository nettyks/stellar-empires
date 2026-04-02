# 🌌 Stellar Empires

Jeu de stratégie / économie / gestion multijoueur dans l'espace — **sans élément militaire**.  
Jouable directement dans le navigateur, temps réel via WebSockets.

**Frontend live** → https://stellar-empires.vercel.app  
**Backend live** → https://stellar-empires-production.up.railway.app/health

---

## Concept du jeu

Chaque joueur gère un **secteur spatial** (planète + colonies). L'objectif est de faire prospérer son secteur en :
- Gérant ses ressources (O2, énergie, nourriture, eau, crédits)
- Construisant des bâtiments (générateurs, habitations, centres logistiques...)
- Recherchant de nouvelles technologies (arbre tech 3 tiers)
- Commercant avec les autres joueurs
- Développant des relations diplomatiques

Pas de combat militaire — la victoire se gagne par la prospérité économique et la diplomatie.

---

## Architecture

```
stellar-empires/
├── client/          # Frontend — Vite + TypeScript + Phaser.js
├── server/          # Backend — Node.js + Express + WebSockets
├── shared/          # Types TypeScript partagés client/serveur
└── .github/
    └── workflows/
        └── deploy.yml   # CI : vérification TypeScript avant déploiement
```

### Monorepo — pas de workspace npm
Les trois packages (`client`, `server`, `shared`) sont indépendants. Ils ne partagent pas de `node_modules`. Pour lancer le projet en local, il faut `npm install` dans chaque dossier séparément.

---

## Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Frontend UI | TypeScript + HTML/CSS overlay | TS 5.3 |
| Moteur de rendu | Phaser.js (fond étoilé animé) | 3.70 |
| Build frontend | Vite | 5.0 |
| Backend | Node.js + Express | Express 4.18 |
| WebSockets | `ws` (natif Node) | 8.16 |
| Base de données | Supabase (PostgreSQL) | SDK 2.39 |
| CI/CD frontend | Vercel (auto-deploy sur push main) | — |
| CI/CD backend | Railway (déploiement après CI GitHub) | — |
| CI gate | GitHub Actions — `tsc --noEmit` | — |

---

## Infrastructure déployée

### Vercel (Frontend)
- URL : https://stellar-empires.vercel.app
- Déploiement : automatique sur chaque push sur `main`
- Build command : `cd client && npm install && npm run build`
- Output directory : `client/dist`

### Railway (Backend)
- URL : https://stellar-empires-production.up.railway.app
- Déploiement : automatique **après** que le job CI GitHub Actions passe
- Le CI vérifie `tsc --noEmit` sur `client/` ET `server/` avant de laisser Railway déployer
- Config Railway : fichier `railway.json` + `nixpacks.toml` à la racine

### Supabase (Base de données)
- Project URL : `https://phpbubhymfwielicnxwp.supabase.co`
- Les credentials sont dans les variables d'environnement Railway (voir section Variables)

---

## Variables d'environnement

### Backend (Railway + `.env` local)
```env
PORT=3001
SUPABASE_URL=https://phpbubhymfwielicnxwp.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key_depuis_supabase>
```

Le fichier `server/.env.example` contient le template.  
**Ne jamais committer le `.env` réel** — il est dans `.gitignore`.

### Frontend (Vite)
Pas de variables `.env` pour l'instant.  
L'URL du backend est détectée automatiquement via `client/src/config.ts` :
```typescript
const isDev = import.meta.env.DEV
export const config = {
  serverUrl: isDev ? 'http://localhost:3001' : 'https://stellar-empires-production.up.railway.app',
  wsUrl:     isDev ? 'ws://localhost:3001'   : 'wss://stellar-empires-production.up.railway.app'
}
```

---

## Schéma de base de données (Supabase)

5 tables existantes dans le projet Supabase :

### `players`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| username | text | Nom d'affichage |
| created_at | timestamptz | Date de création |

### `planets`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant |
| name | text | Nom de la planète |
| owner_id | uuid (FK → players) | Propriétaire actuel |
| x, y | float | Coordonnées sur la carte |
| size | int | Taille (1-10) |
| type | text | Type (tellurique, gazeuse...) |
| population | int | Population actuelle |
| colonized_at | timestamptz | Date de colonisation |

### `player_resources`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | — |
| player_id | uuid (FK → players) | — |
| credits | int | — |
| energy | int | — |
| food | int | — |
| minerals | int | — |

### `trade_offers`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | — |
| from_player_id | uuid | Vendeur |
| to_player_id | uuid | Acheteur (null = offre publique) |
| offer_resources | jsonb | Ressources proposées |
| request_resources | jsonb | Ressources demandées |
| status | text | pending / accepted / rejected |

### `game_events`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | — |
| player_id | uuid | Joueur concerné |
| type | text | Type d'événement |
| data | jsonb | Données de l'événement |
| created_at | timestamptz | — |

Les types TypeScript de cette DB sont générés dans `server/src/types/database.types.ts`.

---

## Structure détaillée des fichiers

```
client/
├── index.html                  # Point d'entrée HTML — contient TOUTE l'UI overlay
│                               # (top nav, sidebar, 5 écrans complets)
├── package.json
├── tsconfig.json
├── vite.config.ts              # Port 3000 en dev, proxy /api → localhost:3001
└── src/
    ├── main.ts                 # Init Phaser.js — fond étoilé animé
    ├── vite-env.d.ts           # Référence types Vite (import.meta.env)
    ├── config.ts               # URLs backend (dev vs prod)
    ├── scenes/
    │   ├── BootScene.ts        # Scène de chargement Phaser → lance GalaxyScene
    │   └── GalaxyScene.ts      # Fond étoilé animé (200 étoiles)
    └── ui/
        ├── styles.css          # Design system complet (variables CSS, composants)
        └── ui.ts               # UIManager — navigation entre écrans, interactions

server/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts                # Point d'entrée — Express + WebSocketServer
    ├── routes/
    │   └── game.ts             # GET /api/game/status
    ├── game/
    │   └── GameManager.ts      # Gestion WebSocket — JOIN, PLAYER_COUNT, disconnect
    ├── lib/
    │   └── supabase.ts         # Client Supabase (service_role)
    └── types/
        └── database.types.ts   # Types générés depuis le schéma Supabase

shared/
└── types.ts                    # Interfaces partagées : Player, Planet, Resources,
                                # ServerMessage, ClientMessage (types WebSocket)
```

---

## UI — Les 5 écrans implémentés

L'interface est une **overlay HTML/CSS par-dessus le canvas Phaser.js**.  
Le canvas Phaser reste en fond (fond étoilé visible sur le dashboard).

### Écran 1 : Tableau de bord (`#screen-dashboard`)
- Top nav : logo, ressources (O2, énergie, crédits, population), compteur de tour
- Sidebar gauche : navigation principale (7 entrées)
- Contenu principal : nom du secteur (SECTEUR 7-G), actions rapides, barres de ressources, alertes actives
- Panel droit : score de stabilité (/100), joueurs en ligne, bouton "Fin de tour"

### Écran 2 : Terminal Économique (`#screen-economy`)
- KPIs : revenus, dépenses, solde net du tour
- Graphique P&L SVG sur 10 tours (courbes revenus/dépenses)
- Registre des transactions (table avec catégories, montants, soldes)
- Panel politiques : 3 sliders (allocation ressources, taux d'imposition, priorité sociale)
- Prévisions du prochain tour

### Écran 3 : Centre R&D (`#screen-research`)
- Barre de recherche active (progression en %)
- Arbre technologique sur 3 niveaux :
  - **Tier 1** : Hydroponique ✅, Blindage Statique 🔄 (72%), Recyclage Avancé ✅
  - **Tier 2** : Synthèse d'Algues 🔒, Micro-Fusion 🔒, Transport Orbital 🔒
  - **Tier 3** : Noyau Quantique 🔒, Terraformation 🔒
- Panel détail technologie (cliquable, se met à jour)

### Écran 4 : Carte Stellaire (`#screen-starmap`)
- Vue tactique sombre, carte SVG avec quadrillage
- Planètes : Secteur 7-G (home, teal), ZEPHYROS (allié), NOVA-3, ARIZEL, KELDOR, MINOS (neutres), ARKTIS (rival, rouge)
- Routes commerciales (pointillés teal)
- 3 flottes : Alpha (patrouille), Bêta (extraction astéroïde C4), Gamma (exploration zone inconnue)
- Panel flottes gauche, panel détail système droit

### Écran 5 : Construction de Colonie (`#screen-construction`)
- Catalogue de 8 bâtiments (6 disponibles, 2 verrouillés)
- Panel détail du bâtiment sélectionné (coût, maintenance, production, délai)
- Bouton "Réquisitionner" fonctionnel (déduit les crédits)

---

## Design System

Inspiré du design **"THE BUREAUCRATIC INFINITE"** généré par Google Stitch.

```css
/* Couleurs principales */
--primary:          #236770  /* Teal bureaucratique */
--surface:          #f7faf8  /* Fond clair */
--bg:               #0c1a1d  /* Fond sombre (dark screens) */
--error:            #9f403d  /* Rouge erreur */

/* Typographie */
--font-body:  'Inter', sans-serif
--font-mono:  'Space Grotesk', monospace  /* Données, labels */

/* Principe */
border-radius: 0px  /* Sharp/brutalist partout */
```

Icônes : **Material Symbols Outlined** (Google Fonts, chargés via CDN).

---

## WebSocket — Protocol messages

### Serveur → Client
```typescript
{ type: 'CONNECTED', message: string }
{ type: 'JOINED', playerId: string, username: string }
{ type: 'PLAYER_COUNT', count: number }
{ type: 'ERROR', message: string }
```

### Client → Serveur
```typescript
{ type: 'JOIN', username: string }
{ type: 'COLONIZE', planetId: string }
{ type: 'TRADE', targetPlayerId: string, offer: Partial<Resources>, request: Partial<Resources> }
```

Ces types sont définis dans `shared/types.ts`.

---

## Lancer le projet en local

### Prérequis
- Node.js 20+
- npm 9+
- Compte Supabase (optionnel pour le frontend seul)

### 1. Frontend (port 3000)
```bash
cd client
npm install
npm run dev
```

### 2. Backend (port 3001)
```bash
cd server
cp .env.example .env
# Remplir SUPABASE_URL et SUPABASE_SERVICE_KEY dans .env
npm install
npm run dev
```

Le frontend proxifie automatiquement `/api` vers `localhost:3001` (config Vite).

### 3. Vérification TypeScript (CI local)
```bash
# Backend
cd server && npm install && npx tsc --noEmit

# Frontend
cd client && npm install && npx tsc --noEmit
```

---

## CI/CD Pipeline

```
git push main
    │
    ▼
GitHub Actions (.github/workflows/deploy.yml)
    ├── npm install server → tsc --noEmit
    └── npm install client → tsc --noEmit
            │
            ▼ (si CI passe)
    ┌───────────────────────────────┐
    │                               │
    ▼                               ▼
Vercel                          Railway
(frontend auto-deploy)      (backend auto-deploy)
```

**Important** : Railway est configuré pour déployer uniquement si le CI passe. Si `tsc --noEmit` échoue sur l'un des deux packages, le déploiement Railway est bloqué.

---

## Ce qui est fait ✅

- [x] Structure monorepo (client / server / shared)
- [x] Backend Express + WebSockets (Node.js 20, Railway)
- [x] Frontend Phaser.js avec fond étoilé animé (Vercel)
- [x] Intégration Supabase (client service_role, types TypeScript générés)
- [x] CI GitHub Actions (TypeScript check avant deploy)
- [x] Design system complet (CSS variables, composants)
- [x] UI overlay HTML/CSS par-dessus Phaser (5 écrans)
- [x] Navigation entre écrans (TypeScript UIManager)
- [x] Dashboard avec ressources, alertes, stabilité, joueurs en ligne
- [x] Écran Économie (graphique P&L SVG, ledger, sliders politique)
- [x] Écran R&D (arbre technologique 3 tiers interactif)
- [x] Carte Stellaire (SVG tactique, planètes, flottes, routes)
- [x] Écran Construction (catalogue bâtiments, réquisition)

---

## Ce qui reste à faire 🚧

### Priorité 1 — Connexion données réelles

- [ ] **Authentification joueurs** : écran de connexion/inscription (Supabase Auth), session persistante
- [ ] **Charger les ressources depuis Supabase** : remplacer les données statiques dans `ui.ts` par de vraies lectures de `player_resources`
- [ ] **Initialisation d'une partie** : créer un joueur + planète initiale en DB à l'inscription
- [ ] **Sauvegarder les actions** : fin de tour, construction, recherche → écriture en DB

### Priorité 2 — Logique de jeu côté serveur

- [ ] **Moteur de tour** : le serveur calcule la production de ressources à chaque fin de tour (recettes - dépenses, production O2/énergie/nourriture)
- [ ] **Système de construction** : valider et persister la construction d'un bâtiment, déduire les crédits, déclencher un timer en tours
- [ ] **Arbre technologique** : persister la progression R&D, débloquer les technologies, bonus appliqués aux calculs de tour
- [ ] **Synchronisation multijoueur** : broadcaster les événements de jeu via WebSocket à tous les joueurs connectés

### Priorité 3 — Commerce & Diplomatie

- [ ] **Écran Commerce** : afficher les offres de trade actives (`trade_offers` en DB), créer/accepter/refuser une offre
- [ ] **Écran Relations** : liste des joueurs, statut diplomatique, envoyer un message
- [ ] **Routes commerciales** : sur la carte stellaire, afficher les routes actives entre joueurs

### Priorité 4 — Polissage

- [ ] **Notifications temps réel** : les alertes du dashboard doivent venir du serveur via WebSocket
- [ ] **Animation Phaser** : utiliser la scène GalaxyScene pour animer les planètes de la carte stellaire
- [ ] **Mobile** : responsive design pour tablette
- [ ] **Son** : ambiance spatiale (Web Audio API)

---

## Contexte de développement

Ce projet a été initié et développé avec **Claude (Anthropic)** en mode Cowork.  
Les sessions précédentes ont couvert :

1. Initialisation du monorepo (client/server/shared)
2. Configuration Railway (nixpacks.toml, railway.json, package.json racine)
3. Configuration Vercel (build command, output dir)
4. Intégration Supabase (client service_role, types DB générés)
5. Correction des erreurs TypeScript CI (`rootDir`, `import.meta.env`)
6. Design system inspiré Google Stitch ("THE BUREAUCRATIC INFINITE")
7. Implémentation des 5 écrans UI en overlay Phaser.js

Pour continuer avec un LLM : lire ce README, puis lire les fichiers dans l'ordre suivant pour avoir le contexte complet :
1. `shared/types.ts`
2. `server/src/index.ts`
3. `server/src/game/GameManager.ts`
4. `client/src/config.ts`
5. `client/src/ui/ui.ts`
6. `client/index.html`

---

## Licence

Projet privé — Romain © 2026
