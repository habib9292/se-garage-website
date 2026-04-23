import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { SectionLabel } from '../ui/SectionLabel'
import { testimonials } from '../../data/testimonials'

function StarRating({ rating }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-or fill-or' : 'text-acier'}
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const resumeTimer = useRef(null)
  const autoTimer = useRef(null)
  const isPausedRef = useRef(false)

  const startAuto = useCallback(() => {
    clearInterval(autoTimer.current)
    autoTimer.current = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrent(c => (c + 1) % testimonials.length)
      }
    }, 4000)
  }, [])

  const pauseAndResume = useCallback(() => {
    isPausedRef.current = true
    clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      isPausedRef.current = false
    }, 8000)
  }, [])

  useEffect(() => {
    startAuto()
    return () => {
      clearInterval(autoTimer.current)
      clearTimeout(resumeTimer.current)
    }
  }, [startAuto])

  const prev = () => {
    pauseAndResume()
    setCurrent(c => (c - 1 + testimonials.length) % testimonials.length)
  }

  const next = () => {
    pauseAndResume()
    setCurrent(c => (c + 1) % testimonials.length)
  }

  const goTo = (i) => {
    pauseAndResume()
    setCurrent(i)
  }

  // Show 3 on desktop, 1 on mobile
  const visible = [
    testimonials[current % testimonials.length],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ]

  return (
    <section className="bg-calcaire py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <SectionLabel light>03 — Témoignages</SectionLabel>
            <h2
              className="font-display text-anthracite uppercase leading-none"
              style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
            >
              Ce que disent<br />nos clients
            </h2>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={prev}
              className="w-12 h-12 border border-acier/30 flex items-center justify-center text-anthracite hover:bg-anthracite hover:text-calcaire hover:border-anthracite transition-all duration-200"
              aria-label="Précédent"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 border border-acier/30 flex items-center justify-center text-anthracite hover:bg-anthracite hover:text-calcaire hover:border-anthracite transition-all duration-200"
              aria-label="Suivant"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Mobile: single card */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="bg-forge p-8 border border-acier/10"
            >
              <Quote size={32} className="text-or mb-4" />
              <StarRating rating={testimonials[current].rating} />
              <p className="font-body text-sm text-acier/90 leading-relaxed mt-4 mb-6">
                "{testimonials[current].text}"
              </p>
              <div className="border-t border-acier/20 pt-4">
                <p className="font-body font-semibold text-calcaire">{testimonials[current].name}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-acier mt-1">
                  {testimonials[current].vehicle ? `${testimonials[current].vehicle} · ` : ''}{testimonials[current].city}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop: 3 cards */}
        <div className="hidden lg:grid grid-cols-3 gap-px bg-acier/10">
          {visible.map((t, i) => (
            <motion.div
              key={`${current}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-calcaire p-8 border border-acier/10 hover:border-or/30 transition-colors duration-200"
            >
              <Quote size={28} className="text-or mb-4" />
              <StarRating rating={t.rating} />
              <p className="font-body text-sm text-acier leading-relaxed mt-4 mb-6">
                "{t.text}"
              </p>
              <div className="border-t border-acier/20 pt-4">
                <p className="font-body font-semibold text-anthracite">{t.name}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-acier mt-1">
                  {t.vehicle ? `${t.vehicle} · ` : ''}{t.city}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-px transition-all duration-300 ${
                i === current % testimonials.length ? 'w-8 bg-anthracite' : 'w-4 bg-acier/40'
              }`}
              aria-label={`Témoignage ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
