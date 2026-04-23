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
              {/* Logo SPORT style-10 */}
              <div
                className="aspect-[16/9] lg:aspect-[4/3] w-full flex items-center justify-center overflow-hidden select-none"
                style={{
                  background: 'linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 40%, #111 100%)',
                  backgroundImage: 'linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 40%, #111 100%), radial-gradient(ellipse at 50% 50%, rgba(232,93,34,0.10) 0%, transparent 65%), repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)',
                  backgroundBlendMode: 'normal, screen, overlay',
                  position: 'relative',
                }}
              >
                {/* Glow orange centré */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(232,93,34,0.12) 0%, transparent 60%)',
                  pointerEvents: 'none',
                }} />
                {/* Logo : 3 barres + S.E GARAGE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2.5vw, 28px)', position: 'relative', zIndex: 1 }}>
                  {/* 3 barres décroissantes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1vw, 12px)' }}>
                    <div style={{ width: 'clamp(44px, 7vw, 80px)', height: 7, background: '#e85d22', borderRadius: 4, boxShadow: '0 0 18px rgba(232,93,34,0.9)' }} />
                    <div style={{ width: 'clamp(30px, 5vw, 55px)', height: 7, background: 'rgba(255,255,255,0.4)', borderRadius: 4 }} />
                    <div style={{ width: 'clamp(16px, 3vw, 32px)', height: 7, background: 'rgba(255,255,255,0.18)', borderRadius: 4 }} />
                  </div>
                  {/* S.E + GARAGE */}
                  <div>
                    <div style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: 'clamp(72px, 13vw, 140px)',
                      fontWeight: 900,
                      color: '#e85d22',
                      lineHeight: 0.82,
                      letterSpacing: '-3px',
                      textShadow: '0 0 30px rgba(232,93,34,0.5), 0 4px 16px rgba(0,0,0,0.9)',
                    }}>S.E</div>
                    <div style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: 'clamp(14px, 2.2vw, 28px)',
                      fontWeight: 700,
                      color: 'white',
                      letterSpacing: '0.5em',
                      textTransform: 'uppercase',
                      marginTop: 10,
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    }}>GARAGE</div>
                  </div>
                </div>
                {/* Trait orange bas */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #e85d22 0%, transparent 60%)' }} />
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
