export type DateFilterType = 'alerte' | 'entre' | 'depuis' | 'tous'

export interface Alert {
  id: string
  name: string
  emails: string[]
  villes: string[]
  surface_min: number | null
  surface_max: number | null
  etiquettes_dpe: string[]
  etiquettes_ges: string[]
  types_batiment: string[]
  date_filter_type: DateFilterType
  date_visite_min: string | null
  date_visite_max: string | null
  // Nouveaux filtres Chauffage/ECS
  types_installation_chauffage: string[]
  types_installation_ecs: string[]
  types_energie: string[]
  volume_stockage_ecs_min: number | null
  volume_stockage_ecs_max: number | null
  // Nouveaux filtres Batiment
  hauteur_sous_plafond_min: number | null
  hauteur_sous_plafond_max: number | null
  nombre_appartement_min: number | null
  nombre_appartement_max: number | null
  nombre_niveau_immeuble_min: number | null
  nombre_niveau_immeuble_max: number | null
  numero_etage_min: number | null
  numero_etage_max: number | null
  typologies_logement: string[]
  ratio_surface_min: number | null
  ratio_surface_max: number | null
  // Nouveaux filtres Confort/Isolation
  indicateurs_confort_ete: string[]
  logement_traversant: boolean | null
  isolation_toiture: boolean | null
  qualites_isolation_plancher: string[]
  types_ventilation: string[]
  // Nouveaux filtres Consommation/Emissions
  conso_energie_min: number | null
  conso_energie_max: number | null
  emission_ges_min: number | null
  emission_ges_max: number | null
  // Champs système
  active: boolean
  last_checked_at: string | null
  last_dpe_date: string | null
  created_at: string
  user_id: string | null
}

export interface DPEResult {
  numero_dpe: string
  adresse: string
  ville: string
  code_postal: string
  surface: number
  etiquette_dpe: string
  etiquette_ges: string
  type_batiment: string
  date_reception: string
  date_visite: string | null
  conso_energie: number | null
  emission_ges: number | null
  // Nouveaux champs
  complement_adresse_batiment: string | null
  complement_adresse_logement: string | null
  nom_residence: string | null
  hauteur_sous_plafond: number | null
  nombre_appartement: number | null
  nombre_niveau_immeuble: number | null
  numero_etage: number | null
  typologie_logement: string | null
  surface_immeuble: number | null
  type_installation_chauffage: string | null
  type_installation_ecs: string | null
  type_energie: string | null
  type_generateur_chauffage: string | null
  description_installation_ecs: string | null
  nombre_logements_ecs: number | null
  description_generateur_ecs: string | null
  volume_stockage_ecs: number | null
  indicateur_confort_ete: string | null
  logement_traversant: boolean | null
  isolation_toiture: boolean | null
  qualite_isolation_plancher: string | null
  type_ventilation: string | null
  categorie_enr: string | null
}

export interface AlertFormData {
  name: string
  emails: string[]
  villes: string[]
  surface_min: number | null
  surface_max: number | null
  etiquettes_dpe: string[]
  etiquettes_ges: string[]
  types_batiment: string[]
  date_filter_type: DateFilterType
  date_visite_min: string | null
  date_visite_max: string | null
  // Nouveaux filtres
  types_installation_chauffage: string[]
  types_installation_ecs: string[]
  types_energie: string[]
  volume_stockage_ecs_min: number | null
  volume_stockage_ecs_max: number | null
  hauteur_sous_plafond_min: number | null
  hauteur_sous_plafond_max: number | null
  nombre_appartement_min: number | null
  nombre_appartement_max: number | null
  nombre_niveau_immeuble_min: number | null
  nombre_niveau_immeuble_max: number | null
  numero_etage_min: number | null
  numero_etage_max: number | null
  typologies_logement: string[]
  ratio_surface_min: number | null
  ratio_surface_max: number | null
  indicateurs_confort_ete: string[]
  logement_traversant: boolean | null
  isolation_toiture: boolean | null
  qualites_isolation_plancher: string[]
  types_ventilation: string[]
  conso_energie_min: number | null
  conso_energie_max: number | null
  emission_ges_min: number | null
  emission_ges_max: number | null
}

export interface DPESummary {
  numero_dpe: string
  adresse: string
  ville: string
  etiquette_dpe: string
  etiquette_ges: string
  surface: number
}

export interface EmailHistory {
  id: string
  alert_id: string
  alert_name: string
  sent_at: string
  recipients: string[]
  dpe_count: number
  dpe_summary: DPESummary[]
}

// Options pour les filtres
export const TYPES_INSTALLATION_CHAUFFAGE = [
  'individuel',
  'collectif',
  'mixte (collectif-individuel)'
]

export const TYPES_INSTALLATION_ECS = [
  'individuel',
  'collectif',
  'mixte (collectif-individuel)'
]

export const INDICATEURS_CONFORT_ETE = [
  'bon',
  'moyen',
  'insuffisant'
]

export const QUALITES_ISOLATION_PLANCHER = [
  'bonne',
  'moyenne',
  'insuffisante',
  'non isolé'
]

export const TYPOLOGIES_LOGEMENT = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6 et plus',
  'studio'
]

export const TYPES_ENERGIE = [
  'Électricité',
  'Gaz naturel',
  'GPL',
  'Fioul domestique',
  'Bois - bûches',
  'Bois - granulés',
  'Bois - plaquettes',
  'Charbon',
  'Réseau de chaleur',
  'Réseau de froid',
  'Propane',
  'Butane',
  'Autre combustible fossile',
  'Autre'
]

export const TYPES_VENTILATION = [
  'VMC simple flux autoréglable',
  'VMC simple flux hygroréglable',
  'VMC double flux',
  'VMC double flux thermodynamique',
  'Ventilation naturelle',
  'Ventilation naturelle par conduit',
  'Ventilation hybride',
  'Puits climatique',
  'Aucune ventilation',
  'Autre'
]
