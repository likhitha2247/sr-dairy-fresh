import { Link } from 'react-router-dom'

const plans = [
  { name: 'Daily', detail: 'Delivered every morning, no ordering needed.' },
  { name: 'Alternate Days', detail: 'Every other day — good for smaller households.' },
  { name: 'Weekly', detail: 'One delivery a week, at your chosen quantity.' },
]

export default function SubscriptionSection() {
  return (
    <section className="bg-sky-light">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
            Never run out of fresh milk.
          </h2>
          <p className="mt-3 max-w-md text-ink/70">
            Set up a subscription once and we'll handle the rest — pause, skip a day, or change
            quantity any time from your account.
          </p>
          <Link to="/shop?filter=subscriptions" className="btn-primary mt-6 inline-flex bg-sky hover:bg-sky/90">
            Set up a subscription
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-xl border border-ink/10 bg-milk p-5">
              <h3 className="font-display text-lg font-medium text-ink">{plan.name}</h3>
              <p className="mt-2 text-sm text-ink/60">{plan.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
