import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, scaleIn, staggerContainer, staggerItem, viewportOnce } from '../../lib/motion'

export function Reveal({
  children,
  className,
  delay = 0,
  variant = 'up',
  as = 'div',
}) {
  const reduce = useReducedMotion()
  const Component = motion[as] || motion.div
  const variants = variant === 'scale' ? scaleIn : fadeUp

  if (reduce) {
    const Tag = as === 'div' ? 'div' : as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </Component>
  )
}

export function Stagger({ children, className, as = 'div' }) {
  const reduce = useReducedMotion()
  const Component = motion[as] || motion.div

  if (reduce) {
    const Tag = as === 'div' ? 'div' : as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Component
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({ children, className, as = 'div' }) {
  const reduce = useReducedMotion()
  const Component = motion[as] || motion.div

  if (reduce) {
    const Tag = as === 'div' ? 'div' : as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Component className={className} variants={staggerItem}>
      {children}
    </Component>
  )
}
