'use client'

import { useEffect, useState } from 'react'
import { AlertCard } from '@/components/AlertCard'
import { AlertForm } from '@/components/AlertForm'
import { Alert, EmailHistory } from '@/lib/types'

type Tab = 'dashboard' | 'active' | 'archived' | 'history' | 'stats'

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts')
      const data = await res.json()
      setAlerts(data)
    } catch (error) {
      console.error('Erreur chargement alertes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      if (Array.isArray(data)) {
        setEmailHistory(data)
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    }
  }

  useEffect(() => {
    fetchAlerts()
    fetchHistory()
  }, [])

  const handleCreate = () => {
    setEditingAlert(null)
    setShowForm(true)
  }

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingAlert(null)
    fetchAlerts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette alerte ?')) return

    await fetch(`/api/alerts/${id}`, { method: 'DELETE' })
    fetchAlerts()
  }

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    fetchAlerts()
  }

  const handleScanNow = async () => {
    setScanning(true)
    setScanResult(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
      })

      const data = await res.json()

      // Log full response to console for debugging
      console.log('Scan response:', data)

      if (data.success) {
        // Build details string
        let details = `${data.processed || 0} alerte(s) scannée(s)`
        if (data.logs && data.logs.length > 0) {
          details += '\n' + data.logs.map((log: { name: string; dpeFound: number; error?: string }) =>
            `• ${log.name}: ${log.dpeFound} DPE${log.error ? ` (erreur: ${log.error})` : ''}`
          ).join('\n')
        }

        setScanResult({
          success: true,
          message: data.message,
          details,
        })
      } else {
        setScanResult({
          success: false,
          message: data.error || 'Erreur lors du scan',
          details: data.errors?.join('\n'),
        })
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Erreur de connexion',
      })
    } finally {
      setScanning(false)
      fetchAlerts()
      fetchHistory()
    }
  }

  const activeAlerts = alerts.filter((a) => a.active)
  const pausedAlerts = alerts.filter((a) => !a.active)

  // Content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--primary-fixed)] border-t-[var(--primary)] rounded-full animate-spin" />
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {alerts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 bg-[var(--surface-container)] rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--on-surface-variant)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="title-lg text-[var(--on-surface)] mb-2">Aucune alerte configurée</h3>
                <p className="body-md text-[var(--on-surface-variant)] mb-6 max-w-md mx-auto">
                  Créez votre première alerte pour commencer à surveiller les nouveaux DPE.
                </p>
                <button onClick={handleCreate} className="text-[var(--primary)] font-medium hover:underline">
                  Créer votre première alerte →
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {activeAlerts.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="title-lg text-[var(--on-surface)]">Surveillances actives</h3>
                      <span className="pill-success px-2.5 py-1 rounded-full text-xs font-medium">
                        {activeAlerts.length}
                      </span>
                    </div>
                    <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
                      {activeAlerts.map((alert) => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          onEdit={() => handleEdit(alert)}
                          onDelete={() => handleDelete(alert.id)}
                          onToggle={(active) => handleToggle(alert.id, active)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {pausedAlerts.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="title-lg text-[var(--on-surface)]">En pause</h3>
                      <span className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] px-2.5 py-1 rounded-full text-xs font-medium">
                        {pausedAlerts.length}
                      </span>
                    </div>
                    <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
                      {pausedAlerts.map((alert) => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          onEdit={() => handleEdit(alert)}
                          onDelete={() => handleDelete(alert.id)}
                          onToggle={(active) => handleToggle(alert.id, active)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )

      case 'active':
        return (
          <section>
            {activeAlerts.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface-container-lowest)] rounded-2xl">
                <p className="body-md text-[var(--on-surface-variant)]">Aucune alerte active.</p>
              </div>
            ) : (
              <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
                {activeAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onEdit={() => handleEdit(alert)}
                    onDelete={() => handleDelete(alert.id)}
                    onToggle={(active) => handleToggle(alert.id, active)}
                  />
                ))}
              </div>
            )}
          </section>
        )

      case 'archived':
        return (
          <section>
            {pausedAlerts.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface-container-lowest)] rounded-2xl">
                <p className="body-md text-[var(--on-surface-variant)]">Aucune alerte en pause.</p>
              </div>
            ) : (
              <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
                {pausedAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onEdit={() => handleEdit(alert)}
                    onDelete={() => handleDelete(alert.id)}
                    onToggle={(active) => handleToggle(alert.id, active)}
                  />
                ))}
              </div>
            )}
          </section>
        )

      case 'history':
        return (
          <section>
            {emailHistory.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface-container-lowest)] rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-[var(--surface-container)] rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--on-surface-variant)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="body-md text-[var(--on-surface-variant)]">Aucun email envoyé pour le moment.</p>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">Les emails apparaîtront ici après chaque scan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emailHistory.map((entry) => (
                  <div key={entry.id} className="card-elevated ambient-shadow p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="title-md text-[var(--on-surface)]">{entry.alert_name}</h4>
                        <p className="text-sm text-[var(--on-surface-variant)]">
                          {new Date(entry.sent_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="pill-success px-3 py-1 rounded-full text-xs font-medium">
                        {entry.dpe_count} DPE
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="label-md mb-1">Destinataires</p>
                      <p className="text-sm text-[var(--on-surface)]">{entry.recipients.join(', ')}</p>
                    </div>

                    {entry.dpe_summary && entry.dpe_summary.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-[var(--surface-container-high)]">
                        <p className="label-md">DPE envoyés</p>
                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                          {entry.dpe_summary.slice(0, 5).map((dpe) => (
                            <a
                              key={dpe.numero_dpe}
                              href={`https://observatoire-dpe-audit.ademe.fr/afficher-dpe/${dpe.numero_dpe}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-between items-center p-2 bg-[var(--surface-container)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-[var(--on-surface)] truncate">{dpe.adresse || 'Adresse non renseignée'}</p>
                                <p className="text-xs text-[var(--on-surface-variant)]">{dpe.ville} · {dpe.surface} m²</p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  dpe.etiquette_dpe === 'A' ? 'bg-emerald-500 text-white' :
                                  dpe.etiquette_dpe === 'B' ? 'bg-green-500 text-white' :
                                  dpe.etiquette_dpe === 'C' ? 'bg-lime-400 text-gray-900' :
                                  dpe.etiquette_dpe === 'D' ? 'bg-yellow-400 text-gray-900' :
                                  dpe.etiquette_dpe === 'E' ? 'bg-orange-400 text-white' :
                                  dpe.etiquette_dpe === 'F' ? 'bg-orange-600 text-white' :
                                  'bg-red-600 text-white'
                                }`}>{dpe.etiquette_dpe}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  dpe.etiquette_ges === 'A' ? 'bg-emerald-500 text-white' :
                                  dpe.etiquette_ges === 'B' ? 'bg-green-500 text-white' :
                                  dpe.etiquette_ges === 'C' ? 'bg-lime-400 text-gray-900' :
                                  dpe.etiquette_ges === 'D' ? 'bg-yellow-400 text-gray-900' :
                                  dpe.etiquette_ges === 'E' ? 'bg-orange-400 text-white' :
                                  dpe.etiquette_ges === 'F' ? 'bg-orange-600 text-white' :
                                  'bg-red-600 text-white'
                                }`}>{dpe.etiquette_ges}</span>
                              </div>
                            </a>
                          ))}
                          {entry.dpe_summary.length > 5 && (
                            <p className="text-xs text-[var(--on-surface-variant)] text-center py-1">
                              +{entry.dpe_summary.length - 5} autres
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )

      case 'stats':
        const totalDPEsFound = emailHistory.reduce((sum, e) => sum + e.dpe_count, 0)
        const alertStats = alerts.map(alert => {
          const alertEmails = emailHistory.filter(e => e.alert_id === alert.id)
          return {
            ...alert,
            emailCount: alertEmails.length,
            dpeCount: alertEmails.reduce((sum, e) => sum + e.dpe_count, 0),
          }
        }).sort((a, b) => b.dpeCount - a.dpeCount)

        return (
          <section>
            {/* Main stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
              <div className="card-elevated ambient-shadow p-4 lg:p-6 text-center">
                <p className="label-md mb-1">Alertes</p>
                <p className="text-2xl lg:display-md font-bold text-[var(--primary)]">{alerts.length}</p>
              </div>
              <div className="card-elevated ambient-shadow p-4 lg:p-6 text-center">
                <p className="label-md mb-1">Actives</p>
                <p className="text-2xl lg:display-md font-bold text-[var(--secondary)]">{activeAlerts.length}</p>
              </div>
              <div className="card-elevated ambient-shadow p-4 lg:p-6 text-center">
                <p className="label-md mb-1">Emails</p>
                <p className="text-2xl lg:display-md font-bold text-[var(--primary)]">{emailHistory.length}</p>
              </div>
              <div className="card-elevated ambient-shadow p-4 lg:p-6 text-center">
                <p className="label-md mb-1">DPE trouvés</p>
                <p className="text-2xl lg:display-md font-bold text-[var(--secondary)]">{totalDPEsFound}</p>
              </div>
            </div>

            {/* Per-alert stats */}
            {alertStats.length > 0 && (
              <div className="card-elevated ambient-shadow p-5 mb-6">
                <h4 className="title-md text-[var(--on-surface)] mb-4">DPE par alerte</h4>
                <div className="space-y-3">
                  {alertStats.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-[var(--surface-container)] rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${alert.active ? 'bg-[var(--secondary)]' : 'bg-[var(--on-surface-variant)]'}`} />
                        <span className="text-sm text-[var(--on-surface)]">{alert.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[var(--on-surface-variant)]">{alert.emailCount} email{alert.emailCount > 1 ? 's' : ''}</span>
                        <span className="font-semibold text-[var(--primary)]">{alert.dpeCount} DPE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan button for mobile */}
            <div className="card-elevated ambient-shadow p-4 lg:hidden">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="label-md">Prochain scan</p>
                  <p className="body-md text-[var(--on-surface)]">Tous les jours à 8h</p>
                </div>
                <button
                  onClick={handleScanNow}
                  disabled={scanning || activeAlerts.length === 0}
                  className="btn-primary-gradient text-[var(--on-primary)] px-4 py-2 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {scanning ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Scanner
                </button>
              </div>
              {scanResult && (
                <p className={`text-sm ${scanResult.success ? 'text-[var(--secondary)]' : 'text-[var(--error)]'}`}>
                  {scanResult.message}
                </p>
              )}
            </div>
          </section>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden lg:flex w-72 bg-[var(--surface-container-lowest)] flex-col flex-shrink-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 btn-primary-gradient rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h1 className="title-md text-[var(--on-surface)]">DPE Monitor</h1>
              <p className="text-xs text-[var(--on-surface-variant)]">Informed Guardian</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { id: 'active', label: 'Alertes actives', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: activeAlerts.length },
              { id: 'archived', label: 'En pause', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', badge: pausedAlerts.length },
              { id: 'history', label: 'Historique', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', badge: emailHistory.length },
              { id: 'stats', label: 'Statistiques', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === item.id
                      ? 'bg-[var(--primary-fixed)] text-[var(--primary)] font-medium'
                      : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.id === 'active' ? 'pill-success' : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-4 space-y-3">
          <div className="p-4 bg-[var(--surface-container)] rounded-xl">
            <p className="label-md mb-2">Prochain scan auto</p>
            <p className="body-md text-[var(--on-surface)]">Tous les jours à 8h</p>
          </div>

          <button
            onClick={handleScanNow}
            disabled={scanning || activeAlerts.length === 0}
            className="w-full px-4 py-3 btn-primary-gradient text-[var(--on-primary)] rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scan en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Scanner maintenant
              </>
            )}
          </button>

          {scanResult && (
            <div className={`p-3 rounded-xl text-sm ${
              scanResult.success
                ? 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)]'
                : 'bg-[var(--error-container)] text-[var(--on-error-container)]'
            }`}>
              <p className="font-medium">{scanResult.message}</p>
              {scanResult.details && (
                <p className="mt-1 text-xs opacity-80 whitespace-pre-line">{scanResult.details}</p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:h-screen lg:overflow-y-auto">
        {/* Mobile Header (gradient) */}
        <header className="lg:hidden btn-primary-gradient text-white p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">DPE Alertes</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-sm text-white/80 mt-1">
            {activeAlerts.length} surveillance{activeAlerts.length > 1 ? 's' : ''} active{activeAlerts.length > 1 ? 's' : ''}
          </p>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-[var(--surface-container-lowest)] px-8 py-6 items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="display-md text-[var(--on-surface)]">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'active' && 'Alertes actives'}
              {activeTab === 'archived' && 'En pause'}
              {activeTab === 'history' && 'Historique'}
              {activeTab === 'stats' && 'Statistiques'}
            </h2>
            <p className="body-md text-[var(--on-surface-variant)] mt-1">
              {activeTab === 'dashboard' && '« Surveiller le marché immobilier avec précision »'}
              {activeTab === 'active' && `${activeAlerts.length} surveillance${activeAlerts.length > 1 ? 's' : ''} en cours`}
              {activeTab === 'archived' && `${pausedAlerts.length} alerte${pausedAlerts.length > 1 ? 's' : ''} en pause`}
              {activeTab === 'history' && `${emailHistory.length} email${emailHistory.length > 1 ? 's' : ''} envoyé${emailHistory.length > 1 ? 's' : ''}`}
              {activeTab === 'stats' && 'Vue d\'ensemble de vos alertes'}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary-gradient text-[var(--on-primary)] px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle alerte
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-auto">
          {renderContent()}
        </div>
      </main>

      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-container-lowest)] border-t border-[var(--outline-variant)] z-20">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 ${
              activeTab === 'dashboard' ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs">Dash</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 relative ${
              activeTab === 'active' ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-xs">Alertes</span>
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 right-1 w-5 h-5 bg-[var(--secondary)] text-white text-xs rounded-full flex items-center justify-center">
                {activeAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 relative ${
              activeTab === 'history' ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Emails</span>
            {emailHistory.length > 0 && (
              <span className="absolute -top-1 right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center">
                {emailHistory.length > 9 ? '9+' : emailHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 ${
              activeTab === 'stats' ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Stats</span>
          </button>

          <button
            onClick={handleCreate}
            className="w-12 h-12 btn-primary-gradient rounded-full flex items-center justify-center -mt-4 shadow-lg"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Form Modal */}
      {showForm && <AlertForm alert={editingAlert} onClose={handleClose} />}
    </div>
  )
}
