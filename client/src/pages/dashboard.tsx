import { useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

type SessionUser = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
}

const getStoredToken = () => {
  const raw = localStorage.getItem('token') || localStorage.getItem('authToken')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return parsed?.accessToken || parsed
  } catch {
    return raw
  }
}

const getStoredUser = (): SessionUser | null => {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

function DashboardPage() {
  const navigate = useNavigate()
  const token = useMemo(() => getStoredToken(), [])
  const user = useMemo(() => getStoredUser(), [])

  if (!token) return <Navigate to="/auth?tab=login" replace />

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/auth?tab=login', { replace: true })
  }

  return (
    <div className="page auth-page">
      <main className="auth-page-main">
        <header className="topbar auth-topbar">
          <div className="logo-wrap">
            <span className="logo-badge" aria-hidden="true">
              MR
            </span>
            <div>
              <p className="logo-text auth-logo-text">MyCare Rwanda</p>
              <p className="logo-sub auth-logo-sub">Dashboard</p>
            </div>
          </div>
          <div className="nav-cta">
            <Link className="btn btn-outline" to="/">
              Home
            </Link>
            <button className="btn btn-primary" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="section auth-section">
          <div className="auth-swap-card">
            <div className="auth-form-side">
              <h2>Welcome back</h2>
              <p className="auth-helper">Your session is active and authenticated.</p>
              <p className="auth-current-user">
                Logged in as <strong>{user?.fullName || 'User'}</strong>
              </p>
              <p className="auth-current-user">Role: {user?.role || 'client'}</p>
              <p className="auth-current-user">Email: {user?.email || '-'}</p>
              <p className="auth-current-user">Phone: {user?.phoneNumber || '-'}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
