import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import myCareLogo from '../assets/mycare-logo.png'

type SessionUser = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
}

type NavPage = 'overview' | 'profile' | 'security' | 'workspace' | 'actions' | 'operations'

type NavItem = {
  id: NavPage
  label: string
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

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'profile', label: 'Confidential Profile' },
    { id: 'security', label: 'Security & Privacy' },
    ...(role === 'admin' ? [{ id: 'operations' as const, label: 'Operations Details' }] : []),
    { id: 'workspace', label: 'Role Workspace' },
    { id: 'actions', label: 'Quick Actions' },
  ]

  const [activePage, setActivePage] = useState<NavPage>('overview')

  const renderOverview = () => (
    <>
      <article className="dashboard-card dashboard-card--hero">
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
      <article className="dashboard-card">
        <h3>Today Snapshot</h3>
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-box">
            <span>Open Tasks</span>
            <strong>{role === 'admin' ? '27' : role === 'client' ? '4' : '8'}</strong>
          </div>
          <div className="dashboard-stat-box">
            <span>Scheduled Visits</span>
            <strong>{role === 'admin' ? '49' : role === 'client' ? '2' : '5'}</strong>
          </div>
          <div className="dashboard-stat-box">
            <span>Critical Alerts</span>
            <strong>{role === 'admin' ? '1' : '0'}</strong>
          </div>
        </div>
      </article>
      <article className="dashboard-card">
        <h3>Focus Priorities</h3>
        <ul className="dashboard-list">
          <li>Complete top 3 care-related tasks before noon</li>
          <li>Review new notifications from your role workspace</li>
          <li>Confirm confidential notes are up to date</li>
        </ul>
      </article>
      {role !== 'admin' && (
        <article className="dashboard-card">
          <h3>Operations Snapshot</h3>
          <ul className="dashboard-list">
            <li>Open Tasks: {role === 'client' ? '4' : '8'}</li>
            <li>Scheduled Visits: {role === 'client' ? '2' : '5'}</li>
            <li>Critical Alerts: 0</li>
          </ul>
        </article>
      )}
      <article className="dashboard-card">
        <h3>Caretaker Status</h3>
        <ul className="dashboard-list">
          <li>Current state: {role === 'caretaker' || role.includes('caretaker') ? 'On shift' : 'Assigned'}</li>
          <li>Availability: {role === 'caretaker' || role.includes('caretaker') ? 'Available' : 'Confirmed for next visit'}</li>
          <li>Last care-note update: 45 minutes ago</li>
        </ul>
      </article>
      <article className="dashboard-card">
        <h3>Client Status</h3>
        <ul className="dashboard-list">
          <li>Primary support: Mobility assistance</li>
          <li>Next scheduled visit: May 8, 2026 - 09:00</li>
          <li>Current risk level: Moderate (stable)</li>
        </ul>
      </article>
    </>
  )

  const renderProfile = () => (
    <>
      <article className="dashboard-card">
        <h3>Confidential Profile</h3>
        <div className="dashboard-profile-grid">
          <p className="auth-current-user">
            Name: <strong>{userName}</strong>
          </p>
          <p className="auth-current-user">Email: {user?.email || '-'}</p>
          <p className="auth-current-user">Phone: {maskPhone(user?.phoneNumber || '')}</p>
          <p className="auth-current-user">Internal Role: {role}</p>
        </div>
      </article>
      <article className="dashboard-card">
        <h3>Identity Status</h3>
        <ul className="dashboard-list">
          <li>Verified account: Yes</li>
          <li>Profile completeness: 92%</li>
          <li>Last update: Today</li>
        </ul>
      </article>
    </>
  )

  const renderSecurity = () => (
    <>
      <article className="dashboard-card">
        <h3>Security & Privacy</h3>
        <ul className="dashboard-list">
          <li>Minimum data exposure by role</li>
          <li>Activity and request traceability</li>
          <li>Access only for active authenticated sessions</li>
        </ul>
        <div className="dashboard-actions">
          <Link className="btn btn-outline" to="/dashboard/security/change-password">
            Change Password
          </Link>
        </div>
        <div className="dashboard-note-banner">Last audit check: Passed (today)</div>
      </article>
      <article className="dashboard-card">
        <h3>Protection Checklist</h3>
        <ul className="dashboard-list">
          <li>Password policy: compliant</li>
          <li>Session monitoring: active</li>
          <li>Restricted-record access: enforced</li>
        </ul>
      </article>
    </>
  )

  const renderWorkspace = () => {
    if (role === 'admin') {
      return (
        <>
          <article className="dashboard-card dashboard-card--full">
            <h3>Platform Control</h3>
            <ul className="dashboard-list">
              <li>Manage users, role permissions, and escalations</li>
              <li>Review incident and compliance summaries</li>
              <li>Oversee service quality trends and staffing</li>
            </ul>
          </article>
          <article className="dashboard-card">
            <h3>Team Capacity</h3>
            <ul className="dashboard-list">
              <li>Active caretakers: 84</li>
              <li>On-call supervisors: 6</li>
              <li>Pending onboarding: 11</li>
            </ul>
          </article>
          <article className="dashboard-card">
            <h3>Service Health</h3>
            <ul className="dashboard-list">
              <li>Avg response time: 18 min</li>
              <li>Visit completion rate: 97%</li>
              <li>SLA breaches today: 1</li>
            </ul>
          </article>
        </>
      )
    }

    if (role === 'client') {
      return (
        <>
          <article className="dashboard-card dashboard-card--full">
            <h3>Care Planning</h3>
            <ul className="dashboard-list">
              <li>Post care requests with schedule and preferences</li>
              <li>Track active bookings and upcoming visits</li>
              <li>Review caregiver notes and service history</li>
            </ul>
          </article>
          <article className="dashboard-card">
            <h3>Upcoming Visit</h3>
            <ul className="dashboard-list">
              <li>Date: Tomorrow, 09:00 AM</li>
              <li>Caretaker: Assigned</li>
              <li>Service: Home support</li>
            </ul>
          </article>
          <article className="dashboard-card">
            <h3>Care Plan Notes</h3>
            <ul className="dashboard-list">
              <li>Medication reminder included</li>
              <li>Mobility assistance requested</li>
              <li>Weekly reassessment enabled</li>
            </ul>
          </article>
        </>
      )
    }

    return (
      <>
        <article className="dashboard-card dashboard-card--full">
          <h3>Caretaker Workspace</h3>
          <ul className="dashboard-list">
            <li>View assigned clients and approved care plans</li>
            <li>Update availability and shift status</li>
            <li>Log visit summaries with confidentiality reminders</li>
          </ul>
        </article>
        <article className="dashboard-card">
          <h3>Assigned Clients</h3>
          <ul className="dashboard-list">
            <li>Morning round: 3 clients</li>
            <li>Afternoon round: 2 clients</li>
            <li>Escalation watchlist: 1 client</li>
          </ul>
        </article>
        <article className="dashboard-card">
          <h3>Shift Readiness</h3>
          <ul className="dashboard-list">
            <li>Checklist completion: 100%</li>
            <li>Care supplies status: Ready</li>
            <li>Travel route confirmed: Yes</li>
          </ul>
        </article>
      </>
    )
  }

  const renderOperationsDetails = () => (
    <>
      <article className="dashboard-card dashboard-card--full">
        <h3>Operations Details</h3>
        <p className="auth-helper">Detailed operational tracking and client profile context.</p>
      </article>
      <article className="dashboard-card">
        <h3>Open Tasks</h3>
        <ul className="dashboard-list">
          <li>Care note approvals pending: 6</li>
          <li>Unassigned requests: 3</li>
          <li>Follow-up callbacks due today: 4</li>
        </ul>
      </article>
      <article className="dashboard-card">
        <h3>Scheduled Visits</h3>
        <ul className="dashboard-list">
          <li>Morning visits: 12</li>
          <li>Afternoon visits: 18</li>
          <li>Evening visits: 7</li>
        </ul>
      </article>
      <article className="dashboard-card">
        <h3>Critical Alerts</h3>
        <ul className="dashboard-list">
          <li>Medication urgency flag: 1</li>
          <li>No-show follow-up needed: 1</li>
          <li>Safety escalation in review: 0</li>
        </ul>
      </article>
      <article className="dashboard-card dashboard-card--wide">
        <h3>Client Details</h3>
        <div className="client-details-grid">
          <div>
            <p className="auth-current-user"><strong>Client:</strong> Jeanette Mukamana</p>
            <p className="auth-current-user"><strong>Age:</strong> 74</p>
            <p className="auth-current-user"><strong>Plan:</strong> Assisted home care</p>
          </div>
          <div>
            <p className="auth-current-user"><strong>Primary Need:</strong> Mobility support</p>
            <p className="auth-current-user"><strong>Next Visit:</strong> May 8, 2026 - 09:00</p>
            <p className="auth-current-user"><strong>Risk Level:</strong> Moderate</p>
          </div>
        </div>
      </article>
    </>
  )

  const renderQuickActions = () => {
    if (role === 'admin') {
      return (
        <article className="dashboard-card dashboard-card--full">
          <h3>Admin Quick Actions</h3>
          <div className="quick-action-grid">
            <section className="quick-action-panel">
              <h4>Role Change Request</h4>
              <label>
                User Email
                <input className="dashboard-input" placeholder="user@mycarerwanda.com" />
              </label>
              <label>
                New Role
                <select className="dashboard-input">
                  <option>client</option>
                  <option>hospital-caretaker</option>
                  <option>children-caretaker</option>
                  <option>admin</option>
                </select>
              </label>
              <button className="btn btn-primary" type="button">Submit Role Review</button>
            </section>
            <section className="quick-action-panel">
              <h4>Compliance Flags</h4>
              <ul className="dashboard-list compact">
                <li>2 pending ID verifications</li>
                <li>1 late care-note submission</li>
                <li>0 unresolved incident reports</li>
              </ul>
              <button className="btn btn-outline" type="button">Open Audit Center</button>
            </section>
          </div>
        </article>
      )
    }

    if (role === 'client') {
      return (
        <article className="dashboard-card dashboard-card--full">
          <h3>Client Quick Actions</h3>
          <div className="quick-action-grid">
            <section className="quick-action-panel">
              <h4>Create Care Request</h4>
              <label>
                Care Type
                <select className="dashboard-input">
                  <option>Elderly home support</option>
                  <option>Hospital bedside support</option>
                  <option>Child-focused care</option>
                </select>
              </label>
              <label>
                Preferred Date
                <input type="date" className="dashboard-input" />
              </label>
              <button className="btn btn-primary" type="button">Post Request</button>
            </section>
            <section className="quick-action-panel">
              <h4>Fast Access</h4>
              <div className="dashboard-actions">
                <Link className="btn btn-primary" to="/caretakers">
                  Find Caretakers
                </Link>
                <button className="btn btn-outline" type="button">Message Coordinator</button>
              </div>
            </section>
          </div>
        </article>
      )
    }

    return (
      <article className="dashboard-card dashboard-card--full">
        <h3>Caretaker Quick Actions</h3>
        <div className="quick-action-grid">
          <section className="quick-action-panel">
            <h4>Availability Update</h4>
            <label>
              Shift
              <select className="dashboard-input">
                <option>Morning (6AM - 2PM)</option>
                <option>Afternoon (2PM - 10PM)</option>
                <option>Night (10PM - 6AM)</option>
              </select>
            </label>
            <label>
              Status
              <select className="dashboard-input">
                <option>Available</option>
                <option>Limited</option>
                <option>Unavailable</option>
              </select>
            </label>
            <button className="btn btn-primary" type="button">Save Availability</button>
          </section>
          <section className="quick-action-panel">
            <h4>Visit Summary</h4>
            <label>
              Confidential Note
              <textarea className="dashboard-input dashboard-textarea" placeholder="Write clinical-safe summary..." />
            </label>
            <button className="btn btn-outline" type="button">Submit Care Note</button>
          </section>
        </div>
      </article>
    )
  }

  const renderActivePage = () => {
    if (activePage === 'overview') return renderOverview()
    if (activePage === 'profile') return renderProfile()
    if (activePage === 'security') return renderSecurity()
    if (activePage === 'operations') return renderOperationsDetails()
    if (activePage === 'workspace') return renderWorkspace()
    return renderQuickActions()
  }

  return (
    <div className="page auth-page dashboard-page">
      <main className="auth-page-main dashboard-main">
        <header className="topbar auth-topbar">
        <Link className="btn" to="/">
        <div className="logo-wrap">
           <img className="logo-image"  src={myCareLogo}  alt="MyCare Rwanda logo" />
            <div>
              <p className="logo-text auth-logo-text">MyCare Rwanda</p>
              <p className="logo-sub auth-logo-sub">{roleLabel} Dashboard</p>
            </div>
            
          </div></Link>
          <div className="nav-cta">
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
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`dashboard-nav-link ${activePage === item.id ? 'dashboard-nav-link--active' : ''}`}
                    onClick={() => setActivePage(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <div className="dashboard-grid">
              <div className="dashboard-content-shell">{renderActivePage()}</div>
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
