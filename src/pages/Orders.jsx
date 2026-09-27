import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, PackageCheck, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

const labels = { awaiting_payment:'Awaiting payment', placed:'Order placed', confirmed:'Confirmed', packed:'Packed', out_for_delivery:'Out for delivery', delivered:'Delivered', cancelled:'Cancelled', payment_failed:'Payment failed', refunded:'Refunded' }
const steps = ['placed','confirmed','packed','out_for_delivery','delivered']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  async function load() {
    setLoading(true); setError('')
    try {
      const { data, error: queryError } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
      if (queryError) throw queryError
      setOrders(data || [])
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  return <div className="container-page py-10 sm:py-14"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage">Order history</p><h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Track your orders</h1></div><button onClick={load} className="btn-secondary"><RefreshCw size={16} /> Refresh</button></div>{loading ? <p className="py-16 text-center text-sm text-ink/55">Loading orders…</p> : error ? <p className="mt-8 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : orders.length === 0 ? <div className="mt-10 rounded-3xl border border-dashed border-ink/15 p-12 text-center"><PackageCheck className="mx-auto text-sage" size={35} /><h2 className="mt-4 font-display text-2xl">No orders yet</h2><Link to="/shop" className="btn-primary mt-5">Start shopping</Link></div> : <div className="mt-8 space-y-5">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>}</div>
}
function OrderCard({ order }) { const active = steps.indexOf(order.status); return <article className="rounded-3xl border border-ink/10 bg-milk p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-wider text-ink/45">Order #{order.id.slice(0,8).toUpperCase()}</p><h2 className="mt-1 font-display text-2xl text-ink">{labels[order.status] || order.status}</h2><p className="mt-1 text-xs text-ink/45">{new Date(order.created_at).toLocaleString('en-IN')}</p></div><div className="text-left sm:text-right"><p className="text-xs text-ink/45">Total</p><p className="text-lg font-bold text-ink">₹{order.total}</p><p className="text-xs text-ink/50">{order.payment_method === 'cod' ? 'Cash on delivery' : order.payment_status === 'paid' ? 'Paid online' : 'Online payment'}</p></div></div>{order.status !== 'cancelled' && order.status !== 'payment_failed' && order.status !== 'refunded' && <div className="mt-7 grid grid-cols-5 gap-1">{steps.map((step, index) => <div key={step} className="text-center"><div className={`mx-auto h-2 rounded-full ${index <= active ? 'bg-sage' : 'bg-ink/10'}`} /><p className={`mt-2 text-[10px] font-semibold ${index <= active ? 'text-sage-dark' : 'text-ink/35'}`}>{labels[step]}</p></div>)}</div>}<div className="mt-5 flex flex-wrap gap-2 border-t border-ink/10 pt-4">{(order.order_items || []).map((item) => <span key={item.id} className="rounded-full bg-cream px-3 py-1 text-xs text-ink/65">{item.name} · {item.unit} × {item.quantity}</span>)}<span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-ink/55">{order.customer?.city}, {order.customer?.pincode} <ChevronRight size={14} /></span></div></article> }
