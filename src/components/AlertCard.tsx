'use client'

import { useState } from 'react'
import { Alert, DPEResult } from '@/lib/types'

interface AlertCardProps {
  alert: Alert
  onEdit: () => void
  onDelete: () => void
  onToggle: (active: boolean) => void
}

const ETIQUETTE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-emerald-500', text: 'text-white' },
  B: { bg: 'bg-green-500', text: 'text-white' },
  C: { bg: 'bg-lime-400', text: 'text-gray-900' },
  D: { bg: 'bg-yellow-400', text: 'text-gray-900' },
  E: { bg: 'bg-orange-400', text: 'text-white' },
  F: { bg: 'bg-orange-600', text: 'text-white' },
  G: { bg: 'bg-red-600', text: 'text-white' },
}

export function AlertCard({ alert, onEdit, onDelete, onToggle }: AlertCardProps) {
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    count: number
    dpes: DPEResult[]
    message: string
  } | null>(null)
  const [testError, setTestError] = useState<string | null>(null)

  const formatDate = (date: string | null) => {
    if (!date) return 'Jamais'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleTest = async () => {
    setTesting(true)
    setTestError(null)
    setTestResults(null)

    try {
      const response = await fetch(`/api/alerts/${alert.id}/test`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du test')
      }

      setTestResults(data)
    } catch (error) {
      setTestError((error as Error).message)
    } finally {
      setTesting(false)
    }
  }

  const closeResults = () => {
    setTestResults(null)
    setTestError(null)
  }

  return (
    <div
      className={`card-elevated ambient-shadow p-6 transition-all duration-200 hover:translate-y-[-2px] ${
        !alert.active ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="title-lg text-[var(--on-surface)] truncate pr-4">
            {alert.name}
          </h3>
          <p className="label-md mt-1">
            {alert.active ? 'Surveillance active' : 'En pause'}
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(!alert.active)}
          className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors duration-200 ${
            alert.active ? 'toggle-track active' : 'toggle-track'
          }`}
          aria-label={alert.active ? 'Désactiver' : 'Activer'}
        >
          <span
            className={`toggle-thumb absolute top-1 left-1 w-5 h-5 rounded-full shadow-sm ${
              alert.active ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Status Pill */}
      <div className="mb-5">
        {alert.active ? (
          <span className="pill-success inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-[var(--secondary)] rounded-full animate-pulse" />
            Active
          </span>
        ) : (
          <span className="pill-warning inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium">
            En pause
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 mb-6">
        {/* Emails */}
        <div>
          <p className="label-md mb-1.5">Destinataires</p>
          <div className="flex flex-wrap gap-1.5">
            {alert.emails.slice(0, 2).map((email) => (
              <span
                key={email}
                className="bg-[var(--surface-container)] text-[var(--on-surface-variant)] px-2.5 py-1 rounded-lg text-xs"
              >
                {email}
              </span>
            ))}
            {alert.emails.length > 2 && (
              <span className="text-[var(--on-surface-variant)] text-xs py-1">
                +{alert.emails.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Villes */}
        <div>
          <p className="label-md mb-1.5">Localisation</p>
          <p className="body-md text-[var(--on-surface)]">
            {alert.villes.join(', ')}
          </p>
        </div>

        {/* Surface */}
        {(alert.surface_min || alert.surface_max) && (
          <div>
            <p className="label-md mb-1.5">Surface</p>
            <p className="body-md text-[var(--on-surface)]">
              {alert.surface_min ? `${alert.surface_min} m²` : '0 m²'} —{' '}
              {alert.surface_max ? `${alert.surface_max} m²` : '∞'}
            </p>
          </div>
        )}

        {/* Etiquettes */}
        {(alert.etiquettes_dpe.length > 0 || alert.etiquettes_ges.length > 0) && (
          <div className="flex gap-6">
            {alert.etiquettes_dpe.length > 0 && (
              <div>
                <p className="label-md mb-1.5">DPE</p>
                <div className="flex gap-1">
                  {alert.etiquettes_dpe.map((e) => (
                    <span
                      key={e}
                      className={`${ETIQUETTE_COLORS[e].bg} ${ETIQUETTE_COLORS[e].text} w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold`}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {alert.etiquettes_ges.length > 0 && (
              <div>
                <p className="label-md mb-1.5">GES</p>
                <div className="flex gap-1">
                  {alert.etiquettes_ges.map((e) => (
                    <span
                      key={e}
                      className={`${ETIQUETTE_COLORS[e].bg} ${ETIQUETTE_COLORS[e].text} w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold`}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Types */}
        {alert.types_batiment.length > 0 && (
          <div>
            <p className="label-md mb-1.5">Types de biens</p>
            <p className="body-md text-[var(--on-surface)]">
              {alert.types_batiment.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Test Results */}
      {(testResults || testError) && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--surface-container)]">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-[var(--on-surface)]">
              Résultat du test
            </h4>
            <button
              onClick={closeResults}
              className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] text-lg leading-none"
            >
              ×
            </button>
          </div>

          {testError ? (
            <p className="text-[var(--error)] text-sm">{testError}</p>
          ) : testResults && (
            <>
              <p className="text-sm text-[var(--on-surface-variant)] mb-3">
                {testResults.message}
              </p>

              {testResults.dpes.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testResults.dpes.map((dpe) => (
                    <a
                      key={dpe.numero_dpe}
                      href={`https://observatoire-dpe-audit.ademe.fr/afficher-dpe/${dpe.numero_dpe}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-[var(--surface)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--on-surface)] truncate">
                            {dpe.adresse || 'Adresse non renseignée'}
                          </p>
                          <p className="text-xs text-[var(--on-surface-variant)]">
                            {dpe.code_postal} {dpe.ville} · {dpe.surface} m²
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <span
                            className={`${ETIQUETTE_COLORS[dpe.etiquette_dpe]?.bg || 'bg-gray-400'} ${ETIQUETTE_COLORS[dpe.etiquette_dpe]?.text || 'text-white'} px-2 py-0.5 rounded text-xs font-bold`}
                          >
                            {dpe.etiquette_dpe}
                          </span>
                          <span
                            className={`${ETIQUETTE_COLORS[dpe.etiquette_ges]?.bg || 'bg-gray-400'} ${ETIQUETTE_COLORS[dpe.etiquette_ges]?.text || 'text-white'} px-2 py-0.5 rounded text-xs font-bold`}
                          >
                            {dpe.etiquette_ges}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                  {testResults.count > 10 && (
                    <p className="text-xs text-[var(--on-surface-variant)] text-center pt-2">
                      +{testResults.count - 10} autres résultats
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-[var(--surface-container-high)]">
        <p className="label-md mb-4">
          Dernier check : {formatDate(alert.last_checked_at)}
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex-1 px-4 py-2.5 btn-primary-gradient text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {testing ? 'Test en cours...' : 'Tester'}
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] rounded-lg text-sm font-medium transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2.5 text-[var(--error)] hover:bg-[var(--error-container)] rounded-lg text-sm font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
