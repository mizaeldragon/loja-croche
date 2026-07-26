import Hero from '../../components/public/Hero'
import Highlights from '../../components/public/Highlights'
import About from '../../components/public/About'
import Categories from '../../components/public/Categories'
import PromoBanner from '../../components/public/PromoBanner'
import Benefits from '../../components/public/Benefits'
import Testimonials from '../../components/public/Testimonials'
import FAQSection from '../../components/public/FAQSection'
import CTASection from '../../components/public/CTASection'

export default function Home() {
  return (
    <>
      <Hero />
      <Highlights />
      <About />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#FDD7CA_0%,_#FFF7F3_60%)]" />
        <div className="relative">
          <Categories />
          <PromoBanner />
        </div>
      </section>
      <Benefits />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </>
  )
}
