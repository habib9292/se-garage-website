import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SectionLabel } from '../ui/SectionLabel'
import { services } from '../../data/services'
import { useScrollReveal } from '../../hooks/useScrollReveal'

function ServiceCard({ service, index }) {
  const Icon = service.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group bg-forge border border-acier/10 flex flex-col transition-all duration-200 hover:border-or/50 hover:bg-anthracite overflow-hidden"
    >
      {/* Image */}
      {service.image && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forge/80 to-transparent" />
        </div>
      )}
      <div className="p-8 flex flex-col flex-1">
      <div className="mb-6">
        <div className="w-12 h-12 border border-or/30 flex items-center justify-center mb-4 group-hover:bg-or group-hover:border-or transition-all duration-200">
          <Icon size={22} className="text-or group-hover:text-anthracite transition-colors duration-200" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-acier mb-2">
          0{index + 1}
        </p>
        <h3 className="font-display text-xl lg:text-2xl text-calcaire tracking-wide uppercase group-hover:text-or transition-colors duration-200">
          {service.title}
        </h3>
      </div>

      <p className="font-body text-sm text-acier leading-relaxed flex-1 mb-6">
        {service.shortDesc}
      </p>

      <Link
        to={`/services#${service.slug}`}
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-or hover:gap-3 transition-all duration-200"
      >
        En savoir plus
        <ArrowRight size={14} />
      </Link>
      </div>
    </motion.div>
  )
}

export function ServicesGrid() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="bg-forge py-24 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 lg:mb-16"
        >
          <SectionLabel>01 — Nos Services</SectionLabel>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-display text-calcaire uppercase leading-none" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              Tout ce dont<br />votre véhicule a besoin
            </h2>
            <Link
              to="/services"
              className="font-mono text-xs uppercase tracking-widest text-or hover:text-calcaire transition-colors duration-200 whitespace-nowrap"
            >
              Voir tous les services →
            </Link>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-acier/10">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
