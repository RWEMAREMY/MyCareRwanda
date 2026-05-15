import { useState } from 'react'
import { Link } from 'react-router-dom'
import myCareLogo from '../assets/mycare-logo.png'

type SiteHeaderProps = {
  topbarClassName?: string
  subtitle?: string
  loginButtonClassName?: string
  loginLabel?: string
}

function SiteHeader({
  topbarClassName = 'topbar-hero',
  subtitle = 'Ubumuntu in every booking',
  loginButtonClassName = 'btn btn-outline btn-light',
  loginLabel = 'Log in',
}: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className={`topbar ${topbarClassName}`}>
      <div className="logo-wrap">
        <img className="logo-image" src={myCareLogo} alt="MyCare Rwanda logo" />
        <div>
          <p className="logo-text auth-logo-text">MyCare Rwanda</p>
          <p className="logo-sub auth-logo-sub">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        className="menu-toggle"
        aria-label="Open menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="primary-nav"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`topbar-mobile-menu ${isMobileMenuOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="menu-close"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          X
        </button>
        <nav id="primary-nav" className="nav-links" aria-label="Primary">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/service" onClick={() => setIsMobileMenuOpen(false)}>Service</Link>
          <Link to="/caretakers" onClick={() => setIsMobileMenuOpen(false)}>Caretakers</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About us</Link>
        </nav>

        <div className="nav-cta">
          <Link
            className={loginButtonClassName}
            to="/auth?tab=login"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {loginLabel}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
