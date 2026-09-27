import { Link } from 'react-router-dom'
import { getFeaturedProducts } from '../../data/products.js'
import ProductCard from '../ui/ProductCard.jsx'

export default function FeaturedProducts() {
  const featured = getFeaturedProducts()

  return (
    <section className="container-page py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
            Today's favourites
          </h2>
          <p className="mt-2 text-ink/60">The products our customers reorder the most.</p>
        </div>
        <Link to="/shop" className="hidden shrink-0 text-sm font-semibold text-sage hover:underline sm:block">
          View all products
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Link to="/shop" className="mt-6 block text-center text-sm font-semibold text-sage hover:underline sm:hidden">
        View all products
      </Link>
    </section>
  )
}
