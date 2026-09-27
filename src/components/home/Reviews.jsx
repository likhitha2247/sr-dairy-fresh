import { reviews } from '../../data/reviews.js'
import Rating from '../ui/Rating.jsx'

export default function Reviews() {
  return (
    <section className="container-page py-16">
      <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">What customers say</h2>
      <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="w-72 shrink-0 rounded-2xl rounded-bl-sm border border-ink/10 bg-milk p-5"
          >
            <Rating value={review.rating} />
            <blockquote className="mt-3 text-sm text-ink/80">"{review.text}"</blockquote>
            <figcaption className="mt-4 text-sm font-medium text-ink">
              {review.name} <span className="font-normal text-ink/50">from {review.area}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
