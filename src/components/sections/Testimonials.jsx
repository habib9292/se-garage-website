import { useRef, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { SectionLabel } from '../ui/SectionLabel'
import { testimonials } from '../../data/testimonials'

function StarRating({ rating }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} className={i < rating ? 'text-or fill-or' : 'text-acier'} />
      ))}
    </div>
  )
}

function TestimonialCard({ t }) {
  return (
    <div
      className="flex-shrink-0 w-80 lg:w-96 bg-forge border border-acier/10 p-8 mx-4 hover:border-or/30 transition-colors duration-300"
      style={{ cursor: 'default' }}
    >
      <Quote size={28} className="text-or mb-4 opacity-80" />
      <StarRating rating={t.rating} />
      <p className="font-body text-sm text-acier/90 leading-relaxed mt-4 mb-6 min-h-[72px]">
        "{t.text}"
      </p>
      <div className="border-t border-acier/20 pt-4 flex items-center justify-between">
        <div>
          <p className="font-body font-semibold text-calcaire text-sm">{t.name}</p>
          <p className="font-mono text-xs uppercase tracking-widest text-acier mt-0.5">
            {t.city} · {t.date}
          </p>
        </div>
        <div className="flex gap-0.5">
          {[...Array(t.rating)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-or" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Duplique les avis pour un défilement infini fluide
const repeated = [...testimonials, ...testimonials, ...testimonials, ...testimonials]

export function Testimonials() {
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)

  // Durée basée sur le nombre de cartes (320px + 32px gap par carte)
  const cardWidth = 384 + 32 // w-96 + mx-4*2
  const totalWidth = testimonials.length * cardWidth
  const duration = testimonials.length * 8 // 8s par avis

  return (
    <section className="bg-forge py-24 lg:py-32 overflow-hidden border-t border-acier/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 lg:mb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <SectionLabel>03 — Témoignages</SectionLabel>
            <h2
              className="font-display text-calcaire uppercase leading-none"
              style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
            >
              Ce que disent<br />nos clients
            </h2>
          </div>

          {/* Note Google */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-display text-or leading-none" style={{ fontSize: 48 }}>4,8</p>
              <StarRating rating={5} />
              <p className="font-mono text-xs uppercase tracking-widest text-acier mt-1">Note Google</p>
            </div>
            <div className="w-px h-16 bg-acier/20" />
            <div className="text-right">
              <p className="font-display text-calcaire leading-none" style={{ fontSize: 48 }}>9</p>
              <p className="font-mono text-xs uppercase tracking-widest text-acier mt-1">Avis vérifiés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee infini */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Dégradé gauche */}
        <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #0A0A0A, transparent)' }} />
        {/* Dégradé droite */}
        <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0A0A0A, transparent)' }} />

        {/* Track animé */}
        <div
          ref={trackRef}
          className="flex"
          style={{
            animation: `marquee ${duration}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
            width: 'max-content',
          }}
        >
          {repeated.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-10">
        {testimonials.map((_, i) => (
          <div key={i} className="w-6 h-px bg-or/50" />
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${totalWidth}px); }
        }
      `}</style>
    </section>
  )
}
