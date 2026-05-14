import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'

type CareSection = 'Child Care' | 'Hospital Care' | 'Home Care'

type Caretaker = {
  id: string
  name: string
  age: number
  section: CareSection
  rating: number
  photoUrl: string
}

const caretakers: Caretaker[] = [
  {
    id: 'c1',
    name: 'Aline Mukamana',
    age: 28,
    section: 'Child Care',
    rating: 4.8,
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 'c2',
    name: 'Jean Claude Niyonsenga',
    age: 34,
    section: 'Hospital Care',
    rating: 4.6,
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 'c3',
    name: 'Grace Uwimana',
    age: 31,
    section: 'Home Care',
    rating: 4.9,
    photoUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 'c4',
    name: 'Eric Habimana',
    age: 29,
    section: 'Hospital Care',
    rating: 4.7,
    photoUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    id: 'c5',
    name: 'Diane Ingabire',
    age: 26,
    section: 'Child Care',
    rating: 4.5,
    photoUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
  },
  {
    id: 'c6',
    name: 'Patrick Nkundabagenzi',
    age: 37,
    section: 'Home Care',
    rating: 4.8,
    photoUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
]

const renderStars = (rating: number) => {
  const rounded = Math.round(rating)
  return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded)
}

function CaretakersPage() {
  return (
    <div className="page auth-page">
      <main className="auth-page-main caretakers-page-main">
        <SiteHeader
          topbarClassName="auth-topbar"
          subtitle="Caretakers"
          loginButtonClassName="btn btn-primary"
          loginLabel="Login"
        />

        <section className="section caretakers-section">
          <div className="section-head">
            <p className="eyebrow">Trusted Team</p>
            <h2>Meet Our Caretakers</h2>
          </div>
          <div className="caretakers-grid">
            {caretakers.map((caretaker) => (
              <article className="caretaker-card" key={caretaker.id}>
                <img className="caretaker-photo" src={caretaker.photoUrl} alt={caretaker.name} />
                <h3>{caretaker.name}</h3>
                <p>Age: {caretaker.age}</p>
                <p>Section: {caretaker.section}</p>
                <p className="caretaker-rating">
                  Rating: {caretaker.rating.toFixed(1)} <span>{renderStars(caretaker.rating)}</span>
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default CaretakersPage
