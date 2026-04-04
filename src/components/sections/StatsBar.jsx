import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

function AnimatedNumber({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = 16
    const increment = target / (duration / step)

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, step)

    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}

const stats = [
  { value: 80,  prefix: '',  suffix: '€/h',  label: 'Taux horaire mécanique',  sublabel: 'prix transparent, toutes marques' },
  { value: 69,  prefix: '',  suffix: '€',    label: 'Vidange + filtre',         sublabel: 'révision complète dès 149€' },
  { value: 179, prefix: '',  suffix: '€',    label: 'Disques + plaquettes',     sublabel: 'plaquettes seules dès 79€' },
]

export function StatsBar() {
  return (
    <section className="bg-calcaire py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-acier text-center mb-10">
          Nos tarifs compétitifs — prix bas toute l'année
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-acier/20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center px-8 py-8 md:py-4"
            >
              <p
                className="font-display text-anthracite leading-none mb-2"
                style={{ fontSize: 'clamp(44px, 5vw, 72px)' }}
              >
                <AnimatedNumber target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="font-mono text-xs uppercase tracking-widest text-anthracite/80 mb-1">
                {stat.label}
              </p>
              <p className="font-body text-xs text-acier">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
