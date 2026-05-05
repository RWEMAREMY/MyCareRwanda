import { Link } from 'react-router-dom'
import myCareLogo from '../assets/mycare-logo.png'
import PartnersStrip from '../components/PartnersStrip'
import SiteFooter from '../components/SiteFooter'

function AboutUsPage() {
  return (
    <div className="page auth-page">
      <main className="auth-page-main">
      <header className="topbar topbar-hero">
          <div className="logo-wrap">
            <img className="logo-image" src={myCareLogo} alt="MyCare Rwanda logo" />
            <div>
              <p className="logo-text auth-logo-text">MyCare Rwanda</p>
              <p className="logo-sub auth-logo-sub">Caretakers</p>
            </div>
          </div>
          <nav className="nav-links" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/caretakers">Caretakers</Link>
            <Link to="/about">About us</Link>
          </nav>
          <div className="nav-cta">
            <Link className="btn btn-outline" to="/auth?tab=login">
              Log in
            </Link>
          </div>
        </header>

        <section className="section about-brief">
          <div className="section-head">
            <p className="eyebrow">Who we are</p>
            <h2>Reliable care support for every Rwandan family</h2>
          </div>

          <div className="about-grid">
            <article className="about-card">
              <h3>Our mission</h3>
              <p>
                MyCare Rwanda connects families with trusted caregivers for child care, adult care,
                home care, and hospital support so loved ones are safe even during busy work days.
              </p>
            </article>

            <article className="about-card">
              <h3>How we work</h3>
              <p>
                We verify caregiver profiles, match requests quickly, and keep communication clear so
                families can book care with confidence and dignity.
              </p>
            </article>

            <article className="about-card">
              <h3>Why families choose us</h3>
              <p>
                We combine local understanding, professional standards, and fast response times to
                support households, patients, and elders across Rwanda.
              </p>
            </article>
          </div>
        </section>

        <PartnersStrip />
      </main>
      <SiteFooter />
    </div>
  )
}

export default AboutUsPage
