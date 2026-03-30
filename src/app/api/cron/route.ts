import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { fetchNewDPEs, getLatestDPEDate } from '@/lib/ademe'
import { sendAlertEmail } from '@/lib/resend'
import { Alert } from '@/lib/types'

export const maxDuration = 60 // Timeout de 60 secondes pour Vercel

export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const report = {
    processed: 0,
    emails_sent: 0,
    errors: [] as string[],
  }

  try {
    // Récupérer toutes les alertes actives
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('active', true)

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`)
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({
        message: 'Aucune alerte active',
        ...report,
      })
    }

    // Traiter chaque alerte
    for (const alert of alerts as Alert[]) {
      try {
        report.processed++

        // Récupérer les nouveaux DPE
        const dpes = await fetchNewDPEs(alert)

        console.log(`Alerte "${alert.name}": ${dpes.length} DPE(s) trouvé(s)`)

        if (dpes.length > 0) {
          // Envoyer l'email
          await sendAlertEmail(alert.emails, alert.name, dpes)
          report.emails_sent++

          // Mettre à jour le curseur
          const latestDate = getLatestDPEDate(dpes)
          await supabase
            .from('alerts')
            .update({
              last_checked_at: new Date().toISOString(),
              last_dpe_date: latestDate,
            })
            .eq('id', alert.id)
        } else {
          // Juste mettre à jour last_checked_at
          await supabase
            .from('alerts')
            .update({
              last_checked_at: new Date().toISOString(),
            })
            .eq('id', alert.id)
        }
      } catch (alertError) {
        const errorMsg = `Erreur alerte "${alert.name}": ${(alertError as Error).message}`
        console.error(errorMsg)
        report.errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      message: 'Cron exécuté avec succès',
      ...report,
    })
  } catch (error) {
    console.error('Erreur cron:', error)
    return NextResponse.json(
      {
        error: (error as Error).message,
        ...report,
      },
      { status: 500 }
    )
  }
}
