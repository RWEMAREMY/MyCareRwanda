import { FormEvent, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import DashboardShell from '../components/DashboardShell'

type SessionUser = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
}

type FieldErrors = Record<string, string>

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/

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

function ChangePasswordPage() {
  const navigate = useNavigate()
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5050', [])
  const token = useMemo(() => getStoredToken(), [])
  const user = useMemo(() => getStoredUser(), [])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  if (!token) return <Navigate to="/auth?tab=login" replace />

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/auth?tab=login', { replace: true })
  }

  const roleLabel = getRoleLabel(user?.role || 'client')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const nextErrors: FieldErrors = {}
    if (!currentPassword.trim()) nextErrors.currentPassword = 'Current password is required.'
    if (!newPassword.trim()) nextErrors.newPassword = 'New password is required.'
    else if (!PASSWORD_REGEX.test(newPassword.trim())) {
      nextErrors.newPassword = 'Use 8-72 chars with at least one letter and one number.'
    }
    if (!confirmPassword.trim()) nextErrors.confirmPassword = 'Please re-type your new password.'
    else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'New password and confirmation do not match.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Please fix the highlighted fields.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const fieldErrors = (data?.fieldErrors || {}) as FieldErrors
        setErrors(fieldErrors)
        toast.error(data?.message || 'Unable to change password.')
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success(data?.message || 'Password changed successfully.')
      navigate('/dashboard#security')
    } catch {
      toast.error('Unable to connect to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell subtitle={`${roleLabel} Dashboard`} roleLabel={roleLabel} onLogout={onLogout}>
      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-card--full">
          <h3>Change Password</h3>
          <p className="auth-helper">Update your account password from Security & Privacy.</p>

          <form className="dashboard-password-form" onSubmit={onSubmit}>
            <label className="auth-label">
              Current password
              <input
                className="auth-input"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter current password"
              />
              {errors.currentPassword ? <span className="field-error">{errors.currentPassword}</span> : null}
            </label>

            <label className="auth-label">
              New password
              <input
                className="auth-input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Enter new password"
              />
              {errors.newPassword ? <span className="field-error">{errors.newPassword}</span> : null}
            </label>

            <label className="auth-label">
              Confirm new password
              <input
                className="auth-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Re-type new password"
              />
              {errors.confirmPassword ? <span className="field-error">{errors.confirmPassword}</span> : null}
            </label>

            <div className="dashboard-actions">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save New Password'}
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => navigate('/dashboard#security')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </article>
      </div>
    </DashboardShell>
  )
}

export default ChangePasswordPage
