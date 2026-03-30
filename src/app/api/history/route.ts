import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getServiceClient()

  try {
    const { data: history, error } = await supabase
      .from('email_history')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(history || [])
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
