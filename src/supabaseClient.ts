import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    url: supabaseUrl ? 'configured' : 'missing',
    key: supabaseAnonKey ? 'configured' : 'missing'
  })
  throw new Error('Supabase environment variables are not configured. Please create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get session with timeout protection.
 * @param timeoutMs - Timeout in milliseconds (default: 8000)
 * @returns Supabase session result
 */
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

/**
 * Safely get current user from session.
 * @returns User object or null
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

/**
 * Sign out current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
}
