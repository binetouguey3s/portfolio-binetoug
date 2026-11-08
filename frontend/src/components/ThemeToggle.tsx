import { useTheme } from '../hooks/useTheme'

type ThemeToggleProps = {
  /** 44 px dans le menu desktop, plus grand dans le menu mobile */
  className?: string
}

/**
 * Bouton rond en verre qui bascule entre mode sombre et mode clair.
 * Lune affichée en mode sombre, soleil en mode clair (icônes de la maquette).
 * La transition de 400 ms est gérée par src/lib/theme.ts.
 */
export default function ThemeToggle({ className = 'size-11' }: ThemeToggleProps) {
  const { theme, basculerTheme } = useTheme()
  const estSombre = theme === 'dark'

  return (
    <button
      type="button"
      onClick={basculerTheme}
      aria-label={estSombre ? 'Basculer en mode clair' : 'Basculer en mode sombre'}
      className={`glass glass-sans-ombre inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full ${className}`}
    >
      <svg
        aria-hidden="true"
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        className="stroke-accent"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {estSombre ? (
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  )
}
