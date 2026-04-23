import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Button } from '../components/ui/Button'
import { services } from '../data/services'
import { useScrollReveal } from '../hooks/useScrollReveal'

function ServiceSection({ service, index }) {
  const isEven = index % 2 === 0
  const { ref, isVisible } = useScrollReveal()
  const Icon = service.icon

  return (
    <section
      id={service.slug}
      ref={ref}
      className={`py-24 lg:py-32 ${isEven ? 'bg-forge' : 'bg-anthracite'} border-b border-acier/10`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -30 : 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={!isEven ? 'lg:col-start-2' : ''}
          >
            <SectionLabel>0{index + 1} — Service</SectionLabel>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 border border-or/30 flex items-center justify-center">
                <Icon size={22} className="text-or" />
              </div>
            </div>

            <h2
              className="font-display text-calcaire uppercase leading-none mb-8"
              style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
            >
              {service.title}
            </h2>

            <div className="space-y-4 mb-10">
              {service.description.map((para, i) => (
                <p key={i} className="font-body text-acier text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <Link to="/rendez-vous">
              <Button size="md">
                Prendre RDV pour ce service
              </Button>
            </Link>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 30 : -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${isEven ? 'from-anthracite to-forge' : 'from-forge to-anthracite'}`} />
              )}
              {/* Label bas */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-or/40 flex items-center justify-center">
                    <Icon size={14} className="text-or" />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest text-calcaire/80">
                    {service.title}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function Services() {
  return (
    <>
      {/* Hero compact */}
      <section className="relative bg-forge pt-32 pb-20 lg:pb-24 overflow-hidden border-b border-acier/10">
        <div className="absolute inset-0 bg-gradient-to-br from-forge via-anthracite/60 to-forge" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-or/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <SectionLabel>Services</SectionLabel>
            <h1
              className="font-display text-calcaire uppercase leading-none"
              style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}
            >
              Nos<br /><span className="text-or">Services</span>
            </h1>
            <p className="font-body text-acier text-lg mt-6 max-w-lg">
              De l'entretien courant à la réparation complexe — notre équipe prend en charge l'ensemble des besoins de votre véhicule.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      {services.map((service, index) => (
        <ServiceSection key={service.id} service={service} index={index} />
      ))}
    </>
  )
}
