import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import myCareLogo from '../assets/mycare-logo.png'

type FieldErrors = Record<string, string>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5050', [])
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const requestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    const nextErrors: FieldErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    else if (!EMAIL_REGEX.test(email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()
      if (!response.ok) {
        setErrors((data?.fieldErrors || {}) as FieldErrors)
        toast.error(data?.message || 'Unable to send OTP.')
        return
      }

      setOtpRequested(true)
      toast.success(data?.message || 'OTP sent.')
    } catch {
      toast.error('Unable to connect to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    const nextErrors: FieldErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (!otp.trim()) nextErrors.otp = 'OTP code is required.'
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
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setErrors((data?.fieldErrors || {}) as FieldErrors)
        toast.error(data?.message || 'Unable to reset password.')
        return
      }
      toast.success(data?.message || 'Password reset successful.')
      navigate('/auth?tab=login')
    } catch {
      toast.error('Unable to connect to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <main className="auth-page-main">
        <header className="topbar auth-topbar">
          <div className="logo-wrap">
            <img className="logo-image" src={myCareLogo} alt="MyCare Rwanda logo" />
            <div>
              <p className="logo-text auth-logo-text">MyCare Rwanda</p>
              <p className="logo-sub auth-logo-sub">Password reset</p>
            </div>
          </div>
          <div className="nav-cta">
            <Link className="btn btn-outline" to="/auth?tab=login">
              Back to sign in
            </Link>
          </div>
        </header>

        <section className="section auth-section">
          <div className="auth-swap-card">
            <div className="auth-form-side">
              <form className="auth-form auth-form--login" onSubmit={otpRequested ? resetPassword : requestOtp}>
                <h2>Forgot Password</h2>
                <p className="auth-helper">
                  Enter your email, receive OTP, and set a new password.
                </p>
                <label>
                  Email
                  <input
                    className="auth-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  {errors.email ? <span className="field-error">{errors.email}</span> : null}
                </label>

                {otpRequested ? (
                  <>
                    <label>
                      OTP code
                      <input
                        className="auth-input"
                        type="text"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                        placeholder="Enter 6-digit OTP"
                        required
                      />
                      {errors.otp ? <span className="field-error">{errors.otp}</span> : null}
                    </label>
                    <label>
                      New password
                      <input
                        className="auth-input"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="8+ chars with letters and numbers"
                        required
                      />
                      {errors.newPassword ? <span className="field-error">{errors.newPassword}</span> : null}
                    </label>
                    <label>
                      Confirm new password
                      <input
                        className="auth-input"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Re-type new password"
                        required
                      />
                      {errors.confirmPassword ? <span className="field-error">{errors.confirmPassword}</span> : null}
                    </label>
                  </>
                ) : null}

                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Please wait...'
                    : otpRequested
                      ? 'Reset Password'
                      : 'Send OTP'}
                </button>
                {otpRequested ? (
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => setOtpRequested(false)}
                    disabled={isSubmitting}
                  >
                    Change Email
                  </button>
                ) : null}
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ForgotPasswordPage
