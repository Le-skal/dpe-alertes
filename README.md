<div align="center">

# DPE Monitor
### *Surveillance automatisée des diagnostics de performance énergétique*

<p><em>Recevez des alertes email dès qu'un nouveau DPE correspond à vos critères</em></p>

![Status](https://img.shields.io/badge/status-operational-success?style=flat)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)

<p><em>Built with:</em></p>

![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat&logo=supabase&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-Email-000000?style=flat)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat&logo=vercel&logoColor=white)

---

</div>

## Objectif

Outil de veille immobilière permettant de surveiller les nouveaux DPE (Diagnostic de Performance Énergétique) publiés sur la base ADEME. Configurez vos critères et recevez un email récapitulatif chaque semaine.

## Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Alertes personnalisées** | Filtres par ville, surface, étiquettes DPE/GES, type de bien |
| **Scan automatique** | Cron job tous les mardis à 8h |
| **Scan manuel** | Bouton pour déclencher un scan immédiat |
| **Test d'alerte** | Prévisualiser les résultats avant d'attendre le prochain scan |
| **Historique** | Consulter tous les emails envoyés avec détails des DPE |
| **Statistiques** | Vue d'ensemble : emails envoyés, DPE trouvés par alerte |
| **Responsive** | Interface adaptée desktop et mobile |

## Stack technique

```
Frontend       → Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend        → API Routes Next.js
Base de données → Supabase (PostgreSQL)
Emails         → Resend
Cron           → Vercel Cron Jobs
Data source    → API ADEME Open Data
```

## Structure du projet

```
dpe-alertes/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Dashboard responsive
│   │   ├── globals.css              # Design system CSS
│   │   └── api/
│   │       ├── alerts/              # CRUD alertes
│   │       ├── alerts/[id]/test/    # Tester une alerte
│   │       ├── scan/                # Scan manuel
│   │       ├── history/             # Historique emails
│   │       └── cron/                # Job automatique
│   ├── components/
│   │   ├── AlertCard.tsx            # Carte alerte avec bouton Test
│   │   ├── AlertForm.tsx            # Formulaire création/édition
│   │   └── CityAutocomplete.tsx     # Autocomplete villes
│   └── lib/
│       ├── types.ts                 # Types TypeScript
│       ├── supabase.ts              # Client Supabase
│       ├── ademe.ts                 # API ADEME
│       └── resend.ts                # Template email HTML
├── supabase/migrations/
│   ├── 001_create_alerts.sql
│   └── 002_create_email_history.sql
└── vercel.json                      # Config cron
```

## Installation

```bash
# Cloner le repo
git clone https://github.com/Le-skal/dpe-alertes.git
cd dpe-alertes

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Puis éditer .env.local avec vos clés
```

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
RESEND_API_KEY=re_xxx
RESEND_FROM=dpe@votredomaine.com
CRON_SECRET=votre-secret-pour-cron
```

### Configuration Supabase

Exécuter les migrations SQL dans l'ordre :
1. `supabase/migrations/001_create_alerts.sql`
2. `supabase/migrations/002_create_email_history.sql`

Puis désactiver RLS sur les deux tables.

## Usage

### Développement

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Commandes utiles

```bash
# Lancer un scan manuellement
curl -X POST http://localhost:3000/api/scan

# Tester une alerte spécifique
curl -X POST http://localhost:3000/api/alerts/{id}/test
```

## API ADEME

Le projet utilise l'API Open Data de l'ADEME pour récupérer les DPE.

- **Dataset** : `meg-83tjwtg8dyz4vv7h1dqe`
- **Endpoint** : `https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines`

### Champs utilisés

| Champ | Description |
|-------|-------------|
| `numero_dpe` | Identifiant unique |
| `adresse_ban` | Adresse normalisée |
| `nom_commune_ban` | Ville |
| `surface_habitable_logement` | Surface en m² |
| `etiquette_dpe` | Classe énergie (A-G) |
| `etiquette_ges` | Classe GES (A-G) |
| `type_batiment` | "maison" ou "appartement" |
| `date_derniere_modification_dpe` | Date de publication |

## Déploiement Vercel

1. Connecter le repo GitHub à Vercel
2. Ajouter les variables d'environnement
3. Le cron s'exécutera automatiquement tous les mardis à 8h

---

<div align="center">

**Projet DPE Monitor** - 2026

</div>
