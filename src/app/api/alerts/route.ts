import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET - Liste les alertes (de l'utilisateur + partagées)
export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })

  if (user) {
    // Logged in: show ONLY user's alerts
    query = query.eq('user_id', user.id)
  } else {
    // Guest: show only shared alerts
    query = query.is('user_id', null)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST - Crée une nouvelle alerte
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Validation
  if (!body.name || !body.emails?.length || !body.villes?.length) {
    return NextResponse.json(
      { error: 'Nom, emails et villes sont requis' },
      { status: 400 }
    )
  }

  const alertData = {
    name: body.name,
    emails: body.emails,
    villes: body.villes,
    surface_min: body.surface_min || null,
    surface_max: body.surface_max || null,
    etiquettes_dpe: body.etiquettes_dpe || [],
    etiquettes_ges: body.etiquettes_ges || [],
    types_batiment: body.types_batiment || [],
    date_filter_type: body.date_filter_type || 'alerte',
    date_visite_min: body.date_visite_min || null,
    date_visite_max: body.date_visite_max || null,
    // Nouveaux filtres Chauffage/ECS
    types_installation_chauffage: body.types_installation_chauffage || [],
    types_installation_ecs: body.types_installation_ecs || [],
    types_energie: body.types_energie || [],
    volume_stockage_ecs_min: body.volume_stockage_ecs_min || null,
    volume_stockage_ecs_max: body.volume_stockage_ecs_max || null,
    // Nouveaux filtres Batiment
    hauteur_sous_plafond_min: body.hauteur_sous_plafond_min || null,
    hauteur_sous_plafond_max: body.hauteur_sous_plafond_max || null,
    nombre_appartement_min: body.nombre_appartement_min || null,
    nombre_appartement_max: body.nombre_appartement_max || null,
    nombre_niveau_immeuble_min: body.nombre_niveau_immeuble_min || null,
    nombre_niveau_immeuble_max: body.nombre_niveau_immeuble_max || null,
    numero_etage_min: body.numero_etage_min || null,
    numero_etage_max: body.numero_etage_max || null,
    typologies_logement: body.typologies_logement || [],
    ratio_surface_min: body.ratio_surface_min || null,
    ratio_surface_max: body.ratio_surface_max || null,
    // Nouveaux filtres Confort/Isolation
    indicateurs_confort_ete: body.indicateurs_confort_ete || [],
    logement_traversant: body.logement_traversant ?? null,
    isolation_toiture: body.isolation_toiture ?? null,
    qualites_isolation_plancher: body.qualites_isolation_plancher || [],
    types_ventilation: body.types_ventilation || [],
    // Nouveaux filtres Consommation/Emissions
    conso_energie_min: body.conso_energie_min || null,
    conso_energie_max: body.conso_energie_max || null,
    emission_ges_min: body.emission_ges_min || null,
    emission_ges_max: body.emission_ges_max || null,
    active: true,
    // User ID: null for guests, user.id for logged in users
    user_id: user?.id || null,
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert(alertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
