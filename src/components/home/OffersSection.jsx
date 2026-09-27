const offers = [
  {
    title: '10% off your first order',
    detail: 'Applied automatically at checkout for new customers.',
    bg: 'bg-sage',
    text: 'text-milk',
  },
  {
    title: 'Free delivery above ₹499',
    detail: 'No coupon needed — it kicks in at checkout.',
    bg: 'bg-sky',
    text: 'text-milk',
  },
  {
    title: 'Weekend dairy combo',
    detail: 'Milk, curd, paneer and butter bundled at a lower price.',
    bg: 'bg-gold',
    text: 'text-ink',
  },
]

export default function OffersSection() {
  return (
    <section className="container-page py-16">
      <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">Offers running now</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {offers.map((offer) => (
          <div key={offer.title} className={`rounded-2xl p-6 ${offer.bg} ${offer.text}`}>
            <h3 className="font-display text-lg font-medium">{offer.title}</h3>
            <p className={`mt-2 text-sm ${offer.text === 'text-milk' ? 'text-milk/80' : 'text-ink/70'}`}>
              {offer.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
