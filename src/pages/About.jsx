import { motion } from 'framer-motion'
import { SectionLabel } from '../components/ui/SectionLabel'
import { useScrollReveal } from '../hooks/useScrollReveal'

const team = [
  { name: 'Jacques Martin', role: 'Fondateur & Chef mécanicien', initials: 'JM', specialty: 'Diagnostic moteur, Électronique' },
  { name: 'Sophie Renard', role: 'Technicienne carrosserie', initials: 'SR', specialty: 'Carrosserie, Peinture' },
  { name: 'Karim Benali', role: 'Mécanicien confirmé', initials: 'KB', specialty: 'Freinage, Transmission' },
  { name: 'Lucas Petit', role: 'Spécialiste climatisation', initials: 'LP', specialty: 'Climatisation, Hybride' },
]

const timeline = [
  { year: '2009', event: 'Ouverture du garage', desc: 'Jacques Martin fonde le garage avec une équipe de 2 techniciens.' },
  { year: '2013', event: 'Agrément multimarques', desc: "Obtention de l'agrément officiel pour toutes les marques généralistes." },
  { year: '2017', event: 'Expansion atelier', desc: "Extension des locaux — passage à 6 ponts élévateurs et équipement de diagnostic nouvelle génération." },
  { year: '2020', event: 'Certification hybride & électrique', desc: 'Formation et certification pour les véhicules hybrides et 100% électriques.' },
  { year: '2024', event: '2 400 véhicules traités', desc: "Un cap symbolique franchi, fidèles à notre philosophie de l'excellence." },
]

const certifications = ['Contrôle Technique Homologué', 'Agréé Assurances', 'Certification Hybrid & EV', 'Partenaire Michelin', 'Agréé Castrol', 'Membre FFC']

function TeamCard({ member, index }) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="aspect-[3/4] bg-anthracite border border-acier/10 relative overflow-hidden mb-4 group-hover:border-or/30 transition-colors duration-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-6xl text-or/20 tracking-widest">{member.initials}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-forge to-transparent">
          <div className="h-px w-8 bg-or mb-3" />
        </div>
      </div>
      <h3 className="font-display text-xl text-calcaire tracking-wide uppercase">{member.name}</h3>
      <p className="font-mono text-xs uppercase tracking-widest text-or mt-1 mb-2">{member.role}</p>
      <p className="font-body text-xs text-acier">{member.specialty}</p>
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
            <SectionLabel>Notre histoire</SectionLabel>
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
            <p className="font-mono text-xs uppercase tracking-widest text-acier mt-8">
              — Jacques Martin, fondateur
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-forge py-24 lg:py-32 border-b border-acier/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionLabel>L'équipe</SectionLabel>
          <h2 className="font-display text-calcaire uppercase leading-none mb-12" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
            Ceux qui prennent soin<br />de votre véhicule
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {team.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-calcaire py-24 lg:py-32 border-b border-acier/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <SectionLabel light>Histoire</SectionLabel>
          <h2 className="font-display text-anthracite uppercase leading-none mb-16" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
            15 ans de passion<br />mécanique
          </h2>
          <div className="relative">
            <div className="absolute left-[68px] top-0 bottom-0 w-px bg-acier/20" />
            <div className="space-y-12">
              {timeline.map((item, i) => {
                const { ref, isVisible } = useScrollReveal()
                return (
                  <motion.div
                    key={item.year}
                    ref={ref}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
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
              })}
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
