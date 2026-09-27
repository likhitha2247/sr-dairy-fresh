import { MessageCircle } from 'lucide-react'

// Replace the number below with the business's WhatsApp Business number (with country code, no +).
const WHATSAPP_NUMBER = '910000000000'

export default function WhatsAppCTA() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hi! I would like to place a dairy order.'
  )}`

  return (
    <section className="container-page pb-16">
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-ink px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-medium text-milk">Need help? Order on WhatsApp</h2>
          <p className="mt-1 text-sm text-milk/60">
            Prefer messaging over the app? Send us your order directly.
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-milk px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream"
        >
          <MessageCircle size={18} className="text-sage" />
          Chat on WhatsApp
        </a>
      </div>
    </section>
  )
}
