import chukLogo from '../assets/partners/chuk.png'
import rbcLogo from '../assets/partners/rbc-white.png'
import rssbLogo from '../assets/partners/rssb.webp'
import minisanteLogo from '../assets/partners/minisante.jpg'
import hLogoBlack from '../assets/partners/h-logo-black.svg'

const partners = [
  {
    name: 'RBC',
    subtitle: 'Rwanda Biomedical Centre',
    logoUrl: rbcLogo,
  },
  {
    name: 'MINISANTE',
    subtitle: 'Ministry of Health',
    logoUrl: minisanteLogo,
  },
  {
    name: 'RSSB',
    subtitle: 'Rwanda Social Security Board',
    logoUrl: rssbLogo,
  },
  {
    name: 'CHUK',
    subtitle: 'University Teaching Hospital of Kigali',
    logoUrl: chukLogo,
  },
  {
    name: 'WHO',
    subtitle: 'World Health Organization Rwanda',
    logoUrl: hLogoBlack,
  },
]

function PartnersStrip() {
  return (
    <section className="section partners-section" aria-label="Partners">
      <div className="section-head">
        <p className="eyebrow">Our network</p>
        <h2>Trusted partners we work with</h2>
      </div>

      <div className="partners-grid">
        {partners.map((partner, index) => (
          <article
            key={partner.name}
            className="partner-card"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div
              className={`partner-logo ${partner.name === 'RBC' ? 'partner-logo--dark' : ''}`}
              aria-hidden="true"
            >
              <img src={partner.logoUrl} alt={`${partner.name} logo`} loading="lazy" />
            </div>
            <p className="partner-name">{partner.name}</p>
            <p className="partner-subtitle">{partner.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PartnersStrip
