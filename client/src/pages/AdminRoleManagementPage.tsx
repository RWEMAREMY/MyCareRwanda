import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'

type SessionUser = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
}

type ManagedUser = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  createdAt: string
  updatedAt: string
}

const roleOptions = ['admin', 'client', 'hospital-caretaker', 'children-caretaker'] as const

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

function AdminRoleManagementPage() {
  const navigate = useNavigate()
  const token = useMemo(() => getStoredToken(), [])
  const user = useMemo(() => getStoredUser(), [])
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5050', [])

  const [userSearch, setUserSearch] = useState('')
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [pendingRoleByUserId, setPendingRoleByUserId] = useState<Record<string, string>>({})
  const [updatingUserId, setUpdatingUserId] = useState('')

  if (!token) return <Navigate to="/auth?tab=login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/auth?tab=login', { replace: true })
  }

  const loadUsers = async (query: string) => {
    setIsUsersLoading(true)
    setUsersError('')

    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())

      const response = await fetch(`${apiBaseUrl}/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const payload = await response.json()

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setUsersError('Session permission changed. Please login again.')
          setTimeout(() => onLogout(), 900)
          return
        }

        setUsersError(payload?.message || 'Unable to fetch users.')
        return
      }

      const rows = (payload?.data || []) as ManagedUser[]
      setManagedUsers(rows)
      setPendingRoleByUserId((prev) => {
        const next: Record<string, string> = { ...prev }
        for (const row of rows) {
          if (!next[row.id]) next[row.id] = row.role
        }
        return next
      })
    } catch {
      setUsersError('Unable to connect to server.')
    } finally {
      setIsUsersLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadUsers(userSearch)
    }, 250)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch])

  const onRoleChange = async (targetUserId: string) => {
    const nextRole = pendingRoleByUserId[targetUserId]
    if (!nextRole) return

    setUpdatingUserId(targetUserId)
    setUsersError('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/users/${targetUserId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      })

      const payload = await response.json()

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setUsersError('Session permission changed. Please login again.')
          setTimeout(() => onLogout(), 900)
          return
        }

        setUsersError(payload?.message || 'Unable to update role.')
        return
      }

      const updated = payload?.data as ManagedUser

      setManagedUsers((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? {
                ...item,
                role: updated.role,
                updatedAt: updated.updatedAt,
              }
            : item,
        ),
      )

      if (updated.id === user?.id) {
        const currentRaw = localStorage.getItem('user')
        if (currentRaw) {
          try {
            const current = JSON.parse(currentRaw) as SessionUser
            localStorage.setItem('user', JSON.stringify({ ...current, role: updated.role }))
          } catch {
            // no-op
          }
        }
      }
    } catch {
      setUsersError('Unable to connect to server.')
    } finally {
      setUpdatingUserId('')
    }
  }

  return (
    <DashboardShell subtitle="Admin Role Management" roleLabel="Admin" onLogout={onLogout}>
      <section className="dashboard-admin-page">
        <article className="dashboard-card dashboard-card--full">
          <h3>Role Management Table</h3>
          <p className="auth-helper">Search the full user directory and apply role changes instantly.</p>
          <div className="dashboard-admin-toolbar">
            <input
              className="auth-input"
              type="search"
              value={userSearch}
              placeholder="Search by name, email, phone, or role"
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </div>
          {usersError ? <p className="auth-notice auth-notice--error">{usersError}</p> : null}
          <div className="dashboard-admin-table-wrap" aria-live="polite">
            <table className="dashboard-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Current Role</th>
                  <th>Change To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isUsersLoading ? (
                  <tr>
                    <td colSpan={6}>Loading users...</td>
                  </tr>
                ) : null}
                {!isUsersLoading && managedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No users found for this search.</td>
                  </tr>
                ) : null}
                {!isUsersLoading
                  ? managedUsers.map((managedUser) => (
                      <tr key={managedUser.id}>
                        <td>{managedUser.fullName}</td>
                        <td>{managedUser.email}</td>
                        <td>{managedUser.phoneNumber}</td>
                        <td>{managedUser.role}</td>
                        <td>
                          <select
                            value={pendingRoleByUserId[managedUser.id] || managedUser.role}
                            onChange={(event) =>
                              setPendingRoleByUserId((prev) => ({
                                ...prev,
                                [managedUser.id]: event.target.value,
                              }))
                            }
                          >
                            {roleOptions.map((roleValue) => (
                              <option key={roleValue} value={roleValue}>
                                {roleValue}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            type="button"
                            disabled={updatingUserId === managedUser.id}
                            onClick={() => void onRoleChange(managedUser.id)}
                          >
                            {updatingUserId === managedUser.id ? 'Updating...' : 'Apply'}
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </DashboardShell>
  )
}

export default AdminRoleManagementPage
