import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { fetchNewDPEs, getLatestDPEDate } from '@/lib/ademe'
import { sendAlertEmail } from '@/lib/resend'
import { Alert } from '@/lib/types'

export const maxDuration = 60

interface AlertLog {
  name: string
  villes: string[]
  lastDpeDate: string | null
  dpeFound: number
  emailSent: boolean
  error?: string
}

export async function POST() {
  const supabase = getServiceClient()

  const report = {
    processed: 0,
    emailsSent: 0,
    totalNewDPEs: 0,
    errors: [] as string[],
    logs: [] as AlertLog[],
  }

  console.log('=== SCAN STARTED ===')
  console.log('Time:', new Date().toISOString())

  try {
    // Récupérer toutes les alertes actives
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('active', true)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Erreur Supabase: ${error.message}`)
    }

    console.log(`Found ${alerts?.length || 0} active alert(s)`)

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune alerte active à scanner',
        ...report,
      })
    }

    // Traiter chaque alerte
    for (const alert of alerts as Alert[]) {
      const alertLog: AlertLog = {
        name: alert.name,
        villes: alert.villes,
        lastDpeDate: alert.last_dpe_date,
        dpeFound: 0,
        emailSent: false,
      }

      console.log(`\n--- Processing alert: "${alert.name}" ---`)
      console.log('  Villes:', alert.villes.join(', '))
      console.log('  Surface:', alert.surface_min, '-', alert.surface_max)
      console.log('  DPE labels:', alert.etiquettes_dpe.join(', ') || 'any')
      console.log('  GES labels:', alert.etiquettes_ges.join(', ') || 'any')
      console.log('  Types:', alert.types_batiment.join(', ') || 'any')
      console.log('  Last DPE date:', alert.last_dpe_date || 'none (will use last 7 days)')

      try {
        report.processed++

        // Récupérer les nouveaux DPE
        const dpes = await fetchNewDPEs(alert)
        alertLog.dpeFound = dpes.length

        console.log(`  => Found ${dpes.length} DPE(s)`)

        if (dpes.length > 0) {
          report.totalNewDPEs += dpes.length

          // Log first few results
          console.log('  First results:')
          dpes.slice(0, 3).forEach((dpe, i) => {
            console.log(`    ${i + 1}. ${dpe.adresse}, ${dpe.ville} - ${dpe.surface}m² - DPE:${dpe.etiquette_dpe} GES:${dpe.etiquette_ges}`)
          })

          // Envoyer l'email
          await sendAlertEmail(alert.emails, alert.name, dpes)
          report.emailsSent++
          alertLog.emailSent = true
          console.log(`  => Email sent to: ${alert.emails.join(', ')}`)

          // Enregistrer dans l'historique
          const dpeSummary = dpes.slice(0, 20).map(dpe => ({
            numero_dpe: dpe.numero_dpe,
            adresse: dpe.adresse,
            ville: dpe.ville,
            etiquette_dpe: dpe.etiquette_dpe,
            etiquette_ges: dpe.etiquette_ges,
            surface: dpe.surface,
          }))

          await supabase.from('email_history').insert({
            alert_id: alert.id,
            alert_name: alert.name,
            recipients: alert.emails,
            dpe_count: dpes.length,
            dpe_summary: dpeSummary,
          })
          console.log(`  => Email history recorded`)

          // Mettre à jour le curseur
          const latestDate = getLatestDPEDate(dpes)
          await supabase
            .from('alerts')
            .update({
              last_checked_at: new Date().toISOString(),
              last_dpe_date: latestDate,
            })
            .eq('id', alert.id)
          console.log(`  => Updated last_dpe_date to: ${latestDate}`)
        } else {
          // Juste mettre à jour last_checked_at
          await supabase
            .from('alerts')
            .update({
              last_checked_at: new Date().toISOString(),
            })
            .eq('id', alert.id)
          console.log('  => No new DPE, updated last_checked_at only')
        }
      } catch (alertError) {
        const errorMsg = `Erreur alerte "${alert.name}": ${(alertError as Error).message}`
        console.error('  => ERROR:', errorMsg)
        alertLog.error = (alertError as Error).message
        report.errors.push(errorMsg)
      }

      report.logs.push(alertLog)
    }

    console.log('\n=== SCAN COMPLETED ===')
    console.log('Processed:', report.processed)
    console.log('Total DPEs found:', report.totalNewDPEs)
    console.log('Emails sent:', report.emailsSent)
    console.log('Errors:', report.errors.length)

    return NextResponse.json({
      success: true,
      message: report.totalNewDPEs > 0
        ? `${report.totalNewDPEs} nouveau(x) DPE trouvé(s), ${report.emailsSent} email(s) envoyé(s)`
        : 'Aucun nouveau DPE trouvé',
      ...report,
    })
  } catch (error) {
    console.error('=== SCAN FAILED ===')
    console.error('Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        ...report,
      },
      { status: 500 }
    )
  }
}
