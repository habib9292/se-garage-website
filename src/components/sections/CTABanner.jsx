import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function CTABanner() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="bg-or py-20 lg:py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-anthracite/60 mb-4">
            Disponible Lun–Ven 8h–19h · Sam 9h–17h
          </p>
          <h2
            className="font-display text-anthracite uppercase leading-none mb-8"
            style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}
          >
            Prêt à confier<br />votre véhicule ?
          </h2>
          <p className="font-body text-anthracite/70 text-lg mb-10 max-w-lg mx-auto">
            Devis gratuit, prix transparents, toutes marques. Contactez-nous ou prenez RDV en ligne.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/rendez-vous"
              className="bg-anthracite text-calcaire font-body font-semibold px-9 py-4 tracking-wide hover:bg-forge transition-colors duration-200 w-full sm:w-auto text-center"
            >
              Prendre rendez-vous
            </Link>
            <a
              href="tel:0622133447"
              className="flex items-center justify-center gap-3 text-anthracite font-body font-semibold px-9 py-4 border-2 border-anthracite hover:bg-anthracite hover:text-or transition-all duration-200 w-full sm:w-auto"
            >
              <Phone size={18} />
              06 22 13 34 47
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
