export function SectionLabel({ children, light = false, className = '' }) {
  return (
    <p className={`font-mono text-xs uppercase tracking-[0.25em] mb-4 ${light ? 'text-acier' : 'text-or'} ${className}`}>
      {children}
    </p>
  )
}
