import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { checkDeliveryPincode } from '../../lib/backend.js'

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState('')
  const [status, setStatus] = useState(null) // null | 'checking' | { deliverable }

  async function handleCheck(e) {
    e.preventDefault()
    if (pincode.length !== 6) return
    setStatus('checking')
    const result = await checkDeliveryPincode(pincode)
    setStatus(result)
  }

  return (
    <section className="bg-sage-light">
      <div className="container-page flex flex-col items-start gap-5 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink">
            Check if we deliver to your area
          </h2>
          <p className="mt-2 text-ink/60">Enter your pincode to see if daily delivery is available.</p>
        </div>

        <form onSubmit={handleCheck} className="flex w-full max-w-sm items-stretch gap-2 sm:w-auto">
          <div className="relative flex-1">
            <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit pincode"
              className="w-full rounded-full border border-ink/15 bg-milk py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-sage"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Check
          </button>
        </form>
      </div>
      {status && status !== 'checking' && (
        <div className="container-page pb-8">
          <p className={`text-sm font-medium ${status.deliverable ? 'text-sage-dark' : 'text-ink/70'}`}>
            {status.deliverable
              ? `Good news — we deliver to ${status.pincode}.`
              : `We don't deliver to ${status.pincode} yet, but we're expanding fast.`}
          </p>
        </div>
      )}
    </section>
  )
}
