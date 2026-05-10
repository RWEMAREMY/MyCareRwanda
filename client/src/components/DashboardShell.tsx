import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import myCareLogo from '../assets/mycare-logo.png'

type DashboardShellProps = {
  subtitle: string
  roleLabel: string
  onLogout: () => void
  children: ReactNode
}

function DashboardShell({ subtitle, roleLabel, onLogout, children }: DashboardShellProps) {
  return (
    <div className="page auth-page dashboard-page">
      <main className="auth-page-main dashboard-main dashboard-main--appshell">
        <header className="topbar auth-topbar">
          <div className="logo-wrap">
            <img className="logo-image" src={myCareLogo} alt="MyCare Rwanda logo" />
            <div>
              <p className="logo-text auth-logo-text">MyCare Rwanda</p>
              <p className="logo-sub auth-logo-sub">{subtitle}</p>
            </div>
          </div>
          <div className="nav-cta">
            <span className="dashboard-role-pill">{roleLabel}</span>
            <button className="btn btn-primary" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="section auth-section dashboard-shell">
          <div className="dashboard-layout dashboard-layout--peekaboo">
            <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
              <p className="dashboard-sidebar-title">Dashboard Menu</p>
              <nav className="dashboard-nav">
                <Link to="/dashboard" className="dashboard-nav-link">Overview</Link>
                <Link to="/dashboard#profile" className="dashboard-nav-link">Confidential Profile</Link>
                <Link to="/dashboard#security" className="dashboard-nav-link">Security & Privacy</Link>
                <Link to="/dashboard/security/change-password" className="dashboard-nav-link">Change Password</Link>
                <Link to="/dashboard#role-zone" className="dashboard-nav-link">Role Workspace</Link>
                <Link to="/dashboard#role-actions" className="dashboard-nav-link">Quick Actions</Link>
                <Link to="/dashboard/admin-role-management" className="dashboard-nav-link">Role Management</Link>
                <Link to="/" className="dashboard-nav-link">Home</Link>
              </nav>
            </aside>

            <div className="dashboard-workspace">{children}</div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardShell
