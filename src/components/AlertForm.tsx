'use client'

import { useState } from 'react'
import { Alert, AlertFormData } from '@/lib/types'
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

export function AlertForm({ alert: editingAlert, onClose }: AlertFormProps) {
  const [loading, setLoading] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  const [formData, setFormData] = useState<AlertFormData>({
    name: editingAlert?.name || '',
    emails: editingAlert?.emails || [],
    villes: editingAlert?.villes || [],
    surface_min: editingAlert?.surface_min || null,
    surface_max: editingAlert?.surface_max || null,
    etiquettes_dpe: editingAlert?.etiquettes_dpe || [],
    etiquettes_ges: editingAlert?.etiquettes_ges || [],
    types_batiment: editingAlert?.types_batiment || [],
  })

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

  const toggleEtiquetteDPE = (e: string) => {
    const current = formData.etiquettes_dpe
    const newList = current.includes(e)
      ? current.filter((x) => x !== e)
      : [...current, e]
    setFormData({ ...formData, etiquettes_dpe: newList })
  }

  const toggleEtiquetteGES = (e: string) => {
    const current = formData.etiquettes_ges
    const newList = current.includes(e)
      ? current.filter((x) => x !== e)
      : [...current, e]
    setFormData({ ...formData, etiquettes_ges: newList })
  }

  const toggleTypeBatiment = (t: string) => {
    const current = formData.types_batiment
    const newList = current.includes(t)
      ? current.filter((x) => x !== t)
      : [...current, t]
    setFormData({ ...formData, types_batiment: newList })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--inverse-surface)]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden card-elevated ambient-shadow">
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
          <div className="px-8 py-6 space-y-8 bg-[var(--surface-container-lowest)]">

            {/* Alert Identity */}
            <section>
              <h3 className="title-md text-[var(--on-surface)] mb-4">Identité de l'alerte</h3>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)]"
                placeholder="Ex: Studios Paris centre"
                required
              />
            </section>

            {/* Notification Emails */}
            <section>
              <h3 className="title-md text-[var(--on-surface)] mb-4">Emails de notification</h3>
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
                        onClick={() => removeEmail(email)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[var(--primary)]/10 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Target Cities */}
            <section>
              <h3 className="title-md text-[var(--on-surface)] mb-4">Villes ciblées</h3>
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
                        onClick={() => removeVille(ville)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[var(--secondary)]/10 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Technical Specifications */}
            <section>
              <h3 className="title-md text-[var(--on-surface)] mb-4">Spécifications techniques</h3>

              {/* Surface */}
              <div className="mb-6">
                <p className="label-md mb-3">Surface habitable (m²)</p>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.surface_min || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          surface_min: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className={`input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)] ${
                        formData.surface_min && formData.surface_max && formData.surface_min > formData.surface_max
                          ? 'ring-2 ring-[var(--error)]'
                          : ''
                      }`}
                      placeholder="Min"
                      min={0}
                    />
                  </div>
                  <span className="flex items-center text-[var(--on-surface-variant)]">—</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.surface_max || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          surface_max: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className={`input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)] ${
                        formData.surface_min && formData.surface_max && formData.surface_min > formData.surface_max
                          ? 'ring-2 ring-[var(--error)]'
                          : ''
                      }`}
                      placeholder="Max"
                      min={0}
                    />
                  </div>
                </div>
                {formData.surface_min && formData.surface_max && formData.surface_min > formData.surface_max && (
                  <p className="text-[var(--error)] text-sm mt-2">
                    La surface minimum ne peut pas être supérieure à la surface maximum
                  </p>
                )}
              </div>

              {/* Building Type */}
              <div className="mb-6">
                <p className="label-md mb-3">Catégorie de bien</p>
                <div className="flex flex-wrap gap-2">
                  {TYPES_BATIMENT.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTypeBatiment(t)}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        formData.types_batiment.includes(t)
                          ? 'btn-primary-gradient text-[var(--on-primary)]'
                          : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* DPE Labels */}
              <div className="mb-6">
                <p className="label-md mb-3">Performance énergétique (DPE)</p>
                <div className="flex gap-2">
                  {ETIQUETTES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => toggleEtiquetteDPE(e)}
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

              {/* GES Labels */}
              <div>
                <p className="label-md mb-3">Émissions carbone (GES)</p>
                <div className="flex gap-2">
                  {ETIQUETTES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => toggleEtiquetteGES(e)}
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
            </section>

          </div>

          {/* Actions */}
          <div className="px-8 py-5 bg-[var(--surface-container-low)] flex gap-4">
            <button
              type="button"
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
