import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-forge">
      {/* Real garage photo as background */}
      <div className="absolute inset-0">
        <img
          src="/images/garage/facade.jpg"
          alt="S.E Garage Gennevilliers"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-forge/95 via-forge/85 to-forge/50" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-forge to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <Badge variant="success" pulse>
              Ouvert aujourd'hui
            </Badge>
          </motion.div>

          {/* Location label */}
          <motion.p variants={itemVariants} className="font-mono text-xs uppercase tracking-[0.3em] text-or mb-4">
            S.E Garage — 13 Avenue de la Gare, Gennevilliers
          </motion.p>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display uppercase text-calcaire leading-none mb-6"
            style={{ fontSize: 'clamp(52px, 8vw, 104px)', letterSpacing: '0.02em' }}
          >
            Carrosserie.
            <br />
            <span className="text-or">Mécanique.</span>
            <br />
            Pare-brise.
          </motion.h1>

          {/* Subline */}
          <motion.p
            variants={itemVariants}
            className="font-body text-acier text-lg lg:text-xl leading-relaxed mb-10 max-w-xl"
          >
            Toutes marques · Pièces détachées · Prix transparents.
            <br />
            Votre garage de confiance à Gennevilliers.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-16">
            <Link to="/rendez-vous">
              <Button size="lg">Prendre rendez-vous</Button>
            </Link>
            <a href="tel:0622133447">
              <Button variant="ghost" size="lg">
                06 22 13 34 47
              </Button>
            </a>
          </motion.div>

          {/* Prix clés */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-8 pt-8 border-t border-acier/20"
          >
            {[
              { value: '69€',    label: 'Vidange + filtre' },
              { value: '79€',    label: 'Plaquettes AV' },
              { value: '40€',    label: 'Nettoyage complet' },
              { value: '80€/h',  label: 'Taux horaire' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-or tracking-wide">{stat.value}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-acier mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-acier"
      >
        <span className="font-mono text-xs uppercase tracking-widest">Défiler</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  )
}
