# 🌌 Stellar Empires

Jeu de stratégie, économie et gestion multijoueur dans l'espace — sur navigateur.

## Stack technique

- **Frontend** : TypeScript + Phaser.js
- **Backend** : Node.js + TypeScript + WebSockets
- **Base de données** : Supabase (PostgreSQL)
- **Hébergement** : Vercel (frontend) + Railway (backend)

## Concept

Construis ton empire spatial en gérant tes ressources, en développant tes colonies et en commercant avec les autres joueurs. Pas de combat militaire — la victoire se joue sur l'économie, la diplomatie et la gestion.

## Structure du projet

```
stellar-empires/
├── client/          # Frontend Phaser.js
│   └── src/
│       ├── scenes/  # Scènes du jeu (carte galactique, planète, etc.)
│       ├── ui/      # Composants UI
│       └── assets/  # Images, sons, polices
├── server/          # Backend Node.js
│   └── src/
│       ├── game/    # Logique de jeu (ressources, tour, etc.)
│       ├── routes/  # API REST
│       └── models/  # Modèles de données
├── shared/          # Types TypeScript partagés
└── docs/            # Documentation du jeu
```

## Roadmap

- [ ] v0.1 — Carte galactique, création de compte, colonisation d'une planète
- [ ] v0.2 — Ressources, production, gestion d'une colonie
- [ ] v0.3 — Commerce entre joueurs
- [ ] v0.4 — Diplomatie et alliances
- [ ] v1.0 — Lancement multijoueur complet
