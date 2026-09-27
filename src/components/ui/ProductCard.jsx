import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Rating from './Rating.jsx'
import { useCart } from '../../context/CartContext.jsx'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-milk transition-shadow hover:shadow-lg hover:shadow-ink/5">
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-cream">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-ink">
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-sm font-semibold text-milk">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/product/${product.id}`} className="font-medium text-ink hover:underline">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-ink/60">{product.description}</p>
        <Rating value={product.rating} count={product.reviewCount} />

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="font-display text-lg font-medium text-ink">
              ₹{product.unitPrices[product.defaultUnit]}
            </span>
            <span className="ml-1 text-xs text-ink/50">/ {product.defaultUnit}</span>
          </div>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => addItem(product, product.defaultUnit)}
            className="flex items-center gap-1 rounded-full bg-sage px-3 py-2 text-xs font-semibold text-milk transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:bg-ink/20"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
