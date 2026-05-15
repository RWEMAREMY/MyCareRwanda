import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'

const services = [
  {
    title: 'Child Care',
    description:
      'Babysitters and daily child caregivers for school runs, routines, and evening support.',
    icon: '01',
    support: 'Ages 6 months to 12 years',
    responseTime: 'Match in 20-40 min',
  },
  {
    title: 'Adult Care',
    description:
      'Compassionate support for adults needing mobility, medication reminders, or companionship.',
    icon: '02',
    support: 'Daily routines and check-ins',
    responseTime: 'Match in 30-60 min',
  },
  {
    title: 'Home Care',
    description:
      'Trusted in-home caretakers who support loved ones safely in their own familiar space.',
    icon: '03',
    support: 'Flexible day and night shifts',
    responseTime: 'Match in 25-50 min',
  },
  {
    title: 'Hospital Caretakers',
    description:
      'On-site attendants for hospital stays to ensure your relative is never alone while you work.',
    icon: '04',
    support: 'Ward support and companionship',
    responseTime: 'Match in 15-35 min',
  },
  {
    title: 'Instant Care',
    description:
      'Urgent same-day care when work gets hectic and you need immediate help for loved ones.',
    icon: '05',
    support: 'Emergency and last-minute requests',
    responseTime: 'Match in 10-20 min',
  },
]

function ServicePage() {
  return (
    <div className="page auth-page">
      <main className="auth-page-main">
        <SiteHeader subtitle="Services" loginButtonClassName="btn btn-outline" />

        <section className="section services service-page-section">
          <div className="section-head">
            <p className="eyebrow">Our services</p>
            <h2>Care designed for real family pressure</h2>
          </div>

          <div className="service-grid service-page-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card service-page-card">
                <div className="service-page-card-top">
                  <p className="service-icon">{service.icon}</p>
                  <span className="service-page-chip">Verified support</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-page-meta">
                  <span>{service.support}</span>
                  <span>{service.responseTime}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default ServicePage
