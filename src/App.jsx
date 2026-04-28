import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Appointment } from './pages/Appointment'
import { Cancel } from './pages/Cancel'
import { Phone, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
// Admin
import { AdminLogin, isAuthenticated } from './admin/AdminLogin'
import { AdminLayout } from './admin/AdminLayout'
import { Dashboard } from './admin/Dashboard'
import { DocumentsList } from './admin/documents/DocumentsList'
import { DocumentEditor } from './admin/documents/DocumentEditor'
import { ClientsList } from './admin/clients/ClientsList'
import { Catalogue } from './admin/Catalogue'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function isOnOrangeBg(el) {
  let node = el
  for (let i = 0; i < 6 && node && node !== document.body; i++) {
    const bg = window.getComputedStyle(node).backgroundColor
    if (bg === 'rgb(255, 102, 0)') return true
    node = node.parentElement
  }
  return false
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

      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el && isOnOrangeBg(el)) {
        dot.classList.add('dark')
        ring.classList.add('dark')
      } else {
        dot.classList.remove('dark')
        ring.classList.remove('dark')
      }
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
        href="tel:0141114340"
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

function AdminGuard({ children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return children
}

function PublicSite() {
  const location = useLocation()
  const lenisRef = useLenis()

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname])

  return (
    <>
      <Navbar />
      <main className="pb-16 lg:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"            element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/services"    element={<PageWrapper><Services /></PageWrapper>} />
            <Route path="/a-propos"    element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/contact"     element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/rendez-vous" element={<PageWrapper><Appointment /></PageWrapper>} />
            <Route path="/annulation"  element={<PageWrapper><Cancel /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileCTABar />
    </>
  )
}

function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 1.2,
      infinite: false,
    })
    lenisRef.current = lenis

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}

function AdminBodyClass() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.body.classList.add('admin')
    } else {
      document.body.classList.remove('admin')
    }
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <AdminBodyClass />
      <CustomCursor />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="documents"    element={<DocumentsList type="all" />} />
          <Route path="devis"        element={<DocumentsList type="devis" />} />
          <Route path="devis/:id"    element={<DocumentEditor type="devis" />} />
          <Route path="factures"     element={<DocumentsList type="facture" />} />
          <Route path="factures/:id" element={<DocumentEditor type="facture" />} />
          <Route path="avoirs"       element={<DocumentsList type="avoir" />} />
          <Route path="avoirs/:id"   element={<DocumentEditor type="avoir" />} />
          <Route path="clients"      element={<ClientsList />} />
          <Route path="catalogue"    element={<Catalogue />} />
        </Route>
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </>
  )
}
