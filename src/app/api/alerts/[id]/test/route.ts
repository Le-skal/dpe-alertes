import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { fetchDPEsForDate, getLatestADEMEUpdateDate } from '@/lib/ademe'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceClient()

  try {
    // Récupérer l'alerte
    const { data: alert, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !alert) {
      return NextResponse.json(
        { error: 'Alerte non trouvée' },
        { status: 404 }
      )
    }

    // Récupérer la dernière date de mise à jour de la base ADEME
    const latestDate = await getLatestADEMEUpdateDate()

    if (!latestDate) {
      return NextResponse.json({
        success: false,
        count: 0,
        dpes: [],
        message: 'Impossible de récupérer la date de dernière mise à jour ADEME',
      })
    }

    // Récupérer les DPE pour cette date
    const dpes = await fetchDPEsForDate(alert, latestDate)

    // Formater la date pour l'affichage
    const dateFormatted = new Date(latestDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return NextResponse.json({
      success: true,
      count: dpes.length,
      dpes: dpes.slice(0, 10), // Limiter à 10 résultats pour la prévisualisation
      latestDate,
      message: dpes.length > 0
        ? `${dpes.length} DPE trouvé${dpes.length > 1 ? 's' : ''} le ${dateFormatted}`
        : `Aucun DPE trouvé avec ces critères le ${dateFormatted}`,
    })
  } catch (error) {
    console.error('Test alert error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
