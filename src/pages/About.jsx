import { motion } from 'framer-motion'
import { SectionLabel } from '../components/ui/SectionLabel'
import { useScrollReveal } from '../hooks/useScrollReveal'

const timeline = [
  { year: '2026', event: 'Ouverture du S.E Garage', desc: 'Le S.E Garage ouvre ses portes à Gennevilliers, avec un atelier moderne et une équipe de techniciens qualifiés.' },
  { year: '2026', event: 'Agrément multimarques obtenu', desc: "Obtention de l'agrément officiel pour l'entretien et la réparation de toutes les marques généralistes." },
  { year: 'À venir', event: "Extension de l'atelier", desc: "Agrandissement de l'atelier pour accueillir plus de véhicules et intégrer de nouveaux équipements de diagnostic." },
]

const certifications = ['Contrôle Technique Homologué', 'Agréé Assurances', 'Certification Hybrid & EV', 'Partenaire Michelin', 'Agréé Castrol', 'Membre FFC']

function TimelineItem({ item, index }) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex gap-8 items-start"
    >
      <div className="flex-shrink-0 w-[68px] text-right">
        <span className="font-display text-2xl text-or tracking-wide">{item.year}</span>
      </div>
      <div className="relative flex-shrink-0">
        <div className="w-3 h-3 bg-or rounded-full mt-2 relative z-10" />
      </div>
      <div className="pt-0.5">
        <h3 className="font-body font-semibold text-anthracite mb-1">{item.event}</h3>
        <p className="font-body text-sm text-acier leading-relaxed">{item.desc}</p>
      </div>
    </motion.div>
  )
}

export function About() {
  const { ref: manifestRef, isVisible: manifestVisible } = useScrollReveal()

  return (
    <>
      {/* Hero */}
      <section className="relative bg-forge pt-32 pb-20 overflow-hidden border-b border-acier/10">
        <div className="absolute inset-0 bg-gradient-to-br from-forge via-anthracite/60 to-forge" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <SectionLabel>S.E Garage · Gennevilliers</SectionLabel>
            <h1 className="font-display text-calcaire uppercase leading-none" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
              À<br /><span className="text-or">Propos</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Manifeste */}
      <section className="bg-anthracite py-24 lg:py-32 border-b border-acier/10" ref={manifestRef}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={manifestVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-or mb-8">Notre philosophie</p>
            <blockquote
              className="font-display text-calcaire uppercase leading-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
            >
              "Un garage ne répare pas des voitures.
              <br />
              <span className="text-or">Il répare la confiance</span>
              <br />
              que vous avez placée en votre véhicule."
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-calcaire py-24 lg:py-32 border-b border-acier/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <SectionLabel light>Histoire</SectionLabel>
          <h2 className="font-display text-anthracite uppercase leading-none mb-16" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
            Notre histoire<br />commence ici
          </h2>
          <div className="relative">
            <div className="absolute left-[68px] top-0 bottom-0 w-px bg-acier/20" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <TimelineItem key={`${item.year}-${i}`} item={item} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-forge py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionLabel>Certifications & Agréments</SectionLabel>
          <h2 className="font-display text-calcaire uppercase leading-none mb-12" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
            Reconnus et certifiés
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-acier/10">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-anthracite p-6 text-center hover:bg-forge transition-colors duration-200"
              >
                <div className="w-8 h-8 border border-or/30 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-3 h-3 bg-or/60" />
                </div>
                <p className="font-mono text-xs uppercase tracking-wider text-acier leading-tight">{cert}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
