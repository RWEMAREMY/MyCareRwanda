import { useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import myCareLogo from '../assets/mycare-logo.png'

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

const getRoleLabel = (role: string) => {
  if (role === 'admin') return 'Admin'
  if (role === 'client') return 'Client'
  if (role.includes('caretaker')) return 'Caretaker'
  return 'Member'
}

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 4) return 'Hidden'
  return `${'*'.repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`
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

  const userName = user?.fullName || 'User'
  const role = user?.role || 'client'
  const roleLabel = getRoleLabel(role)

  return (
    <div className="page auth-page dashboard-page">
      <main className="auth-page-main dashboard-main">
        <header className="topbar auth-topbar">
          <div className="logo-wrap">
            <img className="logo-image" src={myCareLogo} alt="MyCare Rwanda logo" />
            <div>
              <p className="logo-text auth-logo-text">MyCare Rwanda</p>
              <p className="logo-sub auth-logo-sub">{roleLabel} Dashboard</p>
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

        <section className="section auth-section dashboard-shell">
          <div className="dashboard-layout">
            <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
              <p className="dashboard-sidebar-title">Dashboard Menu</p>
              <nav className="dashboard-nav">
                <a href="#overview" className="dashboard-nav-link">Overview</a>
                <a href="#profile" className="dashboard-nav-link">Confidential Profile</a>
                <a href="#security" className="dashboard-nav-link">Security & Privacy</a>
                <a href="#role-zone" className="dashboard-nav-link">Role Workspace</a>
                <a href="#role-actions" className="dashboard-nav-link">Quick Actions</a>
              </nav>
            </aside>

            <div className="dashboard-grid">
              <article id="overview" className="dashboard-card dashboard-card--hero">
                <p className="dashboard-kicker">Trusted care operations</p>
                <h2>Welcome back, {userName}</h2>
                <p className="auth-helper">
                  This workspace follows confidentiality-first defaults: role-limited visibility, masked
                  contacts, and secure actions.
                </p>
                <div className="dashboard-chip-row">
                  <span className="dashboard-chip">Role: {roleLabel}</span>
                  <span className="dashboard-chip">Session: Active</span>
                  <span className="dashboard-chip">Data access: Scoped</span>
                </div>
              </article>

              <article id="profile" className="dashboard-card">
                <h3>Confidential Profile</h3>
                <p className="auth-current-user">
                  Name: <strong>{userName}</strong>
                </p>
                <p className="auth-current-user">Email: {user?.email || '-'}</p>
                <p className="auth-current-user">Phone: {maskPhone(user?.phoneNumber || '')}</p>
                <p className="auth-current-user">Internal Role: {role}</p>
              </article>

              <article id="security" className="dashboard-card">
                <h3>Security & Privacy</h3>
                <ul className="dashboard-list">
                  <li>Minimum data exposure by role</li>
                  <li>Activity and request traceability</li>
                  <li>Access only for active authenticated sessions</li>
                </ul>
              </article>

              {role === 'admin' && (
                <>
                  <article id="role-zone" className="dashboard-card">
                    <h3>Platform Control</h3>
                    <ul className="dashboard-list">
                      <li>Manage users, role permissions, and escalations</li>
                      <li>Review incident and compliance summaries</li>
                      <li>Oversee service quality trends and staffing</li>
                    </ul>
                  </article>
                  <article id="role-actions" className="dashboard-card">
                    <h3>Admin Quick Actions</h3>
                    <div className="dashboard-actions">
                      <button className="btn btn-primary" type="button">Review Access Logs</button>
                      <button className="btn btn-outline" type="button">Approve Role Changes</button>
                    </div>
                  </article>
                </>
              )}

              {role === 'client' && (
                <>
                  <article id="role-zone" className="dashboard-card">
                    <h3>Care Planning</h3>
                    <ul className="dashboard-list">
                      <li>Post care requests with schedule and preferences</li>
                      <li>Track active bookings and upcoming visits</li>
                      <li>Review caregiver notes and service history</li>
                    </ul>
                  </article>
                  <article id="role-actions" className="dashboard-card">
                    <h3>Client Quick Actions</h3>
                    <div className="dashboard-actions">
                      <Link className="btn btn-primary" to="/caretakers">Find Caretakers</Link>
                      <button className="btn btn-outline" type="button">Post New Request</button>
                    </div>
                  </article>
                </>
              )}

              {role.includes('caretaker') && (
                <>
                  <article id="role-zone" className="dashboard-card">
                    <h3>Caretaker Workspace</h3>
                    <ul className="dashboard-list">
                      <li>View assigned clients and approved care plans</li>
                      <li>Update availability and shift status</li>
                      <li>Log visit summaries with confidentiality reminders</li>
                    </ul>
                  </article>
                  <article id="role-actions" className="dashboard-card">
                    <h3>Caretaker Quick Actions</h3>
                    <div className="dashboard-actions">
                      <button className="btn btn-primary" type="button">Update Availability</button>
                      <button className="btn btn-outline" type="button">Submit Care Note</button>
                    </div>
                  </article>
                </>
              )}
            </div>
          </div>
          <footer className="dashboard-footer">
            <p>MyCare Rwanda Dashboard</p>
            <p>Confidentiality-first care coordination.</p>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
