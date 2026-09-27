import { products as localProducts, getProductById as getLocalProductById } from '../data/products.js'
import { supabase } from './supabase.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
const DELIVERY_THRESHOLD = 499
const DELIVERY_FEE = 40

export { DELIVERY_THRESHOLD, DELIVERY_FEE }

export async function fetchProducts() {
  if (!supabase) return localProducts
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) throw error
  return (data || []).map(normalizeProduct)
}

export async function fetchProductById(id) {
  if (!supabase) return getLocalProductById(id) ?? null
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? normalizeProduct(data) : null
}

function normalizeProduct(product) {
  return { ...product, unitPrices: product.unit_prices || product.unitPrices || {}, reviewCount: product.review_count ?? product.reviewCount ?? 0, defaultUnit: product.default_unit || product.defaultUnit }
}

export async function checkDeliveryPincode(pincode) {
  if (!supabase) return { pincode, deliverable: ['516001','516002','516003','516390'].includes(pincode) }
  const { data, error } = await supabase.from('serviceable_pincodes').select('pincode,city,state').eq('pincode', pincode).eq('active', true).maybeSingle()
  if (error) throw error
  return { pincode, deliverable: Boolean(data), city: data?.city, state: data?.state }
}

async function authHeaders() {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Please sign in to continue.')
  return { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}), ...(await authHeaders()) }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Request failed.')
  return payload
}

export async function createOrder(cartItems, customerDetails) {
  return api('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ items: cartItems, customer: customerDetails, paymentMethod: customerDetails.payment }),
  })
}

export async function verifyPayment(payload) {
  return api('/api/payments/verify', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateAdminOrderStatus(orderId, status) {
  return api(`/api/admin/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
