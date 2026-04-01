import { Alert, DPEResult } from './types'

// Dataset ADEME DPE logements existants
const ADEME_API_URL = 'https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines'

interface ADEMEResponse {
  total: number
  results: ADEMERawResult[]
}

interface ADEMERawResult {
  numero_dpe: string
  adresse_ban: string
  adresse_brut: string
  nom_commune_ban: string
  code_postal_ban: string
  surface_habitable_logement: number
  etiquette_dpe: string
  etiquette_ges: string
  type_batiment: string
  date_derniere_modification_dpe: string
  date_visite_diagnostiqueur: string | null
  conso_5_usages_par_m2_ep: number | null
  emission_ges_5_usages: number | null
  // Nouveaux champs
  complement_adresse_batiment: string | null
  complement_adresse_logement: string | null
  nom_residence: string | null
  hauteur_sous_plafond: number | null
  nombre_appartement: number | null
  nombre_niveau_immeuble: number | null
  numero_etage_appartement: number | null
  typologie_logement: string | null
  surface_habitable_immeuble: number | null
  type_installation_chauffage: string | null
  type_installation_ecs: string | null
  type_energie_n1: string | null
  type_generateur_chauffage_principal: string | null
  description_installation_ecs_n1: string | null
  nombre_logements_desservis_par_installation_ecs_n1: number | null
  description_generateur_n1_ecs_n1: string | null
  volume_stockage_generateur_n1_ecs_n1: number | null
  indicateur_confort_ete: string | null
  logement_traversant: string | null // "oui" ou "non" ou null
  isolation_toiture: string | null // "oui" ou "non" ou null
  qualite_isolation_plancher_haut_comble_perdu: string | null
  type_ventilation: string | null
  categorie_enr: string | null
}

// Tous les champs à récupérer
const ALL_FIELDS = [
  'numero_dpe',
  'adresse_ban',
  'adresse_brut',
  'nom_commune_ban',
  'code_postal_ban',
  'surface_habitable_logement',
  'etiquette_dpe',
  'etiquette_ges',
  'type_batiment',
  'date_derniere_modification_dpe',
  'date_visite_diagnostiqueur',
  'conso_5_usages_par_m2_ep',
  'emission_ges_5_usages',
  // Nouveaux champs
  'complement_adresse_batiment',
  'complement_adresse_logement',
  'nom_residence',
  'hauteur_sous_plafond',
  'nombre_appartement',
  'nombre_niveau_immeuble',
  'numero_etage_appartement',
  'typologie_logement',
  'surface_habitable_immeuble',
  'type_installation_chauffage',
  'type_installation_ecs',
  'type_energie_n1',
  'type_generateur_chauffage_principal',
  'description_installation_ecs_n1',
  'nombre_logements_desservis_par_installation_ecs_n1',
  'description_generateur_n1_ecs_n1',
  'volume_stockage_generateur_n1_ecs_n1',
  'indicateur_confort_ete',
  'logement_traversant',
  'isolation_toiture',
  'qualite_isolation_plancher_haut_comble_perdu',
  'type_ventilation',
  'categorie_enr'
]

export async function fetchNewDPEs(alert: Alert): Promise<DPEResult[]> {
  // Construire la requête
  const params = new URLSearchParams()
  params.set('size', '100')
  params.set('select', ALL_FIELDS.join(','))

  // Construire les filtres avec qs (query string Lucene)
  const qsParts: string[] = []
  const filterType = alert.date_filter_type || 'alerte'

  // Filtre date selon le mode
  if (filterType === 'alerte') {
    // Mode Alertes : uniquement les nouveaux DPE depuis le dernier check
    const dateFrom = alert.last_dpe_date
      ? alert.last_dpe_date
      : getDateDaysAgo(7)
    qsParts.push(`date_derniere_modification_dpe:[${dateFrom} TO *]`)
  } else if (filterType === 'entre' && alert.date_visite_min && alert.date_visite_max) {
    // Mode Entre 2 dates : filtre sur date_visite_diagnostiqueur
    qsParts.push(`date_visite_diagnostiqueur:[${alert.date_visite_min} TO ${alert.date_visite_max}]`)
  } else if (filterType === 'depuis' && alert.date_visite_min) {
    // Mode Depuis : filtre sur date_visite_diagnostiqueur depuis la date
    qsParts.push(`date_visite_diagnostiqueur:[${alert.date_visite_min} TO *]`)
  }
  // Mode 'tous' : aucun filtre de date

  // Filtre par code postal (extrait du format "Ville|CodePostal")
  if (alert.villes.length > 0) {
    const codesPostaux = extractCodesPostaux(alert.villes)
    if (codesPostaux.length > 0) {
      const cpFilter = codesPostaux
        .map(cp => `code_postal_ban:"${cp}"`)
        .join(' OR ')
      qsParts.push(`(${cpFilter})`)
    }
  }

  // Filtre étiquettes DPE
  if (alert.etiquettes_dpe.length > 0) {
    const dpeFilter = alert.etiquettes_dpe
      .map(e => `etiquette_dpe:"${e}"`)
      .join(' OR ')
    qsParts.push(`(${dpeFilter})`)
  }

  // Filtre étiquettes GES
  if (alert.etiquettes_ges.length > 0) {
    const gesFilter = alert.etiquettes_ges
      .map(e => `etiquette_ges:"${e}"`)
      .join(' OR ')
    qsParts.push(`(${gesFilter})`)
  }

  // Filtre type de bâtiment (normaliser en minuscules)
  if (alert.types_batiment.length > 0) {
    const typeFilter = alert.types_batiment
      .map(t => `type_batiment:"${t.toLowerCase()}"`)
      .join(' OR ')
    qsParts.push(`(${typeFilter})`)
  }

  // Filtre type installation chauffage
  if (alert.types_installation_chauffage?.length > 0) {
    const filter = alert.types_installation_chauffage
      .map(t => `type_installation_chauffage:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre type installation ECS
  if (alert.types_installation_ecs?.length > 0) {
    const filter = alert.types_installation_ecs
      .map(t => `type_installation_ecs:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre types énergie
  if (alert.types_energie?.length > 0) {
    const filter = alert.types_energie
      .map(t => `type_energie_n1:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre typologie logement
  if (alert.typologies_logement?.length > 0) {
    const filter = alert.typologies_logement
      .map(t => `typologie_logement:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre indicateur confort été
  if (alert.indicateurs_confort_ete?.length > 0) {
    const filter = alert.indicateurs_confort_ete
      .map(t => `indicateur_confort_ete:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre qualité isolation plancher
  if (alert.qualites_isolation_plancher?.length > 0) {
    const filter = alert.qualites_isolation_plancher
      .map(t => `qualite_isolation_plancher_haut_comble_perdu:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre types ventilation
  if (alert.types_ventilation?.length > 0) {
    const filter = alert.types_ventilation
      .map(t => `type_ventilation:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre logement traversant (boolean)
  if (alert.logement_traversant === true) {
    qsParts.push(`logement_traversant:"oui"`)
  } else if (alert.logement_traversant === false) {
    qsParts.push(`logement_traversant:"non"`)
  }

  // Filtre isolation toiture (boolean)
  if (alert.isolation_toiture === true) {
    qsParts.push(`isolation_toiture:"oui"`)
  } else if (alert.isolation_toiture === false) {
    qsParts.push(`isolation_toiture:"non"`)
  }

  params.set('qs', qsParts.join(' AND '))
  params.set('sort', '-date_derniere_modification_dpe')

  const url = `${ADEME_API_URL}?${params.toString()}`

  console.log('  [ADEME] Request URL:', url)
  console.log('  [ADEME] Filter mode:', filterType)

  try {
    const response = await fetch(url)

    console.log('  [ADEME] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('  [ADEME] Error response:', errorText)
      throw new Error(`Erreur API ADEME: ${response.status}`)
    }

    const data: ADEMEResponse = await response.json()
    console.log('  [ADEME] Total results from API:', data.total)
    console.log('  [ADEME] Results returned:', data.results?.length || 0)

    // Transformer et filtrer les résultats
    let results = data.results.map(transformResult)

    // Filtres numériques côté client (range sliders)
    results = applyNumericFilters(results, alert)

    console.log('  [ADEME] Results after filters:', results.length)

    return results
  } catch (error) {
    console.error('Erreur fetchNewDPEs:', error)
    throw error
  }
}

function applyNumericFilters(results: DPEResult[], alert: Alert): DPEResult[] {
  let filtered = results

  // Surface
  if (alert.surface_min !== null) {
    filtered = filtered.filter(r => r.surface >= alert.surface_min!)
  }
  if (alert.surface_max !== null) {
    filtered = filtered.filter(r => r.surface <= alert.surface_max!)
  }

  // Hauteur sous plafond
  if (alert.hauteur_sous_plafond_min !== null) {
    filtered = filtered.filter(r => r.hauteur_sous_plafond === null || r.hauteur_sous_plafond >= alert.hauteur_sous_plafond_min!)
  }
  if (alert.hauteur_sous_plafond_max !== null) {
    filtered = filtered.filter(r => r.hauteur_sous_plafond === null || r.hauteur_sous_plafond <= alert.hauteur_sous_plafond_max!)
  }

  // Nombre appartement
  if (alert.nombre_appartement_min !== null) {
    filtered = filtered.filter(r => r.nombre_appartement === null || r.nombre_appartement >= alert.nombre_appartement_min!)
  }
  if (alert.nombre_appartement_max !== null) {
    filtered = filtered.filter(r => r.nombre_appartement === null || r.nombre_appartement <= alert.nombre_appartement_max!)
  }

  // Nombre niveau immeuble
  if (alert.nombre_niveau_immeuble_min !== null) {
    filtered = filtered.filter(r => r.nombre_niveau_immeuble === null || r.nombre_niveau_immeuble >= alert.nombre_niveau_immeuble_min!)
  }
  if (alert.nombre_niveau_immeuble_max !== null) {
    filtered = filtered.filter(r => r.nombre_niveau_immeuble === null || r.nombre_niveau_immeuble <= alert.nombre_niveau_immeuble_max!)
  }

  // Numéro étage
  if (alert.numero_etage_min !== null) {
    filtered = filtered.filter(r => r.numero_etage === null || r.numero_etage >= alert.numero_etage_min!)
  }
  if (alert.numero_etage_max !== null) {
    filtered = filtered.filter(r => r.numero_etage === null || r.numero_etage <= alert.numero_etage_max!)
  }

  // Volume stockage ECS
  if (alert.volume_stockage_ecs_min !== null) {
    filtered = filtered.filter(r => r.volume_stockage_ecs === null || r.volume_stockage_ecs >= alert.volume_stockage_ecs_min!)
  }
  if (alert.volume_stockage_ecs_max !== null) {
    filtered = filtered.filter(r => r.volume_stockage_ecs === null || r.volume_stockage_ecs <= alert.volume_stockage_ecs_max!)
  }

  // Consommation énergie
  if (alert.conso_energie_min !== null) {
    filtered = filtered.filter(r => r.conso_energie === null || r.conso_energie >= alert.conso_energie_min!)
  }
  if (alert.conso_energie_max !== null) {
    filtered = filtered.filter(r => r.conso_energie === null || r.conso_energie <= alert.conso_energie_max!)
  }

  // Emission GES
  if (alert.emission_ges_min !== null) {
    filtered = filtered.filter(r => r.emission_ges === null || r.emission_ges >= alert.emission_ges_min!)
  }
  if (alert.emission_ges_max !== null) {
    filtered = filtered.filter(r => r.emission_ges === null || r.emission_ges <= alert.emission_ges_max!)
  }

  // Ratio surface logement/immeuble
  if (alert.ratio_surface_min !== null || alert.ratio_surface_max !== null) {
    filtered = filtered.filter(r => {
      if (!r.surface_immeuble || r.surface_immeuble === 0) return true // Inclure si pas de données
      const ratio = (r.surface / r.surface_immeuble) * 100
      if (alert.ratio_surface_min !== null && ratio < alert.ratio_surface_min) return false
      if (alert.ratio_surface_max !== null && ratio > alert.ratio_surface_max) return false
      return true
    })
  }

  return filtered
}

function transformResult(raw: ADEMERawResult): DPEResult {
  return {
    numero_dpe: raw.numero_dpe || '',
    adresse: raw.adresse_ban || raw.adresse_brut || '',
    ville: raw.nom_commune_ban || '',
    code_postal: raw.code_postal_ban || '',
    surface: raw.surface_habitable_logement || 0,
    etiquette_dpe: raw.etiquette_dpe || '',
    etiquette_ges: raw.etiquette_ges || '',
    type_batiment: raw.type_batiment || '',
    date_reception: raw.date_derniere_modification_dpe || '',
    date_visite: raw.date_visite_diagnostiqueur || null,
    conso_energie: raw.conso_5_usages_par_m2_ep,
    emission_ges: raw.emission_ges_5_usages,
    // Nouveaux champs
    complement_adresse_batiment: raw.complement_adresse_batiment || null,
    complement_adresse_logement: raw.complement_adresse_logement || null,
    nom_residence: raw.nom_residence || null,
    hauteur_sous_plafond: raw.hauteur_sous_plafond || null,
    nombre_appartement: raw.nombre_appartement || null,
    nombre_niveau_immeuble: raw.nombre_niveau_immeuble || null,
    numero_etage: raw.numero_etage_appartement || null,
    typologie_logement: raw.typologie_logement || null,
    surface_immeuble: raw.surface_habitable_immeuble || null,
    type_installation_chauffage: raw.type_installation_chauffage || null,
    type_installation_ecs: raw.type_installation_ecs || null,
    type_energie: raw.type_energie_n1 || null,
    type_generateur_chauffage: raw.type_generateur_chauffage_principal || null,
    description_installation_ecs: raw.description_installation_ecs_n1 || null,
    nombre_logements_ecs: raw.nombre_logements_desservis_par_installation_ecs_n1 || null,
    description_generateur_ecs: raw.description_generateur_n1_ecs_n1 || null,
    volume_stockage_ecs: raw.volume_stockage_generateur_n1_ecs_n1 || null,
    indicateur_confort_ete: raw.indicateur_confort_ete || null,
    logement_traversant: raw.logement_traversant === 'oui' ? true : raw.logement_traversant === 'non' ? false : null,
    isolation_toiture: raw.isolation_toiture === 'oui' ? true : raw.isolation_toiture === 'non' ? false : null,
    qualite_isolation_plancher: raw.qualite_isolation_plancher_haut_comble_perdu || null,
    type_ventilation: raw.type_ventilation || null,
    categorie_enr: raw.categorie_enr || null,
  }
}

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// Extraire les codes postaux uniques du format "Ville|CodePostal"
function extractCodesPostaux(villes: string[]): string[] {
  const cps = new Set<string>()
  for (const v of villes) {
    const parts = v.split('|')
    if (parts[1]) {
      cps.add(parts[1])
    }
  }
  return Array.from(cps)
}

// Obtenir la date du DPE le plus récent dans une liste
export function getLatestDPEDate(dpes: DPEResult[]): string | null {
  if (dpes.length === 0) return null

  return dpes.reduce((latest, dpe) => {
    return dpe.date_reception > latest ? dpe.date_reception : latest
  }, dpes[0].date_reception)
}

// Récupérer la dernière date de mise à jour de la base ADEME
export async function getLatestADEMEUpdateDate(): Promise<string | null> {
  const params = new URLSearchParams()
  params.set('size', '1')
  params.set('select', 'date_derniere_modification_dpe')
  params.set('sort', '-date_derniere_modification_dpe')

  const url = `${ADEME_API_URL}?${params.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data: ADEMEResponse = await response.json()
    if (data.results && data.results.length > 0) {
      return data.results[0].date_derniere_modification_dpe
    }
    return null
  } catch {
    return null
  }
}

// Récupérer les DPE pour une date spécifique (utilisé pour les tests)
export async function fetchDPEsForDate(alert: Alert, date: string): Promise<DPEResult[]> {
  const params = new URLSearchParams()
  params.set('size', '100')
  params.set('select', ALL_FIELDS.join(','))

  // Construire les filtres avec qs (query string Lucene)
  const qsParts: string[] = []
  const filterType = alert.date_filter_type || 'alerte'

  // Filtre date selon le mode
  if (filterType === 'alerte') {
    // Mode Alertes : filtre sur la date spécifique passée en paramètre
    qsParts.push(`date_derniere_modification_dpe:${date}`)
  } else if (filterType === 'entre' && alert.date_visite_min && alert.date_visite_max) {
    // Mode Entre 2 dates : filtre sur date_visite_diagnostiqueur
    qsParts.push(`date_visite_diagnostiqueur:[${alert.date_visite_min} TO ${alert.date_visite_max}]`)
  } else if (filterType === 'depuis' && alert.date_visite_min) {
    // Mode Depuis : filtre sur date_visite_diagnostiqueur depuis la date
    qsParts.push(`date_visite_diagnostiqueur:[${alert.date_visite_min} TO *]`)
  }
  // Mode 'tous' : aucun filtre de date

  // Filtre par code postal (extrait du format "Ville|CodePostal")
  if (alert.villes.length > 0) {
    const codesPostaux = extractCodesPostaux(alert.villes)
    if (codesPostaux.length > 0) {
      const cpFilter = codesPostaux
        .map(cp => `code_postal_ban:"${cp}"`)
        .join(' OR ')
      qsParts.push(`(${cpFilter})`)
    }
  }

  // Filtre étiquettes DPE
  if (alert.etiquettes_dpe.length > 0) {
    const dpeFilter = alert.etiquettes_dpe
      .map(e => `etiquette_dpe:"${e}"`)
      .join(' OR ')
    qsParts.push(`(${dpeFilter})`)
  }

  // Filtre étiquettes GES
  if (alert.etiquettes_ges.length > 0) {
    const gesFilter = alert.etiquettes_ges
      .map(e => `etiquette_ges:"${e}"`)
      .join(' OR ')
    qsParts.push(`(${gesFilter})`)
  }

  // Filtre type de bâtiment
  if (alert.types_batiment.length > 0) {
    const typeFilter = alert.types_batiment
      .map(t => `type_batiment:"${t.toLowerCase()}"`)
      .join(' OR ')
    qsParts.push(`(${typeFilter})`)
  }

  // Filtre type installation chauffage
  if (alert.types_installation_chauffage?.length > 0) {
    const filter = alert.types_installation_chauffage
      .map(t => `type_installation_chauffage:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre type installation ECS
  if (alert.types_installation_ecs?.length > 0) {
    const filter = alert.types_installation_ecs
      .map(t => `type_installation_ecs:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre types énergie
  if (alert.types_energie?.length > 0) {
    const filter = alert.types_energie
      .map(t => `type_energie_n1:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre typologie logement
  if (alert.typologies_logement?.length > 0) {
    const filter = alert.typologies_logement
      .map(t => `typologie_logement:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre indicateur confort été
  if (alert.indicateurs_confort_ete?.length > 0) {
    const filter = alert.indicateurs_confort_ete
      .map(t => `indicateur_confort_ete:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre qualité isolation plancher
  if (alert.qualites_isolation_plancher?.length > 0) {
    const filter = alert.qualites_isolation_plancher
      .map(t => `qualite_isolation_plancher_haut_comble_perdu:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre types ventilation
  if (alert.types_ventilation?.length > 0) {
    const filter = alert.types_ventilation
      .map(t => `type_ventilation:"${t}"`)
      .join(' OR ')
    qsParts.push(`(${filter})`)
  }

  // Filtre logement traversant (boolean)
  if (alert.logement_traversant === true) {
    qsParts.push(`logement_traversant:"oui"`)
  } else if (alert.logement_traversant === false) {
    qsParts.push(`logement_traversant:"non"`)
  }

  // Filtre isolation toiture (boolean)
  if (alert.isolation_toiture === true) {
    qsParts.push(`isolation_toiture:"oui"`)
  } else if (alert.isolation_toiture === false) {
    qsParts.push(`isolation_toiture:"non"`)
  }

  params.set('qs', qsParts.join(' AND '))
  params.set('sort', '-date_derniere_modification_dpe')

  const url = `${ADEME_API_URL}?${params.toString()}`

  console.log('  [ADEME] Test URL:', url)
  console.log('  [ADEME] Date filter:', date)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('  [ADEME] Error response:', errorText)
      throw new Error(`Erreur API ADEME: ${response.status}`)
    }

    const data: ADEMEResponse = await response.json()
    console.log('  [ADEME] Total results:', data.total)

    let results = data.results.map(transformResult)
    results = applyNumericFilters(results, alert)

    return results
  } catch (error) {
    console.error('Erreur fetchDPEsForDate:', error)
    throw error
  }
}
