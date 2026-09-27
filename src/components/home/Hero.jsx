import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-cream to-milk">
      <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        <div className="flex flex-col justify-center">
          <h1 className="max-w-lg font-display text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
            Pure freshness, delivered every day.
          </h1>
          <p className="mt-5 max-w-md text-base text-ink/70 sm:text-lg">
            Fresh milk, curd, paneer, ghee and more — made with care and delivered fresh to your
            doorstep, before your morning chai.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary">
              Shop Now
            </Link>
            <Link to="/shop?filter=subscriptions" className="btn-secondary">
              Start a Subscription
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full text-sage/10"
            viewBox="0 0 400 400"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M138 26c62-24 149 2 178 66 27 60 4 118-24 168-30 54-77 108-146 100C79 351 24 292 12 224 1 162 22 100 68 62 90 44 113 36 138 26Z" />
          </svg>
          <img
            src="/images/hero-dairy.jpg"
            alt="Fresh milk, curd, paneer and ghee arranged on a wooden table"
            className="relative z-10 aspect-square w-full max-w-sm rounded-blob object-cover shadow-xl shadow-ink/10"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      </div>
    </section>
  )
}
