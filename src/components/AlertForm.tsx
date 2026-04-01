'use client'

import { useState, useRef, useEffect } from 'react'
import { Alert, AlertFormData, DateFilterType, TYPES_INSTALLATION_CHAUFFAGE, TYPES_INSTALLATION_ECS, INDICATEURS_CONFORT_ETE, QUALITES_ISOLATION_PLANCHER, TYPOLOGIES_LOGEMENT, TYPES_ENERGIE, TYPES_VENTILATION } from '@/lib/types'
import { CityAutocomplete, formatCityDisplay } from './CityAutocomplete'

interface AlertFormProps {
  alert: Alert | null
  onClose: () => void
}

const ETIQUETTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const TYPES_BATIMENT = ['Appartement', 'Maison', 'Immeuble']

const ETIQUETTE_COLORS: Record<string, { bg: string; bgSelected: string; text: string }> = {
  A: { bg: 'bg-emerald-100', bgSelected: 'bg-emerald-500', text: 'text-white' },
  B: { bg: 'bg-green-100', bgSelected: 'bg-green-500', text: 'text-white' },
  C: { bg: 'bg-lime-100', bgSelected: 'bg-lime-400', text: 'text-gray-900' },
  D: { bg: 'bg-yellow-100', bgSelected: 'bg-yellow-400', text: 'text-gray-900' },
  E: { bg: 'bg-orange-100', bgSelected: 'bg-orange-400', text: 'text-white' },
  F: { bg: 'bg-orange-200', bgSelected: 'bg-orange-600', text: 'text-white' },
  G: { bg: 'bg-red-100', bgSelected: 'bg-red-600', text: 'text-white' },
}

// Composant ButtonGroup externe
function ButtonGroup({
  options,
  selected,
  onToggle,
  small = false
}: {
  options: string[]
  selected: string[]
  onToggle: (item: string) => void
  small?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onToggle(option)}
          className={`${small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-lg font-medium transition-all ${
            selected.includes(option)
              ? 'btn-primary-gradient text-[var(--on-primary)]'
              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// Composant BooleanFilter externe
function BooleanFilter({
  value,
  onChange,
}: {
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  return (
    <div className="flex gap-2">
      {[
        { label: 'Indifférent', val: null },
        { label: 'Oui', val: true },
        { label: 'Non', val: false },
      ].map((opt) => (
        <button
          key={String(opt.val)}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange(opt.val)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            value === opt.val
              ? 'btn-primary-gradient text-[var(--on-primary)]'
              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// Composant RangeInputs externe
function RangeInputs({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit = '',
  step = 1,
  minLimit = 0,
}: {
  label: string
  minValue: number | null
  maxValue: number | null
  onMinChange: (v: number | null) => void
  onMaxChange: (v: number | null) => void
  unit?: string
  step?: number
  minLimit?: number
}) {
  return (
    <div className="mb-4">
      <p className="label-md mb-2">{label} {unit && `(${unit})`}</p>
      <div className="flex gap-3 items-center">
        <input
          type="number"
          value={minValue ?? ''}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : null)}
          className="input-stitch flex-1 px-3 py-2 rounded-lg text-[var(--on-surface)] text-sm"
          placeholder="Min"
          min={minLimit}
          step={step}
        />
        <span className="text-[var(--on-surface-variant)]">—</span>
        <input
          type="number"
          value={maxValue ?? ''}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : null)}
          className="input-stitch flex-1 px-3 py-2 rounded-lg text-[var(--on-surface)] text-sm"
          placeholder="Max"
          min={minLimit}
          step={step}
        />
      </div>
    </div>
  )
}

// Composant MultiSelectDropdown externe
function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (item: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <p className="label-md mb-2">{label}</p>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl text-left bg-[var(--surface-container)] text-[var(--on-surface)] border border-[var(--surface-container-high)] hover:border-[var(--primary)] transition-colors"
      >
        {selected.length === 0 ? (
          <span className="text-[var(--on-surface-variant)]">Sélectionner...</span>
        ) : (
          <span>{selected.length} sélectionné{selected.length > 1 ? 's' : ''}</span>
        )}
        <span className="float-right">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-[var(--surface-container-lowest)] border border-[var(--surface-container-high)] rounded-xl shadow-lg">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center px-4 py-2 hover:bg-[var(--surface-container)] cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="mr-3 w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--on-surface)]">{option}</span>
            </label>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-[var(--primary-fixed)] text-[var(--primary)] px-2 py-0.5 rounded-full text-xs"
            >
              {item.length > 20 ? item.substring(0, 20) + '...' : item}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onToggle(item)}
                className="hover:bg-[var(--primary)]/10 rounded-full"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Composant Section externe
function Section({
  id,
  title,
  children,
  badge,
  expanded,
  onToggle,
}: {
  id: string
  title: string
  children: React.ReactNode
  badge?: number
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-[var(--surface-container-high)] last:border-b-0">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--surface-container)]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="title-md text-[var(--on-surface)]">{title}</h3>
          {badge !== undefined && badge > 0 && (
            <span className="bg-[var(--primary)] text-[var(--on-primary)] text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <span className="text-[var(--on-surface-variant)]">
          {expanded ? '−' : '+'}
        </span>
      </button>
      {expanded && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  )
}

export function AlertForm({ alert: editingAlert, onClose }: AlertFormProps) {
  const [loading, setLoading] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    location: true,
    building: true,
    energy: false,
    comfort: false,
    consumption: false,
  })

  const [formData, setFormData] = useState<AlertFormData>({
    name: editingAlert?.name || '',
    emails: editingAlert?.emails || [],
    villes: editingAlert?.villes || [],
    surface_min: editingAlert?.surface_min || null,
    surface_max: editingAlert?.surface_max || null,
    etiquettes_dpe: editingAlert?.etiquettes_dpe || [],
    etiquettes_ges: editingAlert?.etiquettes_ges || [],
    types_batiment: editingAlert?.types_batiment || [],
    date_filter_type: editingAlert?.date_filter_type || 'alerte',
    date_visite_min: editingAlert?.date_visite_min || null,
    date_visite_max: editingAlert?.date_visite_max || null,
    types_installation_chauffage: editingAlert?.types_installation_chauffage || [],
    types_installation_ecs: editingAlert?.types_installation_ecs || [],
    types_energie: editingAlert?.types_energie || [],
    volume_stockage_ecs_min: editingAlert?.volume_stockage_ecs_min || null,
    volume_stockage_ecs_max: editingAlert?.volume_stockage_ecs_max || null,
    hauteur_sous_plafond_min: editingAlert?.hauteur_sous_plafond_min || null,
    hauteur_sous_plafond_max: editingAlert?.hauteur_sous_plafond_max || null,
    nombre_appartement_min: editingAlert?.nombre_appartement_min || null,
    nombre_appartement_max: editingAlert?.nombre_appartement_max || null,
    nombre_niveau_immeuble_min: editingAlert?.nombre_niveau_immeuble_min || null,
    nombre_niveau_immeuble_max: editingAlert?.nombre_niveau_immeuble_max || null,
    numero_etage_min: editingAlert?.numero_etage_min || null,
    numero_etage_max: editingAlert?.numero_etage_max || null,
    typologies_logement: editingAlert?.typologies_logement || [],
    ratio_surface_min: editingAlert?.ratio_surface_min || null,
    ratio_surface_max: editingAlert?.ratio_surface_max || null,
    indicateurs_confort_ete: editingAlert?.indicateurs_confort_ete || [],
    logement_traversant: editingAlert?.logement_traversant ?? null,
    isolation_toiture: editingAlert?.isolation_toiture ?? null,
    qualites_isolation_plancher: editingAlert?.qualites_isolation_plancher || [],
    types_ventilation: editingAlert?.types_ventilation || [],
    conso_energie_min: editingAlert?.conso_energie_min || null,
    conso_energie_max: editingAlert?.conso_energie_max || null,
    emission_ges_min: editingAlert?.emission_ges_min || null,
    emission_ges_max: editingAlert?.emission_ges_max || null,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAlert ? `/api/alerts/${editingAlert.id}` : '/api/alerts'
      const method = editingAlert ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur')
      }

      onClose()
    } catch (error) {
      alert('Erreur: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase()
    if (email && !formData.emails.includes(email)) {
      setFormData({ ...formData, emails: [...formData.emails, email] })
      setEmailInput('')
    }
  }

  const removeEmail = (email: string) => {
    setFormData({
      ...formData,
      emails: formData.emails.filter((e) => e !== email),
    })
  }

  const addVille = (ville: string) => {
    if (ville && !formData.villes.includes(ville)) {
      setFormData({ ...formData, villes: [...formData.villes, ville] })
    }
  }

  const removeVille = (ville: string) => {
    setFormData({
      ...formData,
      villes: formData.villes.filter((v) => v !== ville),
    })
  }

  const toggleArrayItem = (field: keyof AlertFormData, item: string) => {
    const current = formData[field] as string[]
    const newList = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item]
    setFormData({ ...formData, [field]: newList })
  }

  const countActiveFilters = (fields: (keyof AlertFormData)[]) => {
    return fields.reduce((count, field) => {
      const value = formData[field]
      if (Array.isArray(value) && value.length > 0) return count + 1
      if (value !== null && value !== undefined) return count + 1
      return count
    }, 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--inverse-surface)]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden card-elevated ambient-shadow">
        {/* Header */}
        <div className="bg-[var(--surface-container-lowest)] px-8 py-6 border-b border-[var(--surface-container-high)]">
          <h2 className="title-lg text-[var(--on-surface)]">
            {editingAlert ? 'Modifier l\'alerte' : 'Créer une nouvelle alerte'}
          </h2>
          <p className="body-md text-[var(--on-surface-variant)] mt-1">
            Configurez les critères de surveillance pour recevoir des notifications
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-180px)]">
          <div className="bg-[var(--surface-container-lowest)]">

            {/* Section Identité */}
            <Section
              id="identity"
              title="Identité & Destinataires"
              expanded={expandedSections.identity}
              onToggle={() => toggleSection('identity')}
            >
              <div className="space-y-6">
                <div>
                  <p className="label-md mb-2">Nom de l'alerte</p>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)]"
                    placeholder="Ex: Studios Paris centre"
                    required
                  />
                </div>

                <div>
                  <p className="label-md mb-2">Emails de notification</p>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                      className="input-stitch flex-1 px-4 py-3 rounded-xl text-[var(--on-surface)]"
                      placeholder="email@exemple.com"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={addEmail}
                      className="px-6 py-3 bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] rounded-xl font-medium transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.emails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.emails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-2 bg-[var(--primary-fixed)] text-[var(--primary)] px-3 py-1.5 rounded-full text-sm"
                        >
                          {email}
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => removeEmail(email)}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[var(--primary)]/10 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Section Localisation */}
            <Section
              id="location"
              title="Localisation"
              expanded={expandedSections.location}
              onToggle={() => toggleSection('location')}
            >
              <div className="space-y-6">
                <div>
                  <p className="label-md mb-2">Villes ciblées</p>
                  <CityAutocomplete
                    onSelect={addVille}
                    selectedCities={formData.villes}
                  />
                  {formData.villes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.villes.map((ville) => (
                        <span
                          key={ville}
                          className="inline-flex items-center gap-2 bg-[var(--secondary-fixed)] text-[var(--secondary)] px-3 py-1.5 rounded-full text-sm"
                        >
                          {formatCityDisplay(ville)}
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => removeVille(ville)}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[var(--secondary)]/10 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="label-md mb-3">Mode de surveillance</p>
                  <select
                    value={formData.date_filter_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_filter_type: e.target.value as DateFilterType,
                        date_visite_min: null,
                        date_visite_max: null,
                      })
                    }
                    className="input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)] bg-[var(--surface-container)]"
                  >
                    <option value="alerte">Alertes (nouveaux DPE uniquement)</option>
                    <option value="entre">Entre 2 dates</option>
                    <option value="depuis">Depuis une date</option>
                    <option value="tous">Tous les DPE</option>
                  </select>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                    {formData.date_filter_type === 'alerte' && "Vous recevrez uniquement les nouveaux DPE depuis le dernier scan"}
                    {formData.date_filter_type === 'entre' && "Filtrer les DPE dont la visite a eu lieu entre 2 dates"}
                    {formData.date_filter_type === 'depuis' && "Filtrer les DPE dont la visite a eu lieu depuis une date"}
                    {formData.date_filter_type === 'tous' && "Aucun filtre sur la date de visite"}
                  </p>

                  {formData.date_filter_type === 'entre' && (
                    <div className="flex gap-4 mt-4">
                      <div className="flex-1">
                        <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Du</label>
                        <input
                          type="date"
                          value={formData.date_visite_min || ''}
                          onChange={(e) => setFormData({ ...formData, date_visite_min: e.target.value || null })}
                          className="input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)]"
                          required
                        />
                      </div>
                      <span className="flex items-center text-[var(--on-surface-variant)] pt-5">—</span>
                      <div className="flex-1">
                        <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Au</label>
                        <input
                          type="date"
                          value={formData.date_visite_max || ''}
                          onChange={(e) => setFormData({ ...formData, date_visite_max: e.target.value || null })}
                          className="input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.date_filter_type === 'depuis' && (
                    <div className="mt-4">
                      <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Depuis le</label>
                      <input
                        type="date"
                        value={formData.date_visite_min || ''}
                        onChange={(e) => setFormData({ ...formData, date_visite_min: e.target.value || null })}
                        className="input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)]"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Section Bâtiment */}
            <Section
              id="building"
              title="Bâtiment"
              badge={countActiveFilters(['types_batiment', 'typologies_logement', 'surface_min', 'surface_max', 'hauteur_sous_plafond_min', 'nombre_appartement_min', 'nombre_niveau_immeuble_min', 'numero_etage_min', 'ratio_surface_min'])}
              expanded={expandedSections.building}
              onToggle={() => toggleSection('building')}
            >
              <div className="space-y-6">
                <div>
                  <p className="label-md mb-3">Catégorie de bien</p>
                  <ButtonGroup
                    options={TYPES_BATIMENT}
                    selected={formData.types_batiment}
                    onToggle={(t) => toggleArrayItem('types_batiment', t)}
                  />
                </div>

                <div>
                  <p className="label-md mb-3">Typologie</p>
                  <ButtonGroup
                    options={TYPOLOGIES_LOGEMENT}
                    selected={formData.typologies_logement}
                    onToggle={(t) => toggleArrayItem('typologies_logement', t)}
                    small
                  />
                </div>

                <RangeInputs
                  label="Surface habitable"
                  unit="m²"
                  minValue={formData.surface_min}
                  maxValue={formData.surface_max}
                  onMinChange={(v) => setFormData({ ...formData, surface_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, surface_max: v })}
                />

                <RangeInputs
                  label="Hauteur sous plafond"
                  unit="m"
                  minValue={formData.hauteur_sous_plafond_min}
                  maxValue={formData.hauteur_sous_plafond_max}
                  onMinChange={(v) => setFormData({ ...formData, hauteur_sous_plafond_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, hauteur_sous_plafond_max: v })}
                  step={0.1}
                />

                <RangeInputs
                  label="Nombre d'appartements"
                  minValue={formData.nombre_appartement_min}
                  maxValue={formData.nombre_appartement_max}
                  onMinChange={(v) => setFormData({ ...formData, nombre_appartement_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, nombre_appartement_max: v })}
                />

                <RangeInputs
                  label="Nombre de niveaux"
                  minValue={formData.nombre_niveau_immeuble_min}
                  maxValue={formData.nombre_niveau_immeuble_max}
                  onMinChange={(v) => setFormData({ ...formData, nombre_niveau_immeuble_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, nombre_niveau_immeuble_max: v })}
                />

                <RangeInputs
                  label="Numéro d'étage"
                  minValue={formData.numero_etage_min}
                  maxValue={formData.numero_etage_max}
                  onMinChange={(v) => setFormData({ ...formData, numero_etage_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, numero_etage_max: v })}
                />

                <RangeInputs
                  label="Ratio surface logement/immeuble"
                  unit="%"
                  minValue={formData.ratio_surface_min}
                  maxValue={formData.ratio_surface_max}
                  onMinChange={(v) => setFormData({ ...formData, ratio_surface_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, ratio_surface_max: v })}
                  step={1}
                />

                <div>
                  <p className="label-md mb-3">Performance énergétique (DPE)</p>
                  <div className="flex gap-2">
                    {ETIQUETTES.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => toggleArrayItem('etiquettes_dpe', e)}
                        className={`w-11 h-11 rounded-xl font-bold transition-all ${
                          formData.etiquettes_dpe.includes(e)
                            ? `${ETIQUETTE_COLORS[e].bgSelected} ${ETIQUETTE_COLORS[e].text} scale-105`
                            : `${ETIQUETTE_COLORS[e].bg} text-[var(--on-surface-variant)]`
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-md mb-3">Émissions carbone (GES)</p>
                  <div className="flex gap-2">
                    {ETIQUETTES.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => toggleArrayItem('etiquettes_ges', e)}
                        className={`w-11 h-11 rounded-xl font-bold transition-all ${
                          formData.etiquettes_ges.includes(e)
                            ? `${ETIQUETTE_COLORS[e].bgSelected} ${ETIQUETTE_COLORS[e].text} scale-105`
                            : `${ETIQUETTE_COLORS[e].bg} text-[var(--on-surface-variant)]`
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Section Chauffage / ECS */}
            <Section
              id="energy"
              title="Chauffage & Eau chaude"
              badge={countActiveFilters(['types_installation_chauffage', 'types_installation_ecs', 'types_energie', 'volume_stockage_ecs_min'])}
              expanded={expandedSections.energy}
              onToggle={() => toggleSection('energy')}
            >
              <div className="space-y-6">
                <div>
                  <p className="label-md mb-3">Type installation chauffage</p>
                  <ButtonGroup
                    options={TYPES_INSTALLATION_CHAUFFAGE}
                    selected={formData.types_installation_chauffage}
                    onToggle={(t) => toggleArrayItem('types_installation_chauffage', t)}
                    small
                  />
                </div>

                <div>
                  <p className="label-md mb-3">Type installation ECS</p>
                  <ButtonGroup
                    options={TYPES_INSTALLATION_ECS}
                    selected={formData.types_installation_ecs}
                    onToggle={(t) => toggleArrayItem('types_installation_ecs', t)}
                    small
                  />
                </div>

                <MultiSelectDropdown
                  label="Type d'énergie"
                  options={TYPES_ENERGIE}
                  selected={formData.types_energie}
                  onToggle={(t) => toggleArrayItem('types_energie', t)}
                />

                <RangeInputs
                  label="Volume stockage ECS"
                  unit="L"
                  minValue={formData.volume_stockage_ecs_min}
                  maxValue={formData.volume_stockage_ecs_max}
                  onMinChange={(v) => setFormData({ ...formData, volume_stockage_ecs_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, volume_stockage_ecs_max: v })}
                />
              </div>
            </Section>

            {/* Section Confort / Isolation */}
            <Section
              id="comfort"
              title="Confort & Isolation"
              badge={countActiveFilters(['indicateurs_confort_ete', 'logement_traversant', 'isolation_toiture', 'qualites_isolation_plancher', 'types_ventilation'])}
              expanded={expandedSections.comfort}
              onToggle={() => toggleSection('comfort')}
            >
              <div className="space-y-6">
                <div>
                  <p className="label-md mb-3">Confort d'été</p>
                  <ButtonGroup
                    options={INDICATEURS_CONFORT_ETE}
                    selected={formData.indicateurs_confort_ete}
                    onToggle={(t) => toggleArrayItem('indicateurs_confort_ete', t)}
                  />
                </div>

                <div>
                  <p className="label-md mb-3">Logement traversant</p>
                  <BooleanFilter
                    value={formData.logement_traversant}
                    onChange={(v) => setFormData({ ...formData, logement_traversant: v })}
                  />
                </div>

                <div>
                  <p className="label-md mb-3">Isolation toiture</p>
                  <BooleanFilter
                    value={formData.isolation_toiture}
                    onChange={(v) => setFormData({ ...formData, isolation_toiture: v })}
                  />
                </div>

                <div>
                  <p className="label-md mb-3">Qualité isolation plancher</p>
                  <ButtonGroup
                    options={QUALITES_ISOLATION_PLANCHER}
                    selected={formData.qualites_isolation_plancher}
                    onToggle={(t) => toggleArrayItem('qualites_isolation_plancher', t)}
                    small
                  />
                </div>

                <MultiSelectDropdown
                  label="Type de ventilation"
                  options={TYPES_VENTILATION}
                  selected={formData.types_ventilation}
                  onToggle={(t) => toggleArrayItem('types_ventilation', t)}
                />
              </div>
            </Section>

            {/* Section Consommation / Émissions */}
            <Section
              id="consumption"
              title="Consommation & Émissions"
              badge={countActiveFilters(['conso_energie_min', 'emission_ges_min'])}
              expanded={expandedSections.consumption}
              onToggle={() => toggleSection('consumption')}
            >
              <div className="space-y-6">
                <RangeInputs
                  label="Consommation énergie"
                  unit="kWh/m²/an"
                  minValue={formData.conso_energie_min}
                  maxValue={formData.conso_energie_max}
                  onMinChange={(v) => setFormData({ ...formData, conso_energie_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, conso_energie_max: v })}
                />

                <RangeInputs
                  label="Émissions GES"
                  unit="kg CO2/m²/an"
                  minValue={formData.emission_ges_min}
                  maxValue={formData.emission_ges_max}
                  onMinChange={(v) => setFormData({ ...formData, emission_ges_min: v })}
                  onMaxChange={(v) => setFormData({ ...formData, emission_ges_max: v })}
                />
              </div>
            </Section>

          </div>

          {/* Actions */}
          <div className="px-8 py-5 bg-[var(--surface-container-low)] flex gap-4 sticky bottom-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClose}
              className="flex-1 px-6 py-3 text-[var(--primary)] hover:bg-[var(--surface-container)] rounded-xl font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                formData.emails.length === 0 ||
                formData.villes.length === 0 ||
                (formData.surface_min !== null && formData.surface_max !== null && formData.surface_min > formData.surface_max)
              }
              className="flex-1 px-6 py-3 btn-primary-gradient text-[var(--on-primary)] rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : editingAlert ? 'Enregistrer' : 'Créer l\'alerte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
