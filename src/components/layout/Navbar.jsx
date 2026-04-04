import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '../ui/Button'

const navLinks = [
  { label: 'Accueil',   to: '/' },
  { label: 'Services',  to: '/services' },
  { label: 'À Propos',  to: '/a-propos' },
  { label: 'Contact',   to: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-forge/95 backdrop-blur-sm shadow-lg shadow-black/30' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display text-2xl lg:text-3xl tracking-widest text-calcaire group-hover:text-or transition-colors duration-200">
                S.E<span className="text-or ml-2">GARAGE</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-body text-sm tracking-wide transition-colors duration-200 relative group ${
                    location.pathname === link.to ? 'text-or' : 'text-calcaire/70 hover:text-calcaire'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-or transition-all duration-200 ${
                    location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="tel:0622133447"
                className="flex items-center gap-2 font-mono text-xs tracking-widest text-acier hover:text-or transition-colors duration-200"
              >
                <Phone size={14} />
                06 22 13 34 47
              </a>
              <Link to="/rendez-vous">
                <Button size="sm">Prendre RDV</Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-calcaire p-2 -mr-2"
              aria-label="Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-anthracite z-50 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-acier/20">
                <span className="font-display text-2xl tracking-widest">
                  S.E<span className="text-or ml-2">GARAGE</span>
                </span>
                <button onClick={() => setMenuOpen(false)} className="text-calcaire p-1">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col p-6 gap-1 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      to={link.to}
                      className={`block font-body text-lg py-3 border-b border-acier/10 transition-colors duration-200 ${
                        location.pathname === link.to ? 'text-or' : 'text-calcaire/80 hover:text-calcaire'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="p-6 border-t border-acier/20 space-y-3">
                <a
                  href="tel:0622133447"
                  className="flex items-center gap-3 font-mono text-sm text-acier hover:text-or transition-colors"
                >
                  <Phone size={16} />
                  06 22 13 34 47
                </a>
                <Link
                  to="/rendez-vous"
                  className="block w-full text-center bg-or text-anthracite font-semibold py-3.5 tracking-wide hover:opacity-90 transition-opacity"
                >
                  Prendre RDV
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
