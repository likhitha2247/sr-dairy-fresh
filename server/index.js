import 'dotenv/config'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const app = express()
const port = Number(process.env.PORT || 8787)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

const supabaseUrl = process.env.SUPABASE_URL
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

const admin = supabaseUrl && supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null
const authClient = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null
const razorpay = razorpayKeyId && razorpayKeySecret ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret }) : null

app.use(cors({ origin: frontendUrl, credentials: false }))
app.use('/api/razorpay/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '1mb' }))

function requireConfig() {
  if (!admin || !authClient) throw new Error('Backend is not configured. Add Supabase server variables to .env.')
}

async function getUser(req) {
  requireConfig()
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

async function requireUser(req, res, next) {
  try {
    const user = await getUser(req)
    if (!user) return res.status(401).json({ error: 'Sign in required.' })
    req.user = user
    next()
  } catch (error) { res.status(500).json({ error: error.message }) }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await getUser(req)
    if (!user) return res.status(401).json({ error: 'Sign in required.' })
    const { data: profile, error } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (error || profile?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' })
    req.user = user
    next()
  } catch (error) { res.status(500).json({ error: error.message }) }
}

function publicOrder(order) {
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    subtotal: Number(order.subtotal),
    delivery: Number(order.delivery_fee),
    total: Number(order.total),
    customer: order.customer,
    razorpayOrderId: order.razorpay_order_id,
    razorpayPaymentId: order.razorpay_payment_id,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, supabase: Boolean(admin), razorpay: Boolean(razorpay) }))

app.post('/api/orders', requireUser, async (req, res) => {
  try {
    requireConfig()
    const { items = [], customer = {}, paymentMethod = 'cod' } = req.body || {}
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Cart is empty.' })
    if (!customer.name || !customer.phone || !customer.address || !customer.city || !customer.state || !/^\d{6}$/.test(customer.pincode)) {
      return res.status(400).json({ error: 'Complete delivery details are required.' })
    }
    if (!['cod', 'online'].includes(paymentMethod)) return res.status(400).json({ error: 'Invalid payment method.' })

    const ids = [...new Set(items.map((item) => item.id).filter(Boolean))]
    const { data: products, error: productError } = await admin.from('products').select('id,name,image,unit_prices,in_stock').in('id', ids)
    if (productError) throw productError
    const productMap = new Map((products || []).map((p) => [p.id, p]))
    const normalized = []
    let subtotal = 0

    for (const raw of items) {
      const product = productMap.get(raw.id)
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(raw.quantity))))
      const unit = String(raw.unit || '')
      const price = Number(product?.unit_prices?.[unit])
      if (!product || !product.in_stock || !Number.isFinite(price) || price <= 0) return res.status(400).json({ error: `Product or unit unavailable: ${raw.id}` })
      normalized.push({ product_id: product.id, name: product.name, image: product.image, unit, quantity, unit_price: price })
      subtotal += price * quantity
    }

    const delivery = subtotal >= 499 ? 0 : 40
    const total = subtotal + delivery
    const receipt = `SR-${Date.now().toString(36).toUpperCase()}`
    let razorpayOrder = null

    if (paymentMethod === 'online') {
      if (!razorpay) return res.status(503).json({ error: 'Razorpay is not configured on the server yet.' })
      razorpayOrder = await razorpay.orders.create({ amount: Math.round(total * 100), currency: 'INR', receipt, notes: { user_id: req.user.id } })
    }

    const { data: created, error: orderError } = await admin.from('orders').insert({
      user_id: req.user.id,
      status: paymentMethod === 'online' ? 'awaiting_payment' : 'placed',
      payment_status: paymentMethod === 'online' ? 'created' : 'cod_pending',
      payment_method: paymentMethod,
      subtotal,
      delivery_fee: delivery,
      total,
      customer,
      razorpay_order_id: razorpayOrder?.id || null,
    }).select('*').single()
    if (orderError) throw orderError

    const { error: itemError } = await admin.from('order_items').insert(normalized.map((item) => ({ ...item, order_id: created.id })))
    if (itemError) {
      await admin.from('orders').delete().eq('id', created.id)
      throw itemError
    }

    res.status(201).json({ order: publicOrder(created), razorpay: razorpayOrder ? { keyId: razorpayKeyId, orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency } : null })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message || 'Could not create order.' })
  }
})

app.post('/api/payments/verify', requireUser, async (req, res) => {
  try {
    requireConfig()
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {}
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return res.status(400).json({ error: 'Missing payment verification fields.' })
    const { data: order, error } = await admin.from('orders').select('*').eq('id', orderId).eq('user_id', req.user.id).single()
    if (error || !order) return res.status(404).json({ error: 'Order not found.' })
    if (order.razorpay_order_id !== razorpayOrderId) return res.status(400).json({ error: 'Razorpay order mismatch.' })
    if (!razorpayKeySecret) return res.status(503).json({ error: 'Razorpay secret is not configured.' })
    const expected = crypto.createHmac('sha256', razorpayKeySecret).update(`${order.razorpay_order_id}|${razorpayPaymentId}`).digest('hex')
    const expectedBuffer = Buffer.from(expected)
    const signatureBuffer = Buffer.from(String(razorpaySignature))
    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) return res.status(400).json({ error: 'Payment signature verification failed.' })
    const { data: updated, error: updateError } = await admin.from('orders').update({ status: 'confirmed', payment_status: 'paid', razorpay_payment_id: razorpayPaymentId }).eq('id', order.id).select('*').single()
    if (updateError) throw updateError
    res.json({ order: publicOrder(updated) })
  } catch (error) { res.status(500).json({ error: error.message || 'Could not verify payment.' }) }
})

app.post('/api/razorpay/webhook', async (req, res) => {
  try {
    if (!webhookSecret || !admin) return res.status(503).send('Webhook not configured')
    const signature = req.headers['x-razorpay-signature']
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body))
    const expected = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex')
    if (!signature || signature !== expected) return res.status(400).send('Invalid signature')
    const event = JSON.parse(raw.toString('utf8'))
    const entity = event.payload?.payment?.entity || event.payload?.order?.entity
    const razorpayOrderId = entity?.order_id || entity?.id
    if (!razorpayOrderId) return res.json({ received: true })
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      await admin.from('orders').update({ status: 'confirmed', payment_status: 'paid', razorpay_payment_id: event.payload?.payment?.entity?.id || null }).eq('razorpay_order_id', razorpayOrderId)
    }
    if (event.event === 'payment.failed') {
      await admin.from('orders').update({ status: 'payment_failed', payment_status: 'failed' }).eq('razorpay_order_id', razorpayOrderId)
    }
    if (event.event === 'refund.processed') {
      await admin.from('orders').update({ status: 'refunded', payment_status: 'refunded' }).eq('razorpay_order_id', razorpayOrderId)
    }
    res.json({ received: true })
  } catch (error) { console.error(error); res.status(500).send('Webhook error') }
})

app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const allowed = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'payment_failed', 'refunded']
    const { status } = req.body || {}
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid order status.' })
    const { data, error } = await admin.from('orders').update({ status }).eq('id', req.params.id).select('*').single()
    if (error) throw error
    res.json({ order: publicOrder(data) })
  } catch (error) { res.status(500).json({ error: error.message || 'Could not update order status.' }) }
})

app.listen(port, () => console.log(`SR Dairy Fresh API running on http://localhost:${port}`))
