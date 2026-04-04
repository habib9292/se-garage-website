import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Appointment } from './pages/Appointment'
import { Phone, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function CustomCursor() {
  useEffect(() => {
    const dot  = document.querySelector('.cursor-dot')
    const ring = document.querySelector('.cursor-ring')
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let animId

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = mouseX + 'px'
      dot.style.top  = mouseY + 'px'
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = ringX + 'px'
      ring.style.top  = ringY + 'px'
      animId = requestAnimationFrame(animate)
    }

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'))
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'))
      })
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    addHoverListeners()
    animId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot hidden lg:block" />
      <div className="cursor-ring hidden lg:block" />
    </>
  )
}

function MobileCTABar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-forge border-t border-acier/20 grid grid-cols-2">
      <a
        href="tel:0622133447"
        className="flex items-center justify-center gap-2 py-4 font-body font-semibold text-sm text-calcaire bg-anthracite hover:bg-forge transition-colors border-r border-acier/20"
      >
        <Phone size={18} />
        Appeler
      </a>
      <Link
        to="/rendez-vous"
        className="flex items-center justify-center gap-2 py-4 font-body font-semibold text-sm text-anthracite bg-or hover:bg-amber-500 transition-colors"
      >
        <Calendar size={18} />
        Prendre RDV
      </Link>
    </div>
  )
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <CustomCursor />
      <ScrollToTop />
      <Navbar />

      <main className="pb-16 lg:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"            element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/services"    element={<PageWrapper><Services /></PageWrapper>} />
            <Route path="/a-propos"    element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/contact"     element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/rendez-vous" element={<PageWrapper><Appointment /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <MobileCTABar />
    </>
  )
}
