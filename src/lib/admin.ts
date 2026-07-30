import type { User } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

export interface AdminSession {
  user: User
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session?.user) return null

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error || !data) return null
  return { user: session.user }
}

export async function signInAdmin(email: string, password: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED')

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('INVALID_CREDENTIALS')

  const admin = await getAdminSession()
  if (!admin) {
    await supabase.auth.signOut()
    throw new Error('NOT_ADMIN')
  }
  return admin
}

export async function signOutAdmin() {
  await getSupabase()?.auth.signOut()
}
