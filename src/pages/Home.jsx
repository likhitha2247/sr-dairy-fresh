import Hero from '../components/home/Hero.jsx'
import TrustBadges from '../components/home/TrustBadges.jsx'
import FeaturedProducts from '../components/home/FeaturedProducts.jsx'
import FreshnessBanner from '../components/home/FreshnessBanner.jsx'
import SubscriptionSection from '../components/home/SubscriptionSection.jsx'
import OffersSection from '../components/home/OffersSection.jsx'
import AboutSnippet from '../components/home/AboutSnippet.jsx'
import Reviews from '../components/home/Reviews.jsx'
import DeliveryChecker from '../components/home/DeliveryChecker.jsx'
import WhatsAppCTA from '../components/home/WhatsAppCTA.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <FeaturedProducts />
      <FreshnessBanner />
      <SubscriptionSection />
      <OffersSection />
      <AboutSnippet />
      <Reviews />
      <DeliveryChecker />
      <WhatsAppCTA />
    </>
  )
}
