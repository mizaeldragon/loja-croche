import { Link } from 'react-router-dom'
import clsx from 'clsx'

function Mark({ className }) {
  return (
    <img
      src="/logo.png"
      alt=""
      className={clsx('shrink-0 object-cover', className)}
      draggable={false}
    />
  )
}

/**
 * Logo Ateliê Angel Art Crochê
 * @param {'full'|'mark'} variant
 * @param {'light'|'dark'} tone — light = fundo claro; dark = fundo escuro (footer/admin)
 */
export default function Logo({
  variant = 'full',
  tone = 'light',
  name = 'Angel Art',
  tagline,
  to,
  className,
  markClassName,
}) {
  const isDark = tone === 'dark'

  const content = (
    <>
      <Mark
        className={clsx(
          'h-11 w-11 rounded-full bg-cream-50 shadow-soft ring-1 ring-espresso-700/10',
          markClassName
        )}
      />
      {variant === 'full' && (
        <span className="min-w-0 leading-tight">
          <span
            className={clsx(
              'block truncate font-display text-[1.05rem] font-semibold tracking-tight sm:text-lg',
              isDark ? 'text-cream-50' : 'text-espresso-800'
            )}
          >
            {name}
          </span>
          {tagline && (
            <span
              className={clsx(
                'mt-0.5 block truncate text-[0.62rem] font-medium uppercase tracking-[0.16em]',
                isDark ? 'text-cream-100/50' : 'text-terracotta-500'
              )}
            >
              {tagline}
            </span>
          )}
        </span>
      )}
    </>
  )

  const classes = clsx('inline-flex items-center gap-2.5', className)

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={name}>
        {content}
      </Link>
    )
  }

  return (
    <div className={classes} aria-label={name}>
      {content}
    </div>
  )
}
