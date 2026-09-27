import { Clock } from 'lucide-react'

export default function FreshnessBanner() {
  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

  return (
    <section className="bg-sage-light">
      <div className="container-page flex flex-col items-start gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-medium text-ink">Fresh stock updated today</h2>
          <p className="mt-1 text-sm text-ink/60">
            Every batch below was processed and packed this morning, {dateLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-milk px-4 py-2 text-sm text-ink/70">
          <Clock size={16} className="text-sage" />
          Last updated at 5:40 AM
        </div>
      </div>
    </section>
  )
}
