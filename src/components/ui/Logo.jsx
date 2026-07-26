import { Link } from 'react-router-dom'
import clsx from 'clsx'

const LOGO_SRC = '/logo.png?v=11'

function Mark({ className }) {
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-espresso-800 bg-cream-50 shadow-soft',
        className
      )}
    >
      <img
        src={LOGO_SRC}
        alt=""
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  )
}

/**
 * Logo Ateliê Angel Art Crochê
 * @param {'full'|'mark'} variant
 * @param {'light'|'dark'} tone — light = fundo claro; dark = fundo escuro
 * @param {boolean} showText — texto ao lado (a arte já traz o nome; use false para só o selo)
 */
export default function Logo({
  variant = 'full',
  tone = 'light',
  name = 'Angel Art',
  tagline,
  to,
  className,
  markClassName,
  showText = false,
}) {
  const isDark = tone === 'dark'

  const content = (
    <>
      <Mark className={clsx('h-12 w-12', markClassName)} />
      {variant === 'full' && showText && (
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
