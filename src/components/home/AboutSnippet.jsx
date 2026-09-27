import { Link } from 'react-router-dom'

export default function AboutSnippet() {
  return (
    <section className="bg-cream">
      <div className="container-page grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
        <img
          src="/images/farm-story.jpg"
          alt="Dairy farm where SR Dairy Fresh sources its milk"
          className="aspect-[4/3] w-full rounded-2xl object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div>
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
            From local farms to your kitchen, within hours.
          </h2>
          <p className="mt-3 text-ink/70">
            We work directly with a small group of dairy farms near Kadapa, collecting milk twice
            a day and processing it the same morning. No long cold-chains, no unnecessary
            additives — just fresh dairy, the way it used to be.
          </p>
          <Link to="/about" className="mt-5 inline-block text-sm font-semibold text-sage hover:underline">
            Read our full story
          </Link>
        </div>
      </div>
    </section>
  )
}
