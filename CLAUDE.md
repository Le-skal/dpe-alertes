# CLAUDE CHECKPOINT — DPE Alertes

## Contexte du projet
Outil de veille DPE (Diagnostic de Performance Énergétique) permettant de configurer des alertes email paramétrées sur les nouvelles entrées de la base ADEME. Le client reçoit un email dès que de nouveaux DPE correspondant à ses critères apparaissent dans la base publique.

---

## Stack technique

| Composant | Techno | Status |
|-----------|--------|--------|
| Frontend + API | Next.js 14 (App Router) | ✅ Complet |
| Base de données | Supabase (PostgreSQL) | ✅ Complet |
| Emails | Resend | ✅ Testé |
| Cron | Vercel Cron Jobs | ✅ Configuré |
| Data source | API ADEME open data | ✅ Testé |
| Déploiement | Vercel | ✅ Déployé |

---

## Ce qui a été fait

### 1. Setup projet ✅
- [x] Projet Next.js 14 créé avec TypeScript + Tailwind
- [x] Dépendances installées : `@supabase/supabase-js`, `resend`
- [x] Configuration Tailwind v3

### 2. Variables d'environnement ✅
- [x] `.env.local` configuré avec :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `RESEND_FROM=dpe@deepskal.com`
  - `CRON_SECRET`

### 3. Base de données Supabase ✅
- [x] Projet Supabase créé
- [x] Table `alerts` créée (SQL dans `supabase/migrations/001_create_alerts.sql`)
- [x] Table `email_history` créée (SQL dans `supabase/migrations/002_create_email_history.sql`)
- [x] Data API activée, RLS désactivée sur les deux tables

### 4. Backend / API Routes ✅
- [x] `src/lib/supabase.ts` — Client Supabase
- [x] `src/lib/ademe.ts` — Requêtes API ADEME (nouveau dataset)
- [x] `src/lib/resend.ts` — Envoi emails avec template HTML stylisé
- [x] `src/lib/types.ts` — Types TypeScript
- [x] `src/app/api/alerts/route.ts` — GET (liste) + POST (créer)
- [x] `src/app/api/alerts/[id]/route.ts` — PUT (modifier) + DELETE (supprimer)
- [x] `src/app/api/alerts/[id]/test/route.ts` — POST (tester une alerte)
- [x] `src/app/api/cron/route.ts` — Job cron protégé par secret
- [x] `src/app/api/scan/route.ts` — Scan manuel avec logs + enregistrement historique
- [x] `src/app/api/history/route.ts` — GET historique des emails

### 5. Frontend ✅
- [x] `src/app/page.tsx` — Dashboard responsive (desktop + mobile)
- [x] `src/components/AlertCard.tsx` — Carte alerte avec bouton "Tester"
- [x] `src/components/AlertForm.tsx` — Formulaire création/édition
- [x] `src/components/CityAutocomplete.tsx` — Autocomplete villes via geo.api.gouv.fr
- [x] Design system "Informed Guardian" intégré
- [x] Version mobile avec bottom navigation
- [x] Onglet "Historique" (emails envoyés)
- [x] Onglet "Statistiques" avec DPE par alerte

### 6. Configuration Vercel Cron ✅
- [x] `vercel.json` — Cron tous les mardis à 8h FR (`0 6 * * 2` UTC)

---

## Fonctionnalités

### Alertes
- Créer / Modifier / Supprimer des alertes
- Activer / Désactiver (pause)
- Filtres : villes, surface, étiquettes DPE/GES, type de bâtiment
- Destinataires multiples

### Bouton "Tester l'alerte" ✅
- Prévisualise les DPE de la **dernière date de mise à jour ADEME**
- Affiche les résultats directement dans la carte
- Liens cliquables vers les fiches DPE

### Historique des emails ✅
- Enregistrement automatique à chaque envoi
- Onglet dédié avec liste des emails envoyés
- Détails : date, destinataires, nombre de DPE, résumé

### Statistiques ✅
- Total alertes / actives
- Total emails envoyés
- Total DPE trouvés
- DPE par alerte (classement)

### Archives ✅
- Onglet "En pause" (desktop) / "Emails" remplace Archive (mobile)
- Les alertes en pause restent visibles dans le dashboard

### Filtre par département ✅ (nouveau)
- Les villes sont stockées avec leur département : `Lyon|69`
- Affichage : `Lyon (69)`
- Requête ADEME filtre par `code_postal_ban:69*` (tout le département)
- Plus de problème de correspondance exacte sur les noms de villes

### Recherche avancée de villes ✅ (nouveau)
- Taper `34` → affiche les villes du département 34 triées par code postal
- Taper `34000` → trouve Montpellier directement
- Taper `lyon` → recherche par nom comme avant
- Support Corse : `2A`, `2B`

### Lien Google Maps dans les emails ✅ (nouveau)
- L'adresse est cliquable dans les emails
- Ouvre Google Maps avec l'adresse complète
- Format : `https://www.google.com/maps/search/?api=1&query=...`

### Affichage amélioré ✅ (nouveau)
- Étiquettes DPE/GES triées par ordre alphabétique (A → G) dans les cartes

---

## Ce qui a été testé

- [x] Build Next.js passe sans erreurs (`npm run build`)
- [x] Serveur de dev démarre (`npm run dev`)
- [x] Création d'une alerte via l'interface
- [x] Réception des données depuis l'API ADEME
- [x] Envoi d'email via Resend
- [x] Scan manuel via bouton dashboard
- [x] Bouton "Tester" sur une alerte
- [x] Historique des emails affiché

---

## Projet terminé ✅

### Déploiement
- [x] Initialiser Git et push sur GitHub
- [x] Connecter le repo à Vercel
- [x] Ajouter les variables d'environnement sur Vercel
- [x] Tester le cron en production

### Cron job
- **Schedule** : Mardi 8h (heure française) → `0 6 * * 2` (UTC)
- **Testé et fonctionnel**

---

## Structure du projet

```
dpe-alertes/
├── src/
│   ├── app/
│   │   ├── page.tsx                 ← Dashboard responsive
│   │   ├── layout.tsx
│   │   ├── globals.css              ← Variables CSS design system
│   │   └── api/
│   │       ├── alerts/route.ts      ← GET/POST alertes
│   │       ├── alerts/[id]/route.ts ← PUT/DELETE alerte
│   │       ├── alerts/[id]/test/route.ts ← Tester une alerte
│   │       ├── cron/route.ts        ← Job hebdomadaire (mardi 8h FR)
│   │       ├── scan/route.ts        ← Scan manuel
│   │       └── history/route.ts     ← Historique emails
│   ├── components/
│   │   ├── AlertCard.tsx            ← Avec bouton Tester
│   │   ├── AlertForm.tsx
│   │   └── CityAutocomplete.tsx     ← Autocomplete villes
│   └── lib/
│       ├── types.ts                 ← Inclut EmailHistory, DPESummary
│       ├── supabase.ts
│       ├── ademe.ts                 ← API ADEME (dataset meg-83tjwtg8dyz4vv7h1dqe)
│       └── resend.ts                ← Template email HTML
├── supabase/migrations/
│   ├── 001_create_alerts.sql
│   └── 002_create_email_history.sql
├── vercel.json
├── .env.local                       ← Configuré (ne pas commit)
└── .env.local.example
```

---

## Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Tester le scan manuellement (en local)
curl -X POST http://localhost:3000/api/scan

# Tester une alerte spécifique
curl -X POST http://localhost:3000/api/alerts/{id}/test

# Tester le cron en production
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" https://votre-app.vercel.app/api/cron
```

---

## Notes techniques

### API ADEME
- **URL** : `https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines`
- ⚠️ L'ancien dataset `dpe-v2-logements-existants` a été supprimé
- **Champs utilisés** :
  - `numero_dpe` — Numéro unique du DPE
  - `adresse_ban` — Adresse normalisée (fallback: `adresse_brut`)
  - `nom_commune_ban` — Ville
  - `code_postal_ban` — Code postal
  - `surface_habitable_logement` — Surface en m²
  - `etiquette_dpe` — Classe énergie (A-G)
  - `etiquette_ges` — Classe GES (A-G)
  - `type_batiment` — "maison" ou "appartement" (minuscules)
  - `date_derniere_modification_dpe` — Date pour le filtre
  - `conso_5_usages_par_m2_ep` — Consommation kWh/m²/an
  - `emission_ges_5_usages` — Émissions GES

### Lien fiche DPE
- **Format** : `https://observatoire-dpe-audit.ademe.fr/afficher-dpe/{numero_dpe}`
- Exemple : `https://observatoire-dpe-audit.ademe.fr/afficher-dpe/2611E0031228S`

### Autocomplete villes
- **Par nom** : `https://geo.api.gouv.fr/communes?nom={query}&fields=nom,codesPostaux&boost=population&limit=8`
- **Par département** : `https://geo.api.gouv.fr/departements/{dept}/communes?fields=nom,codesPostaux`
- **Par code postal** : `https://geo.api.gouv.fr/communes?codePostal={cp}&fields=nom,codesPostaux`
- **Stockage** : Format `Ville|Département` (ex: `Lyon|69`)

### Filtre ADEME par département
- **Syntaxe** : `code_postal_ban:69*` (wildcard sur les 2 premiers chiffres)
- Permet de couvrir tout un département sans dépendre du nom de ville

### Resend
- **Domain** : `deepskal.com` (vérifié)
- **From** : `dpe@deepskal.com`

### MCP Stitch
- Configuré dans `~/.claude/mcp_servers.json`
- Projet ID : `732320597694340856`
- Design system : "Informed Guardian"

---

## Notes de migration

### Alertes existantes (avant filtre département)
- Les anciennes alertes avec format `villes: ["Lyon"]` ne filtreront plus correctement
- **Solution** : Éditer l'alerte et re-sélectionner les villes pour obtenir le format `Lyon|69`

---

## Démo

🌐 **https://dpe.deepskal.com**
