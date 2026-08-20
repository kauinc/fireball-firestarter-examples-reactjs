import logoUrl from '../../../assets/brand/astudio-gaming-logo.png'

/**
 * Centered astudio GAMING mark used on boot / connect screens.
 */
export function BrandLogo({ className = '', alt = 'astudio GAMING' }) {
  return (
    <img
      className={['loading-screen__logo', className].filter(Boolean).join(' ')}
      src={logoUrl}
      alt={alt}
      draggable={false}
    />
  )
}
