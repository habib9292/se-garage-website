import { motion } from 'framer-motion'

export function Button({ variant = 'primary', children, className = '', size = 'md', ...props }) {
  const base = 'inline-flex items-center justify-center font-body font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2 focus-visible:ring-offset-forge'

  const sizes = {
    sm: 'text-sm px-5 py-2.5',
    md: 'text-sm px-7 py-3.5',
    lg: 'text-base px-9 py-4',
  }

  const variants = {
    primary:   'bg-or text-anthracite hover:bg-amber-500 active:scale-95',
    secondary: 'border border-or text-or hover:bg-or hover:text-anthracite active:scale-95',
    ghost:     'text-calcaire border border-calcaire/30 hover:border-calcaire hover:bg-calcaire/10 active:scale-95',
    dark:      'bg-anthracite text-calcaire hover:bg-black active:scale-95',
  }

  return (
    <motion.button
      whileHover={{ scale: variant === 'primary' ? 1.02 : 1 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
