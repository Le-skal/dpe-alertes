<div align="center">

# DPE Monitor
### *Surveillance automatisée des diagnostics de performance énergétique*

<p><em>Recevez des alertes email dès qu'un nouveau DPE correspond à vos critères</em></p>

### [🌐 Démo En Ligne](https://dpe.deepskal.com)

![Status](https://img.shields.io/badge/status-operational-success?style=flat)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat)

<p><em>Built with:</em></p>

![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat&logo=supabase&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-Email-000000?style=flat)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat&logo=vercel&logoColor=white)

<p><em>Data sources:</em></p>

![ADEME](https://img.shields.io/badge/ADEME-Open_Data-00A86B?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNy45M2MtMy45NS0uNDktNy0zLjg1LTctNy45MyAwLS42Mi4wOC0xLjIxLjIxLTEuNzlMOSAxNXYxYzAgMS4xLjkgMiAyIDJ2MS45M3ptNi45LTIuNTRjLS4yNi0uODEtMS0xLjM5LTEuOS0xLjM5aC0xdi0zYzAtLjU1LS40NS0xLTEtMUg4di0yaDJjLjU1IDAgMS0uNDUgMS0xVjdoMmMxLjEgMCAyLS45IDItMnYtLjQxYzIuOTMgMS4xOSA1IDQuMDYgNSA3LjQxIDAgMi4wOC0uOCAzLjk3LTIuMSA1LjM5eiIvPjwvc3ZnPg==)
![API Geo](https://img.shields.io/badge/API_Geo-Gouv.fr-000091?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzguMTMgMiA1IDUuMTMgNSA5YzAgNS4yNSA3IDEzIDcgMTNzNy03Ljc1IDctMTNjMC0zLjg3LTMuMTMtNy03LTd6bTAgOS41Yy0xLjM4IDAtMi41LTEuMTItMi41LTIuNXMxLjEyLTIuNSAyLjUtMi41IDIuNSAxLjEyIDIuNSAyLjUtMS4xMiAyLjUtMi41IDIuNXoiLz48L3N2Zz4=)

<p><em>Features:</em></p>

![Responsive](https://img.shields.io/badge/Responsive-Mobile_Ready-FF6B6B?style=flat&logo=smartphone&logoColor=white)
![Cron](https://img.shields.io/badge/Cron-Weekly_Scan-9B59B6?style=flat&logo=clockify&logoColor=white)
![Email](https://img.shields.io/badge/Email-Alerts-F39C12?style=flat&logo=gmail&logoColor=white)

---

</div>

## Qu'est-ce que c'est ?

**DPE Monitor** est un outil de veille immobilière qui surveille automatiquement les nouveaux DPE (Diagnostic de Performance Énergétique) publiés sur la base de données publique de l'ADEME.

### Le problème résolu

Lorsqu'un bien immobilier est vendu ou loué, un DPE est obligatoirement réalisé et enregistré dans la base nationale. Ces données sont publiques mais difficiles à exploiter manuellement. DPE Monitor automatise cette veille en vous envoyant un email récapitulatif dès que de nouveaux DPE correspondent à vos critères de recherche.

### Cas d'usage

- **Agents immobiliers** : Identifier les biens récemment diagnostiqués dans une zone
- **Courtiers en travaux** : Cibler les logements énergivores (classe F/G) pour proposer des rénovations
- **Investisseurs** : Surveiller les opportunités dans des villes spécifiques
- **Particuliers** : Être alerté des nouveaux biens disponibles dans un secteur

---

## Comment ça fonctionne ?

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUX DE FONCTIONNEMENT                       │
└─────────────────────────────────────────────────────────────────────┘

   1. CONFIGURATION                2. SCAN AUTOMATIQUE              3. NOTIFICATION
   ┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐
   │  Dashboard  │                 │  Cron Job   │                 │   Email     │
   │             │                 │  (Mardi 8h) │                 │   Resend    │
   │ - Villes    │      ───►       │             │      ───►       │             │
   │ - Surface   │                 │ Compare les │                 │ Liste des   │
   │ - Étiquette │                 │ nouveaux    │                 │ nouveaux    │
   │ - Type bien │                 │ DPE ADEME   │                 │ DPE trouvés │
   └─────────────┘                 └─────────────┘                 └─────────────┘
         │                               │                               │
         │                               │                               │
         ▼                               ▼                               ▼
   ┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐
   │  Supabase   │                 │  API ADEME  │                 │ Observatoire│
   │  (alertes)  │                 │  Open Data  │                 │    DPE      │
   └─────────────┘                 └─────────────┘                 └─────────────┘
```

### Étapes détaillées

1. **Création d'alerte** : Via l'interface web, vous configurez vos critères (villes, surface min/max, étiquettes DPE/GES, type de bâtiment)

2. **Scan hebdomadaire** : Chaque mardi à 8h, un cron job interroge l'API ADEME pour récupérer les DPE des 7 derniers jours

3. **Filtrage** : Les nouveaux DPE sont comparés aux critères de chaque alerte active

4. **Envoi email** : Si des correspondances sont trouvées, un email HTML est envoyé avec la liste des DPE et un lien vers chaque fiche détaillée

5. **Historique** : Chaque email envoyé est enregistré pour consultation ultérieure

---

## Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Alertes personnalisées** | Filtres par ville, surface, étiquettes DPE/GES, type de bien |
| **Scan automatique** | Cron job tous les mardis à 8h (heure française) |
| **Scan manuel** | Bouton pour déclencher un scan immédiat |
| **Test d'alerte** | Prévisualiser les résultats avant d'attendre le prochain scan |
| **Historique** | Consulter tous les emails envoyés avec détails des DPE |
| **Statistiques** | Vue d'ensemble : emails envoyés, DPE trouvés par alerte |
| **Responsive** | Interface adaptée desktop et mobile |

---

## Sources de données

### API ADEME - Base DPE nationale

L'ADEME (Agence de l'Environnement et de la Maîtrise de l'Énergie) publie en open data l'ensemble des DPE réalisés en France.

| Ressource | Lien |
|-----------|------|
| **Portail Open Data ADEME** | [data.ademe.fr](https://data.ademe.fr/) |
| **Dataset utilisé** | [DPE Logements](https://data.ademe.fr/datasets/meg-83tjwtg8dyz4vv7h1dqe) |
| **Documentation API** | [API Data Fair](https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/api-docs) |
| **Endpoint** | `https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines` |

### Observatoire DPE - Fiches détaillées

Chaque DPE possède une fiche détaillée consultable sur l'Observatoire DPE officiel.

| Ressource | Lien |
|-----------|------|
| **Observatoire DPE** | [observatoire-dpe-audit.ademe.fr](https://observatoire-dpe-audit.ademe.fr/) |
| **Format fiche DPE** | `https://observatoire-dpe-audit.ademe.fr/afficher-dpe/{numero_dpe}` |

### API Géo Gouv - Autocomplete villes

L'autocomplétion des villes utilise l'API officielle du gouvernement.

| Ressource | Lien |
|-----------|------|
| **API Géo** | [geo.api.gouv.fr](https://geo.api.gouv.fr/) |
| **Documentation** | [Documentation communes](https://geo.api.gouv.fr/decoupage-administratif/communes) |
| **Endpoint** | `https://geo.api.gouv.fr/communes?nom={query}&limit=5` |

---

## Champs DPE utilisés

| Champ API | Description | Exemple |
|-----------|-------------|---------|
| `numero_dpe` | Identifiant unique du DPE | `2611E0031228S` |
| `adresse_ban` | Adresse normalisée (BAN) | `12 Rue de la Paix` |
| `nom_commune_ban` | Ville | `Paris` |
| `code_postal_ban` | Code postal | `75002` |
| `surface_habitable_logement` | Surface en m² | `65` |
| `etiquette_dpe` | Classe énergie (A-G) | `D` |
| `etiquette_ges` | Classe GES (A-G) | `E` |
| `type_batiment` | Type de bien | `maison` ou `appartement` |
| `date_derniere_modification_dpe` | Date de publication | `2024-01-15` |
| `conso_5_usages_par_m2_ep` | Consommation kWh/m²/an | `180` |
| `emission_ges_5_usages` | Émissions GES kg CO2/m²/an | `35` |

---

## Stack technique

```
Frontend       → Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend        → API Routes Next.js
Base de données → Supabase (PostgreSQL)
Emails         → Resend
Cron           → Vercel Cron Jobs
Data source    → API ADEME Open Data
```

---

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

---

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

---

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

# Déclencher le cron en production (avec authentification)
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" https://votre-app.vercel.app/api/cron
```

---

## Déploiement Vercel

1. Connecter le repo GitHub à Vercel
2. Ajouter les variables d'environnement
3. Le cron s'exécutera automatiquement tous les mardis à 8h (configuré dans `vercel.json`)

---

## Licence

MIT

---

<div align="center">

**DPE Monitor** - 2024

[API ADEME](https://data.ademe.fr/) · [Observatoire DPE](https://observatoire-dpe-audit.ademe.fr/) · [API Géo](https://geo.api.gouv.fr/)

</div>
