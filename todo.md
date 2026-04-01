# TODO - DPE Alertes V2

## 1. Authentification

- [ ] **Login Google OAuth** - Implémenter une page de connexion avec Google
  - Restreindre l'accès aux emails du domaine `@6-49.im` uniquement
  - Exemple autorisé : `john123@6-49.im`

---

## 2. Système de notifications

- [ ] **Cron quotidien** - Changer le cron pour vérifier tous les jours (au lieu de mardi seulement)
  - Si la base ADEME est mise à jour → envoyer le mail à 8h
  - Sinon → ne rien envoyer

---

## 3. Adresse postale précise

- [ ] **Filtrer par adresse exacte** - Ne plus utiliser seulement les 2 premiers chiffres du code postal
  - Permettre de filtrer par code postal complet ou ville exacte

---

## 4. Nouveaux filtres à ajouter

### Dates
- [ ] Filtre sur `date_visite_diagnostiqueur` (entre 2 dates, depuis une date, le plus récent)

### Chauffage / ECS
- [ ] Filtre sur `type_installation_chauffage`
- [ ] Filtre sur `type_installation_ecs`
- [ ] Filtre sur `type_energie_n1`
- [ ] Filtre sur `description_generateur_n1_ecs_n1`
- [ ] Filtre sur `volume_stockage_generateur_n1_ecs_n1`

### Bâtiment
- [ ] Filtre sur `hauteur_sous_plafond`
- [ ] Filtre sur `nombre_appartement`
- [ ] Filtre sur `nombre_niveau_immeuble`
- [ ] Filtre sur `numero_etage_appartement`
- [ ] Filtre sur `typologie_logement`
- [ ] Filtre sur ratio `surface_habitable_logement / surface_habitable_immeuble`

### Confort / Isolation
- [ ] Filtre sur `indicateur_confort_ete`
- [ ] Filtre sur `logement_traversant`
- [ ] Filtre sur `isolation_toiture`
- [ ] Filtre sur `qualite_isolation_plancher_haut_comble_perdu`
- [ ] Filtre sur `type_ventilation`

### Consommation / Emissions
- [ ] Filtre sur `conso_5_usages_par_m2_ep`
- [ ] Filtre sur `emission_ges_5_usages` (par m2)

---

## 5. Nouveaux champs à afficher dans les emails

### Infos générales
- [ ] `date_visite_diagnostiqueur`
- [ ] `nom_residence`
- [ ] `complement_adresse_batiment`
- [ ] `complement_adresse_logement`

### Bâtiment
- [ ] `hauteur_sous_plafond`
- [ ] `nombre_appartement`
- [ ] `nombre_niveau_immeuble`
- [ ] `numero_etage_appartement`
- [ ] `typologie_logement`
- [ ] Ratio `surface_habitable_logement / surface_habitable_immeuble`

### Chauffage / ECS
- [ ] `type_installation_chauffage`
- [ ] `type_installation_ecs`
- [ ] `type_energie_n1`
- [ ] `type_generateur_chauffage_principal`
- [ ] `description_installation_ecs_n1`
- [ ] `nombre_logements_desservis_par_installation_ecs_n1`
- [ ] `description_generateur_n1_ecs_n1`
- [ ] `volume_stockage_generateur_n1_ecs_n1`

### Confort / Isolation
- [ ] `indicateur_confort_ete`
- [ ] `logement_traversant`
- [ ] `isolation_toiture`
- [ ] `qualite_isolation_plancher_haut_comble_perdu`
- [ ] `type_ventilation`

### Energie
- [ ] `conso_5_usages_par_m2_ep`
- [ ] `emission_ges_5_usages` (par m2)
- [ ] `categorie_enr`

---

## Résumé par priorité

| Priorité | Tâche | Complexité |
|----------|-------|------------|
| 1 | Login Google (domaine 6-49.im) | Moyenne |
| 2 | Cron quotidien + check mise à jour | Faible |
| 3 | Adresse postale précise | Moyenne |
| 4 | Nouveaux filtres (formulaire) | Haute |
| 5 | Nouveaux champs dans emails | Moyenne |

---

## Notes techniques

- Dataset ADEME : `meg-83tjwtg8dyz4vv7h1dqe`
- Vérifier que tous les nouveaux champs existent dans l'API ADEME
- Le formulaire de création d'alerte devra être agrandi (accordéon ou onglets ?)
