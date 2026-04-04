export function Badge({ children, variant = 'default', pulse = false, className = '' }) {
  const variants = {
    default: 'bg-acier/20 text-acier border border-acier/30',
    or:      'bg-or/10 text-or border border-or/30',
    alerte:  'bg-alerte/10 text-alerte border border-alerte/30',
    success: 'bg-green-500/10 text-green-400 border border-green-500/30',
    dark:    'bg-forge/80 text-calcaire border border-acier/20',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest px-3 py-1.5 ${variants[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variant === 'success' ? 'bg-green-400' : 'bg-alerte'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${variant === 'success' ? 'bg-green-400' : 'bg-alerte'}`} />
        </span>
      )}
      {children}
    </span>
  )
}
