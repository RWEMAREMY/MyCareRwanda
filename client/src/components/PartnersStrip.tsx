import chukLogo from '../assets/partners/chuk.png'
import rbcLogo from '../assets/partners/rbc-white.png'
import rssbLogo from '../assets/partners/rssb.webp'

const partners = [
  {
    name: 'RBC',
    subtitle: 'Rwanda Biomedical Centre',
    logoUrl: rbcLogo,
  },
  {
    name: 'MINISANTE',
    subtitle: 'Ministry of Health',
    logoUrl: 'https://logo.clearbit.com/moh.gov.rw',
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
    logoUrl: 'https://logo.clearbit.com/who.int',
  },
  {
    name: 'UNICEF',
    subtitle: 'UNICEF Rwanda',
    logoUrl: 'https://logo.clearbit.com/unicef.org',
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
