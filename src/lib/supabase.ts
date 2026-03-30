import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// Client pour le navigateur et les API routes
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables Supabase manquantes')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Alias pour compatibilité
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
}

// Client pour le serveur (avec permissions admin, pour le cron)
export function getServiceClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variables Supabase service role manquantes')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}
