import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { fetchNewDPEs } from '@/lib/ademe'
import { Alert } from '@/lib/types'

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

    // Créer une copie de l'alerte sans last_dpe_date pour avoir les 7 derniers jours
    const testAlert: Alert = {
      ...alert,
      last_dpe_date: null,
    }

    // Récupérer les DPE
    const dpes = await fetchNewDPEs(testAlert)

    return NextResponse.json({
      success: true,
      count: dpes.length,
      dpes: dpes.slice(0, 10), // Limiter à 10 résultats pour la prévisualisation
      message: dpes.length > 0
        ? `${dpes.length} DPE trouvé${dpes.length > 1 ? 's' : ''} dans les 7 derniers jours`
        : 'Aucun DPE trouvé avec ces critères dans les 7 derniers jours',
    })
  } catch (error) {
    console.error('Test alert error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
