import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { checkDeliveryPincode, createOrder, verifyPayment } from '../lib/backend.js'
import { useAuth } from '../context/AuthContext.jsx'

const DELIVERY_THRESHOLD = 499
const DELIVERY_FEE = 40
const initialForm = { name: '', phone: '', address: '', landmark: '', city: 'Gudivada', state: 'Andhra Pradesh', pincode: '', slot: 'Morning (7 AM – 10 AM)', payment: 'cod' }

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { profile, user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [pincodeStatus, setPincodeStatus] = useState(null)
  const [checkingPin, setCheckingPin] = useState(false)
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')

  const delivery = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + delivery

  const canSubmit = useMemo(() => !placing && items.length > 0, [placing, items.length])

  useEffect(() => {
    if (!profile) return
    setForm((prev) => ({ ...prev, name: prev.name || profile.name || '', phone: prev.phone || profile.phone || '' }))
  }, [profile])

  if (items.length === 0) return <div className="container-page py-20 text-center"><h1 className="font-display text-3xl text-ink">Nothing to checkout</h1><p className="mt-2 text-ink/55">Add a few fresh favourites first.</p><Link to="/shop" className="btn-primary mt-7">Go to Shop</Link></div>

  function setField(name, value) { setForm((prev) => ({ ...prev, [name]: value })); setErrors((prev) => ({ ...prev, [name]: '' })); if (name === 'pincode') setPincodeStatus(null) }

  async function verifyPincode() {
    if (!/^\d{6}$/.test(form.pincode)) { setErrors((e) => ({ ...e, pincode: 'Enter a valid 6-digit pincode.' })); return }
    setCheckingPin(true); setPincodeStatus(null)
    try { setPincodeStatus(await checkDeliveryPincode(form.pincode)) } finally { setCheckingPin(false) }
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!/^[6-9]\d{9}$/.test(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.'
    if (!form.address.trim()) next.address = 'Enter your delivery address.'
    if (!/^\d{6}$/.test(form.pincode)) next.pincode = 'Enter a valid 6-digit pincode.'
    if (!pincodeStatus?.deliverable) next.pincode = 'Please verify a serviceable pincode.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function loadRazorpay() {
    if (window.Razorpay) return true
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      script.onerror = () => reject(new Error('Could not load Razorpay Checkout. Check your internet connection.'))
      document.body.appendChild(script)
    })
    return true
  }

  async function placeOrder(e) {
    e.preventDefault()
    if (!validate()) return
    if (!user) { setErrors({ form: 'Please sign in before placing an order.' }); return }
    setPlacing(true); setPaymentMessage('')
    try {
      const result = await createOrder(items, { ...form, subtotal, delivery, total })
      if (form.payment === 'cod') {
        clearCart()
        navigate(`/order-success/${result.order.id}`)
        return
      }
      if (!result.razorpay) throw new Error('Online payment is not configured yet.')
      await loadRazorpay()
      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: result.razorpay.keyId,
          amount: result.razorpay.amount,
          currency: result.razorpay.currency,
          name: 'SR Dairy Fresh',
          description: 'Fresh dairy order',
          order_id: result.razorpay.orderId,
          prefill: { name: form.name, contact: `+91${form.phone}`, email: user.email || '' },
          theme: { color: '#3F6B4F' },
          handler: async (response) => {
            try {
              await verifyPayment({ orderId: result.order.id, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature })
              clearCart()
              navigate(`/order-success/${result.order.id}`)
              resolve()
            } catch (error) { reject(error) }
          },
          modal: { ondismiss: () => reject(new Error('Payment window closed. Your order is still awaiting payment and can be retried later.')) },
        })
        checkout.open()
      })
    } catch (error) {
      setErrors({ form: error.message || 'Could not place order. Please try again.' })
    } finally { setPlacing(false) }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink"><ArrowLeft size={16} /> Back to Cart</Link>
      <div className="mt-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage">Almost there</p><h1 className="mt-2 font-display text-3xl font-medium text-ink sm:text-4xl">Checkout</h1><p className="mt-2 text-ink/55">Tell us where to deliver your fresh order.</p></div>

      <form onSubmit={placeOrder} className="mt-8 grid gap-7 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-3xl border border-ink/10 bg-milk p-5 sm:p-7"><SectionTitle icon={<MapPin size={18} />} title="Delivery details" /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Full name" value={form.name} onChange={(v) => setField('name', v)} error={errors.name} placeholder="Your name" /><Field label="Mobile number" value={form.phone} onChange={(v) => setField('phone', v.replace(/\D/g, '').slice(0, 10))} error={errors.phone} placeholder="10-digit mobile number" inputMode="numeric" /><Field label="Address" value={form.address} onChange={(v) => setField('address', v)} error={errors.address} placeholder="House no, street, area" className="sm:col-span-2" /><Field label="Landmark (optional)" value={form.landmark} onChange={(v) => setField('landmark', v)} placeholder="Near..." /><Field label="Pincode" value={form.pincode} onChange={(v) => setField('pincode', v.replace(/\D/g, '').slice(0, 6))} error={errors.pincode} placeholder="6-digit pincode" inputMode="numeric" /></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="City" value={form.city} onChange={(v) => setField('city', v)} /><Field label="State" value={form.state} onChange={(v) => setField('state', v)} /></div><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={verifyPincode} disabled={checkingPin} className="btn-secondary">{checkingPin ? 'Checking...' : 'Check delivery availability'}</button>{pincodeStatus && <span className={`text-sm font-semibold ${pincodeStatus.deliverable ? 'text-sage-dark' : 'text-ink/60'}`}>{pincodeStatus.deliverable ? '✓ Delivery available' : 'We do not deliver here yet'}</span>}</div></section>

          <section className="rounded-3xl border border-ink/10 bg-milk p-5 sm:p-7"><SectionTitle icon={<Truck size={18} />} title="Delivery slot" /><div className="mt-5 grid gap-3 sm:grid-cols-3">{['Morning (7 AM – 10 AM)', 'Afternoon (12 PM – 3 PM)', 'Evening (5 PM – 8 PM)'].map((slot) => <button type="button" key={slot} onClick={() => setField('slot', slot)} className={`rounded-2xl border p-4 text-left text-sm font-semibold ${form.slot === slot ? 'border-sage bg-sage-light text-sage-dark' : 'border-ink/10 hover:border-sage'}`}>{form.slot === slot && <CheckCircle2 size={16} className="mb-2" />} {slot}</button>)}</div></section>

          <section className="rounded-3xl border border-ink/10 bg-milk p-5 sm:p-7"><SectionTitle icon={<CreditCard size={18} />} title="Payment method" /><div className="mt-5 grid gap-3 sm:grid-cols-2"><PaymentOption value="cod" selected={form.payment} onChange={(v) => setField('payment', v)} title="Cash on Delivery" subtitle="Pay when your order arrives" /><PaymentOption value="online" selected={form.payment} onChange={(v) => setField('payment', v)} title="UPI / Card" subtitle="Secure Razorpay checkout" /></div><div className="mt-4 flex gap-2 rounded-xl bg-gold-light p-3 text-xs text-ink/65"><ShieldCheck size={16} className="shrink-0 text-sage" /> Online payments are processed by Razorpay. Your secret key never reaches the browser.</div></section>
        </div>

        <aside className="rounded-3xl border border-ink/10 bg-cream/55 p-5 sm:p-6 lg:sticky lg:top-24"><h2 className="font-display text-2xl text-ink">Order summary</h2><div className="mt-5 space-y-3">{items.map((item) => <div key={item.key} className="flex gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream"><img src={item.image} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{item.name}</p><p className="text-xs text-ink/50">{item.unit} × {item.quantity}</p></div><span className="text-sm font-semibold">₹{item.price * item.quantity}</span></div>)}</div><div className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm"><div className="flex justify-between text-ink/60"><span>Subtotal</span><span>₹{subtotal}</span></div><div className="flex justify-between text-ink/60"><span>Delivery</span><span>{delivery ? `₹${delivery}` : 'FREE'}</span></div><div className="flex justify-between border-t border-ink/10 pt-4 text-base font-bold"><span>Total</span><span>₹{total}</span></div></div>{errors.form && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}<button type="submit" disabled={!canSubmit} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50">{placing ? 'Placing order...' : `Place Order · ₹${total}`}</button><p className="mt-3 text-center text-xs text-ink/45">By placing the order, you agree to our delivery and refund policies.</p></aside>
      </form>
    </div>
  )
}

function SectionTitle({ icon, title }) { return <div className="flex items-center gap-2 text-sage"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light">{icon}</span><h2 className="font-display text-xl text-ink">{title}</h2></div> }
function Field({ label, value, onChange, error, placeholder, inputMode, className = '' }) { return <label className={`block ${className}`}><span className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className={`mt-2 w-full rounded-xl border bg-milk px-4 py-3 text-sm outline-none focus:border-sage ${error ? 'border-red-300' : 'border-ink/10'}`} />{error && <span className="mt-1 block text-xs text-red-700">{error}</span>}</label> }
function PaymentOption({ value, selected, onChange, title, subtitle }) { return <button type="button" onClick={() => onChange(value)} className={`rounded-2xl border p-4 text-left ${selected === value ? 'border-sage bg-sage-light' : 'border-ink/10'}`}><span className="flex items-center gap-2 font-semibold text-ink"><span className={`h-4 w-4 rounded-full border-4 ${selected === value ? 'border-sage' : 'border-ink/20'}`} />{title}</span><span className="mt-1 block pl-6 text-xs text-ink/50">{subtitle}</span></button> }
