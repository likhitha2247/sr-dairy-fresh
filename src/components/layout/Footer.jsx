import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-display text-lg font-medium text-ink">SR Dairy Fresh</span>
          <p className="mt-3 max-w-xs text-sm text-ink/70">
            Fresh milk, curd, paneer, ghee and more, sourced daily and delivered to your doorstep
            across Kadapa and nearby towns.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="rounded-full border border-ink/15 p-2 text-ink/70 hover:border-ink/30 hover:text-ink"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="rounded-full border border-ink/15 p-2 text-ink/70 hover:border-ink/30 hover:text-ink"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="rounded-full border border-ink/15 p-2 text-ink/70 hover:border-ink/30 hover:text-ink"
            >
              <Youtube size={16} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            <li><Link to="/about" className="hover:text-ink">About Us</Link></li>
            <li><Link to="/shop" className="hover:text-ink">Products</Link></li>
            <li><Link to="/about#contact" className="hover:text-ink">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Policies</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            <li><a href="#" className="hover:text-ink">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-ink">Terms of Service</a></li>
            <li><a href="#" className="hover:text-ink">Refund Policy</a></li>
            <li><a href="#" className="hover:text-ink">Delivery Policy</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Regulatory</h3>
          <p className="mt-3 text-sm text-ink/70">
            FSSAI License No: <span className="font-medium text-ink">XXXX00000000000</span>
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Placeholder — replace with your actual FSSAI license number before launch.
          </p>
        </div>
      </div>
      <div className="border-t border-ink/10 py-5 text-center text-xs text-ink/50">
        © {new Date().getFullYear()} SR Dairy Fresh. All rights reserved.
      </div>
    </footer>
  )
}
