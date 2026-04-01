# TODO - DPE Alertes V2

## 1. Authentification

- [ ] **Login Google OAuth** - Implémenter une page de connexion avec Google
  - Restreindre l'accès aux emails du domaine `@6-49.im` uniquement
  - Exemple autorisé : `john123@6-49.im`

---

## 2. Système de notifications

- [x] **Cron quotidien** - Changer le cron pour vérifier tous les jours (au lieu de mardi seulement)
  - Si la base ADEME est mise à jour → envoyer le mail à 8h
  - Sinon → ne rien envoyer

---

## 3. Adresse postale précise

- [x] **Filtrer par adresse exacte** - Ne plus utiliser seulement les 2 premiers chiffres du code postal
  - Stockage format `Ville|CodePostal` (ex: `Lyon|69001`)
  - Filtre par code postal exact dans l'API ADEME

---

## 4. Nouveaux filtres à ajouter

### Dates
- [x] Filtre sur `date_visite_diagnostiqueur`
  - Dropdown "Mode de surveillance" : Alertes / Entre 2 dates / Depuis / Tous
  - Champs conditionnels selon le mode sélectionné

### Chauffage / ECS
- [x] Filtre sur `type_installation_chauffage`
- [x] Filtre sur `type_installation_ecs`
- [x] Filtre sur `type_energie_n1`
- [x] Filtre sur `volume_stockage_generateur_n1_ecs_n1`

### Bâtiment
- [x] Filtre sur `hauteur_sous_plafond`
- [x] Filtre sur `nombre_appartement`
- [x] Filtre sur `nombre_niveau_immeuble`
- [x] Filtre sur `numero_etage_appartement`
- [x] Filtre sur `typologie_logement`
- [x] Filtre sur ratio `surface_habitable_logement / surface_habitable_immeuble`

### Confort / Isolation
- [x] Filtre sur `indicateur_confort_ete`
- [x] Filtre sur `logement_traversant`
- [x] Filtre sur `isolation_toiture`
- [x] Filtre sur `qualite_isolation_plancher_haut_comble_perdu`
- [x] Filtre sur `type_ventilation`

### Consommation / Emissions
- [x] Filtre sur `conso_5_usages_par_m2_ep`
- [x] Filtre sur `emission_ges_5_usages` (par m2)

---

## 5. Nouveaux champs à afficher dans les emails

### Infos générales
- [x] `date_visite_diagnostiqueur`
- [x] `nom_residence`
- [x] `complement_adresse_batiment`
- [x] `complement_adresse_logement`

### Bâtiment
- [x] `hauteur_sous_plafond`
- [x] `nombre_appartement`
- [x] `nombre_niveau_immeuble`
- [x] `numero_etage_appartement`
- [x] `typologie_logement`
- [x] Ratio `surface_habitable_logement / surface_habitable_immeuble`

### Chauffage / ECS
- [x] `type_installation_chauffage`
- [x] `type_installation_ecs`
- [x] `type_energie_n1`
- [x] `type_generateur_chauffage_principal`
- [x] `description_installation_ecs_n1`
- [x] `nombre_logements_desservis_par_installation_ecs_n1`
- [x] `description_generateur_n1_ecs_n1`
- [x] `volume_stockage_generateur_n1_ecs_n1`

### Confort / Isolation
- [x] `indicateur_confort_ete`
- [x] `logement_traversant`
- [x] `isolation_toiture`
- [x] `qualite_isolation_plancher_haut_comble_perdu`
- [x] `type_ventilation`

### Energie
- [x] `conso_5_usages_par_m2_ep`
- [x] `emission_ges_5_usages` (par m2)
- [x] `categorie_enr`

---

## Résumé par priorité

| Priorité | Tâche | Status |
|----------|-------|--------|
| 1 | Login Google (domaine 6-49.im) | ⏳ À faire |
| 2 | Cron quotidien + check mise à jour | ✅ Fait |
| 3 | Adresse postale précise | ✅ Fait |
| 4 | Filtre dates (mode surveillance) | ✅ Fait |
| 5 | Nouveaux filtres (formulaire) | ✅ Fait |
| 6 | Nouveaux champs dans emails | ✅ Fait |

---

## Notes techniques

- Dataset ADEME : `meg-83tjwtg8dyz4vv7h1dqe`
- Formulaire avec sections accordéon pour organiser les filtres
- Migration SQL à exécuter : `supabase/migrations/005_add_all_filters.sql`

---

## Démo

https://dpe.deepskal.com
