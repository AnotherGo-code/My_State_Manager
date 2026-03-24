import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Helper function to get session with timeout
export async function getSessionWithTimeout(timeoutMs = 5000) {
  const timeoutId = setTimeout(() => {}, timeoutMs)
  
  try {
    const { data, error } = await supabase.auth.getSession()
    clearTimeout(timeoutId)
    return { data, error }
  } catch (err) {
    clearTimeout(timeoutId)
    return { data: null, error: err }
  }
}