import { Sunrise, ShieldCheck, FlaskConical, Truck } from 'lucide-react'

const badges = [
  { icon: Sunrise, label: 'Fresh every day' },
  { icon: ShieldCheck, label: 'Hygienically processed' },
  { icon: FlaskConical, label: 'Quality tested' },
  { icon: Truck, label: 'Doorstep delivery' },
]

export default function TrustBadges() {
  return (
    <section className="border-y border-ink/10 bg-milk">
      <div className="container-page grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:gap-4">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="shrink-0 text-sage" size={22} strokeWidth={1.75} />
            <span className="text-sm font-medium text-ink/80">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
