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
  active: boolean
  last_checked_at: string | null
  last_dpe_date: string | null
  created_at: string
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
  conso_energie: number | null
  emission_ges: number | null
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
