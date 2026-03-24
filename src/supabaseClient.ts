import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'configured' : 'missing',
    key: supabaseAnonKey ? 'configured' : 'missing'
  })
}

console.log('Supabase URL configured:', !!supabaseUrl)

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Helper function to get session with timeout
export async function getSessionWithTimeout(timeoutMs = 8000): Promise<any> {
  return Promise.race([
    supabase.auth.getSession(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Session check timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]).catch(err => {
    console.error('Session error:', err)
    return { data: null, error: err }
  })
}