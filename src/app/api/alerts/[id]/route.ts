import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Modifier une alerte
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const body = await request.json()

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
  if (body.active !== undefined) updateData.active = body.active

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

  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
