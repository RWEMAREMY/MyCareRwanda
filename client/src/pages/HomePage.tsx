import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PartnersStrip from '../components/PartnersStrip'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'

const services = [
  {
    title: 'Child Care',
    description:
      'Babysitters and daily child caregivers for school runs, routines, and evening support.',
    icon: '01',
  },
  {
    title: 'Adult Care',
    description:
      'Compassionate support for adults needing mobility, medication reminders, or companionship.',
    icon: '02',
  },
  {
    title: 'Home Care',
    description:
      'Trusted in-home caretakers who support loved ones safely in their own familiar space.',
    icon: '03',
  },
  {
    title: 'Hospital Caretakers',
    description:
      'On-site attendants for hospital stays to ensure your relative is never alone while you work.',
    icon: '04',
  },
  {
    title: 'Instant Care',
    description:
      'Urgent same-day care when work gets hectic and you need immediate help for loved ones.',
    icon: '05',
  },
]

const highlights = [
  { label: 'Families supported', value: '18K+' },
  { label: 'Districts covered', value: '30' },
  { label: 'Average match time', value: '35 min' },
]

const steps = [
  {
    title: 'Share your care need',
    description: 'Choose child, adult, home, hospital, or instant care and your schedule.',
  },
  {
    title: 'Review trusted profiles',
    description: 'Compare caregiver experience, language, rates, and location in Rwanda.',
  },
  {
    title: 'Book with confidence',
    description: 'Interview quickly and hire the best fit for your loved one.',
  },
]

function HomePage() {
  const navigate = useNavigate()
  const [district, setDistrict] = useState('')
  const [category, setCategory] = useState('')

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams({ tab: 'register' })
    if (district.trim()) params.set('district', district.trim())
    if (category.trim()) params.set('category', category.trim())
    navigate(`/auth?${params.toString()}`)
  }

  return (
    <div className="page">
      <main>
        <section className="hero-banner">
          <div className="hero-overlay">
            <SiteHeader />

            <div className="hero-stage">
              <div className="hero-copy">
                <p className="eyebrow">Murakaza neza</p>
                <h1>Connecting families with trusted local caregivers in Rwanda.</h1>
                <p className="hero-sub">
                  Child care, adult care, home care, hospital caretakers, and instant support
                  when your schedule gets hectic.
                </p>

                <form className="search-card search-card-hero" aria-label="Search care" onSubmit={onSearchSubmit}>
                  <label>
                    District
                    <input
                      type="text"
                      placeholder="Kigali, Huye, Rubavu..."
                      value={district}
                      onChange={(event) => setDistrict(event.target.value)}
                    />
                  </label>

                  <label>
                    Care category
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                      <option value="" disabled>
                        Select category
                      </option>
                      <option>Child Care</option>
                      <option>Adult Care</option>
                      <option>Home Care</option>
                      <option>Hospital Caretaker</option>
                      <option>Instant Care</option>
                    </select>
                  </label>

                  <button type="submit" className="btn btn-join">
                    Search
                  </button>
                </form>

                <div className="quick-tags" aria-label="Popular searches">
                  <span>Night shift hospital support</span>
                  <span>After-school child care</span>
                  <span>Weekend adult companion</span>
                  <span>Urgent same-day caretaker</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="highlights" aria-label="Key numbers">
          {highlights.map((item) => (
            <article key={item.label} className="highlight-item">
              <p>{item.value}</p>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <section id="services" className="section services">
          <div className="section-head">
            <p className="eyebrow">One trusted platform</p>
            <h2>Care designed for real family pressure</h2>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <p className="service-icon">{service.icon}</p>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="instant" className="section urgency">
          <div className="urgency-copy">
            <p className="eyebrow">For hectic schedules</p>
            <h2>Instant care when work cannot wait.</h2>
            <p>
              If you are in a demanding job and suddenly need someone for your child, parent,
              or hospitalized relative, request urgent support and get matched in minutes.
            </p>
            <button className="btn btn-primary">Request instant care</button>
          </div>
          <div className="urgency-card" aria-hidden="true">
            <p className="urgency-time">Average instant response</p>
            <strong>16 mins</strong>
            <p className="urgency-note">Kigali, Huye, Musanze, Rubavu, and expanding</p>
          </div>
        </section>

        <section id="how" className="section steps">
          <div className="section-head">
            <p className="eyebrow">Simple process</p>
            <h2>Find care on your terms</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article key={step.title} className="step-card">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="culture" className="section culture">
          <div className="culture-panel">
            <p className="eyebrow">Rooted in Rwanda</p>
            <h2>Community care inspired by ubumwe and ubumuntu.</h2>
            <p>
              Our matching experience reflects neighborhood trust, respect for elders, and
              child safety values practiced in Rwandan homes. Every care journey is handled
              with dignity, clarity, and human warmth.
            </p>
          </div>
          <div className="pattern-card" aria-hidden="true">
            <div className="pattern" />
            <p>Visual language inspired by imigongo rhythm and Rwandan landscapes.</p>
          </div>
        </section>

        <PartnersStrip />
      </main>
      <SiteFooter />
    </div>
  )
}

export default HomePage
