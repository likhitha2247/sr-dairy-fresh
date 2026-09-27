import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  async function loadProfile(userId) {
    if (!supabase || !userId) return null
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    setProfile(data)
    return data
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        try { await loadProfile(data.session.user.id) } catch { /* profile trigger may still be settling */ }
      }
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        try { await loadProfile(nextSession.user.id) } catch { /* ignore transient profile errors */ }
      } else setProfile(null)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    async signUp({ email, password, name, phone }) {
      if (!supabase) throw new Error('Supabase is not configured. Copy .env.example to .env and add your project keys.')
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } })
      if (error) throw error
      if (data.user && !data.session) return { needsEmailConfirmation: true }
      return { needsEmailConfirmation: false }
    },
    async signIn(email, password) {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) await loadProfile(data.user.id)
      return data
    },
    async signOut() {
      if (!supabase) return
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }), [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
