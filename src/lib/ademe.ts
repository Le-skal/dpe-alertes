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
  conso_5_usages_par_m2_ep: number | null
  emission_ges_5_usages: number | null
}

export async function fetchNewDPEs(alert: Alert): Promise<DPEResult[]> {
  // Construire la requête
  const params = new URLSearchParams()
  params.set('size', '100')

  // Champs à récupérer
  const fields = [
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
    'conso_5_usages_par_m2_ep',
    'emission_ges_5_usages'
  ]
  params.set('select', fields.join(','))

  // Construire les filtres
  const queryParts: string[] = []

  // Filtre villes (insensible à la casse - l'API semble accepter les deux)
  if (alert.villes.length > 0) {
    const villeFilter = alert.villes
      .map(v => `nom_commune_ban:"${v}"`)
      .join(' OR ')
    queryParts.push(`(${villeFilter})`)
  }

  // Filtre étiquettes DPE
  if (alert.etiquettes_dpe.length > 0) {
    const dpeFilter = alert.etiquettes_dpe
      .map(e => `etiquette_dpe:"${e}"`)
      .join(' OR ')
    queryParts.push(`(${dpeFilter})`)
  }

  // Filtre étiquettes GES
  if (alert.etiquettes_ges.length > 0) {
    const gesFilter = alert.etiquettes_ges
      .map(e => `etiquette_ges:"${e}"`)
      .join(' OR ')
    queryParts.push(`(${gesFilter})`)
  }

  // Filtre type de bâtiment (normaliser en minuscules)
  if (alert.types_batiment.length > 0) {
    const typeFilter = alert.types_batiment
      .map(t => `type_batiment:"${t.toLowerCase()}"`)
      .join(' OR ')
    queryParts.push(`(${typeFilter})`)
  }

  if (queryParts.length > 0) {
    params.set('q', queryParts.join(' AND '))
    params.set('q_mode', 'simple')
  }

  // Filtre date - récupérer uniquement les DPE depuis le dernier check
  // Premier scan : 7 derniers jours, ensuite depuis le dernier DPE trouvé
  const dateFrom = alert.last_dpe_date
    ? alert.last_dpe_date
    : getDateDaysAgo(7)

  params.set('qs', `date_derniere_modification_dpe:[${dateFrom} TO *]`)
  params.set('sort', '-date_derniere_modification_dpe')

  const url = `${ADEME_API_URL}?${params.toString()}`

  console.log('  [ADEME] Request URL:', url)
  console.log('  [ADEME] Date filter from:', dateFrom)

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

    // Filtre surface côté client
    if (alert.surface_min !== null) {
      results = results.filter(r => r.surface >= alert.surface_min!)
    }
    if (alert.surface_max !== null) {
      results = results.filter(r => r.surface <= alert.surface_max!)
    }

    console.log('  [ADEME] Results after surface filter:', results.length)

    return results
  } catch (error) {
    console.error('Erreur fetchNewDPEs:', error)
    throw error
  }
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
    conso_energie: raw.conso_5_usages_par_m2_ep,
    emission_ges: raw.emission_ges_5_usages,
  }
}

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// Obtenir la date du DPE le plus récent dans une liste
export function getLatestDPEDate(dpes: DPEResult[]): string | null {
  if (dpes.length === 0) return null

  return dpes.reduce((latest, dpe) => {
    return dpe.date_reception > latest ? dpe.date_reception : latest
  }, dpes[0].date_reception)
}
