import { Star } from 'lucide-react'

export default function Rating({ value, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1 text-xs text-ink/70">
      <div className="flex items-center gap-0.5 text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            fill={i < Math.round(value) ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span>{value.toFixed(1)}</span>
      {count != null && <span className="text-ink/40">({count})</span>}
    </div>
  )
}
