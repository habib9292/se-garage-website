import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { SectionLabel } from '../ui/SectionLabel'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const points = [
  {
    title: 'Diagnostic transparent',
    desc: 'Devis détaillé avant toute intervention. Aucun travail supplémentaire sans votre accord explicite.',
  },
  {
    title: 'Techniciens certifiés',
    desc: "Équipe formée aux dernières technologies. Homologués toutes marques, spécialisés hybride et électrique.",
  },
  {
    title: 'Pièces d\'origine garanties',
    desc: 'Nous utilisons exclusivement des pièces OEM ou équivalent homologué. Garantie constructeur conservée.',
  },
  {
    title: 'Délais tenus',
    desc: "Votre temps est précieux. 95% de nos interventions sont livrées à l'heure promise — c'est notre engagement.",
  },
]

export function WhyUs() {
  const { ref: textRef, isVisible: textVisible } = useScrollReveal()
  const { ref: imgRef, isVisible: imgVisible } = useScrollReveal()

  return (
    <section className="bg-forge py-24 lg:py-32 border-t border-acier/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image side */}
          <div ref={imgRef} className="relative overflow-hidden">
            <motion.div
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={imgVisible ? { clipPath: 'inset(0 0% 0 0)' } : {}}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            >
              {/* Placeholder image with atmospheric design */}
              <div className="aspect-[4/3] bg-anthracite relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-anthracite to-forge" />
                {/* Decorative mechanical grid */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-px bg-acier h-full"
                      style={{ left: `${(i + 1) * 12.5}%` }}
                    />
                  ))}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-px bg-acier w-full"
                      style={{ top: `${(i + 1) * 16.67}%` }}
                    />
                  ))}
                </div>
                {/* Central motif */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border border-or/40 rotate-45 flex items-center justify-center">
                    <div className="w-20 h-20 border border-or/20 rotate-0">
                      <div className="w-full h-full border border-or/10" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="font-display text-5xl text-or leading-none">2009</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-acier mt-1">
                    Fondation du garage
                  </p>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forge/60 via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={imgVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-4 -right-4 bg-or text-anthracite p-6 hidden lg:block"
            >
              <p className="font-display text-4xl leading-none">98%</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-1">Satisfaction client</p>
            </motion.div>
          </div>

          {/* Text side */}
          <div ref={textRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={textVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel>02 — Pourquoi nous</SectionLabel>
              <h2
                className="font-display text-calcaire uppercase leading-none mb-10"
                style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}
              >
                L'expertise sans<br />les mauvaises surprises
              </h2>
            </motion.div>

            <div className="space-y-8">
              {points.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={textVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="flex gap-4"
                >
                  <CheckCircle size={20} className="text-or flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-body font-semibold text-calcaire mb-1">{point.title}</h3>
                    <p className="font-body text-sm text-acier leading-relaxed">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
