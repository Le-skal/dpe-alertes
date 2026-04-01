import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  try {
    let query = supabase
      .from('email_history')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (user) {
      // Logged in: show ONLY user's history
      query = query.eq('user_id', user.id)
    } else {
      // Guest: show only shared history
      query = query.is('user_id', null)
    }

    const { data: history, error } = await query

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
