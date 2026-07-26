import { Link } from 'react-router-dom'
import clsx from 'clsx'

function Mark({ className }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="18" fill="#F5EEE1" />
      <circle cx="30" cy="34" r="16" fill="#E4D4B8" />
      <path
        d="M18 28c4 1 8-1 12 1s7 2 12-1M17 34c5 1.5 9-1 13 1s8 2 14-1M19 40c4 .8 8-1 12 .8s8 1.5 12-.5"
        stroke="#A2573A"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M22 23c2.5 5 2 11 0 17M30 21c1.5 5.5 1.2 12 0 19M38 23c-1.8 5-1.5 11 0 16"
        stroke="#C89B6B"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity=".9"
      />
      <path d="M42 12l8 8-22 22-4-4 18-26z" fill="#3D2B20" />
      <path
        d="M50 20c2.8-2.8 5.2-2.2 6.5-.8 1.4 1.4 1.8 3.8-.8 6.5"
        stroke="#B99655"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="48.5" cy="18.5" r="1.6" fill="#B99655" />
    </svg>
  )
}

/**
 * Logo Linha & Ponto
 * @param {'full'|'mark'} variant
 * @param {'light'|'dark'} tone — light = fundo claro; dark = fundo escuro (footer/admin)
 */
export default function Logo({
  variant = 'full',
  tone = 'light',
  name = 'Linha & Ponto',
  tagline,
  to,
  className,
  markClassName,
}) {
  const isDark = tone === 'dark'

  const content = (
    <>
      <Mark className={clsx('h-10 w-10 shrink-0 overflow-hidden rounded-[18px]', markClassName)} />
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
