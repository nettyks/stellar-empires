import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes dans .env')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
