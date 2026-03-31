import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables SUPABASE_URL et SUPABASE_SERVICE_KEY manquantes')
}

// Client serveur avec la clé service (accès complet, côté backend uniquement)
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
