import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Modifier une alerte
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user can edit this alert (owner or shared alert for guests)
  const { data: alert } = await supabase
    .from('alerts')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!alert) {
    return NextResponse.json({ error: 'Alerte non trouvée' }, { status: 404 })
  }

  // Permission check:
  // - If alert has no user_id (shared), anyone can edit
  // - If alert has user_id, only that user can edit
  if (alert.user_id && (!user || alert.user_id !== user.id)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const updateData: Record<string, unknown> = {}

  // Ne mettre à jour que les champs fournis
  if (body.name !== undefined) updateData.name = body.name
  if (body.emails !== undefined) updateData.emails = body.emails
  if (body.villes !== undefined) updateData.villes = body.villes
  if (body.surface_min !== undefined) updateData.surface_min = body.surface_min
  if (body.surface_max !== undefined) updateData.surface_max = body.surface_max
  if (body.etiquettes_dpe !== undefined) updateData.etiquettes_dpe = body.etiquettes_dpe
  if (body.etiquettes_ges !== undefined) updateData.etiquettes_ges = body.etiquettes_ges
  if (body.types_batiment !== undefined) updateData.types_batiment = body.types_batiment
  if (body.date_filter_type !== undefined) updateData.date_filter_type = body.date_filter_type
  if (body.date_visite_min !== undefined) updateData.date_visite_min = body.date_visite_min
  if (body.date_visite_max !== undefined) updateData.date_visite_max = body.date_visite_max
  if (body.active !== undefined) updateData.active = body.active

  // Nouveaux filtres Chauffage/ECS
  if (body.types_installation_chauffage !== undefined) updateData.types_installation_chauffage = body.types_installation_chauffage
  if (body.types_installation_ecs !== undefined) updateData.types_installation_ecs = body.types_installation_ecs
  if (body.types_energie !== undefined) updateData.types_energie = body.types_energie
  if (body.volume_stockage_ecs_min !== undefined) updateData.volume_stockage_ecs_min = body.volume_stockage_ecs_min
  if (body.volume_stockage_ecs_max !== undefined) updateData.volume_stockage_ecs_max = body.volume_stockage_ecs_max

  // Nouveaux filtres Batiment
  if (body.hauteur_sous_plafond_min !== undefined) updateData.hauteur_sous_plafond_min = body.hauteur_sous_plafond_min
  if (body.hauteur_sous_plafond_max !== undefined) updateData.hauteur_sous_plafond_max = body.hauteur_sous_plafond_max
  if (body.nombre_appartement_min !== undefined) updateData.nombre_appartement_min = body.nombre_appartement_min
  if (body.nombre_appartement_max !== undefined) updateData.nombre_appartement_max = body.nombre_appartement_max
  if (body.nombre_niveau_immeuble_min !== undefined) updateData.nombre_niveau_immeuble_min = body.nombre_niveau_immeuble_min
  if (body.nombre_niveau_immeuble_max !== undefined) updateData.nombre_niveau_immeuble_max = body.nombre_niveau_immeuble_max
  if (body.numero_etage_min !== undefined) updateData.numero_etage_min = body.numero_etage_min
  if (body.numero_etage_max !== undefined) updateData.numero_etage_max = body.numero_etage_max
  if (body.typologies_logement !== undefined) updateData.typologies_logement = body.typologies_logement
  if (body.ratio_surface_min !== undefined) updateData.ratio_surface_min = body.ratio_surface_min
  if (body.ratio_surface_max !== undefined) updateData.ratio_surface_max = body.ratio_surface_max

  // Nouveaux filtres Confort/Isolation
  if (body.indicateurs_confort_ete !== undefined) updateData.indicateurs_confort_ete = body.indicateurs_confort_ete
  if (body.logement_traversant !== undefined) updateData.logement_traversant = body.logement_traversant
  if (body.isolation_toiture !== undefined) updateData.isolation_toiture = body.isolation_toiture
  if (body.qualites_isolation_plancher !== undefined) updateData.qualites_isolation_plancher = body.qualites_isolation_plancher
  if (body.types_ventilation !== undefined) updateData.types_ventilation = body.types_ventilation

  // Nouveaux filtres Consommation/Emissions
  if (body.conso_energie_min !== undefined) updateData.conso_energie_min = body.conso_energie_min
  if (body.conso_energie_max !== undefined) updateData.conso_energie_max = body.conso_energie_max
  if (body.emission_ges_min !== undefined) updateData.emission_ges_min = body.emission_ges_min
  if (body.emission_ges_max !== undefined) updateData.emission_ges_max = body.emission_ges_max

  const { data, error } = await supabase
    .from('alerts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE - Supprimer une alerte
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user can delete this alert
  const { data: alert } = await supabase
    .from('alerts')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!alert) {
    return NextResponse.json({ error: 'Alerte non trouvée' }, { status: 404 })
  }

  // Permission check
  if (alert.user_id && (!user || alert.user_id !== user.id)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
