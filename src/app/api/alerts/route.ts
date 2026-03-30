import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Liste toutes les alertes
export async function GET() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST - Crée une nouvelle alerte
export async function POST(request: NextRequest) {
  const body = await request.json()

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
    active: true,
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
