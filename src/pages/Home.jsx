import { Hero } from '../components/sections/Hero'
import { StatsBar } from '../components/sections/StatsBar'
import { ServicesGrid } from '../components/sections/ServicesGrid'
import { WhyUs } from '../components/sections/WhyUs'
import { Testimonials } from '../components/sections/Testimonials'
import { CTABanner } from '../components/sections/CTABanner'

export function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ServicesGrid />
      <WhyUs />
      <Testimonials />
      <CTABanner />
    </>
  )
}
