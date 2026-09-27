// Mock catalog. Shape mirrors what a `products` collection/table would return
// from Firebase/Supabase once the real backend is wired up (see src/lib/backend.js).

export const categories = ['Milk', 'Curd', 'Paneer', 'Ghee', 'Butter', 'Cheese', 'Sweets', 'Dairy Combos']

export const products = [
  {
    id: 'milk-toned',
    name: 'Toned Milk',
    category: 'Milk',
    description: 'Farm-fresh toned milk, pasteurised and chilled the same morning.',
    image: '/images/products/milk.jpg',
    unitPrices: { '500 ml': 32, '1 L': 60, '2 L': 115 },
    defaultUnit: '1 L',
    rating: 4.6,
    reviewCount: 214,
    inStock: true,
    badge: 'Bestseller',
  },
  {
    id: 'curd-fresh',
    name: 'Fresh Curd',
    category: 'Curd',
    description: 'Thick, set curd made in small batches for a naturally tangy taste.',
    image: '/images/products/curd.jpg',
    unitPrices: { '400 g': 45, '1 kg': 95 },
    defaultUnit: '400 g',
    rating: 4.7,
    reviewCount: 168,
    inStock: true,
    badge: 'Fresh Today',
  },
  {
    id: 'paneer-soft',
    name: 'Soft Paneer',
    category: 'Paneer',
    description: 'Malai-soft paneer cubes, pressed fresh — no preservatives.',
    image: '/images/products/paneer.jpg',
    unitPrices: { '200 g': 70, '500 g': 165 },
    defaultUnit: '200 g',
    rating: 4.8,
    reviewCount: 132,
    inStock: true,
    badge: null,
  },
  {
    id: 'ghee-desi',
    name: 'Desi Cow Ghee',
    category: 'Ghee',
    description: 'Slow-simmered, bilona-style ghee with a rich golden aroma.',
    image: '/images/products/ghee.jpg',
    unitPrices: { '250 ml': 220, '500 ml': 420 },
    defaultUnit: '500 ml',
    rating: 4.9,
    reviewCount: 301,
    inStock: true,
    badge: 'Premium',
  },
  {
    id: 'butter-table',
    name: 'Table Butter',
    category: 'Butter',
    description: 'Creamy, unsalted white butter churned the traditional way.',
    image: '/images/products/butter.jpg',
    unitPrices: { '100 g': 55, '500 g': 250 },
    defaultUnit: '100 g',
    rating: 4.5,
    reviewCount: 89,
    inStock: true,
    badge: null,
  },
  {
    id: 'cheese-block',
    name: 'Cheddar Cheese Block',
    category: 'Cheese',
    description: 'Mild, meltable cheddar — great for sandwiches and cooking.',
    image: '/images/products/cheese.jpg',
    unitPrices: { '200 g': 150 },
    defaultUnit: '200 g',
    rating: 4.4,
    reviewCount: 57,
    inStock: false,
    badge: null,
  },
  {
    id: 'sweet-gulabjamun',
    name: 'Gulab Jamun (Fresh)',
    category: 'Sweets',
    description: 'Soft khoya jamuns dipped in light sugar syrup, made fresh daily.',
    image: '/images/products/gulabjamun.jpg',
    unitPrices: { '250 g (6 pcs)': 90, '500 g (12 pcs)': 170 },
    defaultUnit: '250 g (6 pcs)',
    rating: 4.7,
    reviewCount: 143,
    inStock: true,
    badge: 'Fresh Today',
  },
  {
    id: 'combo-weekend',
    name: 'Weekend Dairy Combo',
    category: 'Dairy Combos',
    description: 'Milk, curd, paneer and butter bundled for the weekend, at a lower price.',
    image: '/images/products/combo.jpg',
    unitPrices: { Combo: 349 },
    defaultUnit: 'Combo',
    rating: 4.8,
    reviewCount: 76,
    inStock: true,
    badge: '15% OFF',
  },
]

export function getFeaturedProducts() {
  return products.slice(0, 6)
}

export function getProductById(id) {
  return products.find((p) => p.id === id)
}
