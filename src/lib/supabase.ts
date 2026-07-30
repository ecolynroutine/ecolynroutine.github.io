import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

function clean(value?: string) {
  const next = value?.trim() || ''
  return next.startsWith('__VITE_') ? '' : next
}

export function getSupabaseConfig() {
  return {
    url: clean(import.meta.env.VITE_SUPABASE_URL || window.ECOLYN_CONFIG?.supabaseUrl),
    anonKey: clean(import.meta.env.VITE_SUPABASE_ANON_KEY || window.ECOLYN_CONFIG?.supabaseAnonKey),
  }
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig()
  if (!url || anonKey.length < 20) return false

  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client
  if (!isSupabaseConfigured()) {
    client = null
    return client
  }

  const { url, anonKey } = getSupabaseConfig()
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'ecolyn-admin-session',
    },
  })
  return client
}

export function resetSupabaseClientForTests() {
  client = undefined
}
