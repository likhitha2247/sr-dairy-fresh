import { useEffect, useMemo, useState } from 'react'
import { Package, RefreshCw, Search, Truck, IndianRupee } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { updateAdminOrderStatus } from '../lib/backend.js'

const statuses = ['placed','confirmed','packed','out_for_delivery','delivered','cancelled','payment_failed','refunded']
const labels = { placed:'Placed', confirmed:'Confirmed', packed:'Packed', out_for_delivery:'Out for delivery', delivered:'Delivered', cancelled:'Cancelled', payment_failed:'Payment failed', refunded:'Refunded' }

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  async function load() {
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
    if (queryError) setError(queryError.message); else setOrders(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  const filtered = useMemo(() => orders.filter((o) => (status === 'all' || o.status === status) && `${o.id} ${o.customer?.name || ''} ${o.customer?.phone || ''} ${o.customer?.pincode || ''}`.toLowerCase().includes(query.toLowerCase())), [orders, status, query])
  const revenue = orders.filter((o) => ['confirmed','packed','out_for_delivery','delivered'].includes(o.status) && o.payment_status === 'paid').reduce((s,o)=>s+Number(o.total),0)
  async function changeStatus(orderId, nextStatus) {
    setBusy(orderId); setError('')
    try { const { order } = await updateAdminOrderStatus(orderId, nextStatus); setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...mapOrder(order) } : o)) }
    catch (err) { setError(err.message) } finally { setBusy('') }
  }
  return <div className="container-page py-10 sm:py-14"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage">Operations</p><h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Order management</h1><p className="mt-2 text-ink/55">Update fulfillment status from placed to delivered.</p></div><button onClick={load} className="btn-secondary"><RefreshCw size={16}/> Refresh</button></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><Stat icon={<Package size={18}/>} label="Total orders" value={orders.length}/><Stat icon={<Truck size={18}/>} label="Open orders" value={orders.filter(o=>!['delivered','cancelled','refunded'].includes(o.status)).length}/><Stat icon={<IndianRupee size={18}/>} label="Paid revenue" value={`₹${revenue.toFixed(0)}`}/></div><div className="mt-7 rounded-2xl border border-ink/10 bg-milk p-3"><div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order, customer, phone, pincode" className="w-full rounded-xl border border-ink/10 bg-cream/30 py-3 pl-11 pr-4 text-sm outline-none focus:border-sage"/></div><select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-ink/10 bg-milk px-4 py-3 text-sm outline-none focus:border-sage"><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></div></div>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <p className="py-16 text-center text-sm text-ink/55">Loading orders…</p> : <div className="mt-6 space-y-4">{filtered.map(order=><AdminOrder key={order.id} order={order} busy={busy===order.id} onStatus={changeStatus}/>)}</div>}</div>
}
function AdminOrder({ order, busy, onStatus }) { return <article className="rounded-3xl border border-ink/10 bg-milk p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-ink/45">#{order.id.slice(0,8).toUpperCase()} · {new Date(order.created_at).toLocaleString('en-IN')}</p><h2 className="mt-1 font-display text-2xl text-ink">{order.customer?.name || 'Customer'}</h2><p className="mt-1 text-sm text-ink/55">{order.customer?.phone} · {order.customer?.address}, {order.customer?.city}, {order.customer?.pincode}</p><div className="mt-3 flex flex-wrap gap-2">{(order.order_items||[]).map(i=><span key={i.id} className="rounded-full bg-cream px-3 py-1 text-xs text-ink/65">{i.name} · {i.unit} × {i.quantity}</span>)}</div></div><div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center"><div className="text-left sm:text-right"><p className="text-xs text-ink/45">₹{order.total}</p><p className="text-xs text-ink/50">{order.payment_method === 'cod' ? 'COD' : order.payment_status}</p></div><select disabled={busy} value={order.status} onChange={e=>onStatus(order.id,e.target.value)} className="rounded-xl border border-ink/10 bg-milk px-4 py-3 text-sm font-semibold outline-none focus:border-sage">{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></div></div></article> }
function mapOrder(order) { return { status: order.status, payment_status: order.paymentStatus, total: order.total, updated_at: order.updatedAt } }
function Stat({ icon, label, value }) { return <div className="rounded-3xl border border-ink/10 bg-milk p-5"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-light text-sage">{icon}</div><p className="mt-4 text-xs uppercase tracking-wider text-ink/45">{label}</p><p className="mt-1 text-2xl font-bold text-ink">{value}</p></div> }
