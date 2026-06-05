import { createClient } from '@supabase/supabase-js'

// Always use relative URLs so requests go through the current origin.
// The proxy/rewrite layer handles forwarding to the real Supabase backend:
//   Dev:  Vite proxy   → localhost     → supabase.co
//   Prod: Vercel rewrites → vercel.app → supabase.co
const supabaseUrl = typeof window !== 'undefined' ? window.location.origin : ''

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
  console.warn('⚠️ Supabase anon key is missing. App may not function correctly.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

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
