import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

const DELIVERY_THRESHOLD = 499
const DELIVERY_FEE = 40

export default function Cart() {
  const { items, subtotal, removeItem, updateQuantity } = useCart()
  const delivery = subtotal === 0 || subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + delivery
  const remaining = Math.max(0, DELIVERY_THRESHOLD - subtotal)

  if (items.length === 0) {
    return <div className="container-page py-20 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-light text-sage"><ShoppingBag /></div><h1 className="mt-5 font-display text-3xl text-ink">Your cart is empty</h1><p className="mt-2 text-ink/55">Fresh dairy is only a few clicks away.</p><Link to="/shop" className="btn-primary mt-7">Start Shopping <ArrowRight size={17} /></Link></div>
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage">Your basket</p><h1 className="mt-2 font-display text-3xl font-medium text-ink sm:text-4xl">Shopping Cart</h1></div><Link to="/shop" className="hidden text-sm font-semibold text-sage hover:underline sm:block">Continue shopping</Link></div>

      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="overflow-hidden rounded-3xl border border-ink/10 bg-milk">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 border-b border-ink/10 p-4 last:border-0 sm:p-5">
              <Link to={`/product/${item.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream sm:h-28 sm:w-28"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></Link>
              <div className="min-w-0 flex-1"><Link to={`/product/${item.id}`} className="font-semibold text-ink hover:underline">{item.name}</Link><p className="mt-1 text-sm text-ink/50">{item.unit} · ₹{item.price}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center rounded-full border border-ink/15"><button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-2.5 text-ink/55 hover:text-ink" aria-label="Decrease quantity"><Minus size={14} /></button><span className="w-7 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-2.5 text-ink/55 hover:text-ink" aria-label="Increase quantity"><Plus size={14} /></button></div><button type="button" onClick={() => removeItem(item.key)} className="inline-flex items-center gap-1 text-xs font-semibold text-ink/45 hover:text-red-700"><Trash2 size={14} /> Remove</button></div></div>
              <p className="hidden font-display text-lg font-medium text-ink sm:block">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>

        <aside className="rounded-3xl border border-ink/10 bg-cream/55 p-5 sm:p-6 lg:sticky lg:top-24">
          {remaining > 0 ? <div className="rounded-2xl bg-sage-light p-4 text-sm text-sage-dark">Add <strong>₹{remaining}</strong> more to unlock free delivery.</div> : <div className="rounded-2xl bg-sage-light p-4 text-sm font-semibold text-sage-dark">✓ Free delivery unlocked</div>}
          <div className="mt-6 space-y-3 text-sm"><div className="flex justify-between text-ink/60"><span>Subtotal</span><span>₹{subtotal}</span></div><div className="flex justify-between text-ink/60"><span>Delivery</span><span>{delivery ? `₹${delivery}` : 'FREE'}</span></div><div className="border-t border-ink/10 pt-4"><div className="flex justify-between text-base font-bold text-ink"><span>Total</span><span>₹{total}</span></div></div></div>
          <Link to="/checkout" className="btn-primary mt-6 w-full">Proceed to Checkout <ArrowRight size={17} /></Link>
          <p className="mt-3 text-center text-xs text-ink/45">Secure checkout · Fresh delivery · Easy support</p>
        </aside>
      </div>
    </div>
  )
}
