import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'sr-dairy-cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
  }, [items])

  function addItem(product, unit, quantity = 1) {
    setItems((prev) => {
      const key = `${product.id}-${unit}`
      const existing = prev.find((i) => i.key === key)
      if (existing) return prev.map((i) => i.key === key ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { key, id: product.id, name: product.name, image: product.image, unit, price: product.unitPrices[unit], quantity }]
    })
  }

  function removeItem(key) { setItems((prev) => prev.filter((i) => i.key !== key)) }
  function updateQuantity(key, quantity) {
    if (!Number.isFinite(quantity) || quantity <= 0) return removeItem(key)
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, quantity: Math.max(1, Math.floor(quantity)) } : i))
  }
  function clearCart() { setItems([]) }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
