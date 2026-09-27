import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, LockKeyhole, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()
  const next = new URLSearchParams(location.search).get('next') || '/account'
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault(); setError(''); setMessage(''); setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password)
        navigate(next, { replace: true })
      } else {
        const result = await signUp(form)
        if (result.needsEmailConfirmation) setMessage('Account created. Check your email to confirm your account, then sign in.')
        else navigate(next, { replace: true })
      }
    } catch (err) { setError(err.message || 'Authentication failed.') }
    finally { setBusy(false) }
  }

  return <div className="container-page py-12 sm:py-20"><div className="mx-auto max-w-md"><div className="rounded-[2rem] border border-ink/10 bg-milk p-6 shadow-sm sm:p-8"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-light text-sage"><UserRound size={25} /></div><h1 className="mt-5 text-center font-display text-3xl text-ink">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1><p className="mt-2 text-center text-sm text-ink/55">Track orders, save your details and checkout faster.</p><form onSubmit={submit} className="mt-7 space-y-4">{mode === 'signup' && <><Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" /><Field label="Mobile number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, '').slice(0,10) })} placeholder="10-digit mobile number" /></>}<Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" type="email" /><Field label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="At least 6 characters" type="password" />{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="flex gap-2 rounded-xl bg-sage-light p-3 text-sm text-sage-dark"><CheckCircle2 size={17} className="shrink-0" />{message}</p>}<button disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}<ArrowRight size={17} /></button></form><button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }} className="mt-5 w-full text-center text-sm font-semibold text-sage hover:text-sage-dark">{mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></div><p className="mt-5 text-center text-xs text-ink/45"><LockKeyhole size={13} className="mr-1 inline" />Your authentication is handled by Supabase Auth.</p><Link to="/shop" className="mt-5 block text-center text-sm font-semibold text-ink/60 hover:text-ink">Continue shopping</Link></div></div>
}
function Field({ label, value, onChange, placeholder, type='text' }) { return <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</span><input required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/30 px-4 py-3 text-sm outline-none focus:border-sage" /></label> }
