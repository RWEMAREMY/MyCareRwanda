import { FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function AuthPage() {
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000', [])
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerFullName, setRegisterFullName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<{
    id: string
    fullName: string
    email: string
    phoneNumber: string
    role: string
  } | null>(null)

  const onLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginIdentifier.includes('@') ? loginIdentifier.trim() : undefined,
          phoneNumber: loginIdentifier.includes('@') ? undefined : loginIdentifier.trim(),
          password: loginPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const validationMessage =
          Array.isArray(data.errors) && data.errors.length > 0
            ? `${data.message || 'Login failed.'} ${data.errors.join(' ')}`
            : data.message || 'Login failed.'
        setMessage(validationMessage)
        return
      }

      setCurrentUser(data.user || null)
      if (data.token?.accessToken) {
        localStorage.setItem('authToken', data.token.accessToken)
      }
      setMessage(data.message || 'Login successful.')
      setLoginPassword('')
    } catch {
      setMessage('Unable to connect to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: registerFullName,
          email: registerEmail,
          phoneNumber: registerPhoneNumber,
          password: registerPassword,
          confirmPassword: registerConfirmPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const validationMessage =
          Array.isArray(data.errors) && data.errors.length > 0
            ? `${data.message || 'Registration failed.'} ${data.errors.join(' ')}`
            : data.message || 'Registration failed.'
        setMessage(validationMessage)
        return
      }

      localStorage.removeItem('authToken')
      setCurrentUser(null)
      setMessage(`${data.message || 'Registration successful.'} Your account was created. Please sign in.`)
      setRegisterPassword('')
      setRegisterConfirmPassword('')
      setRegisterEmail('')
      setActiveTab('login')
    } catch {
      setMessage('Unable to connect to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onGoogleLogin = async () => {
    setIsSubmitting(true)
    setMessage('')
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/google`, { method: 'POST' })
      const data = await response.json()
      setMessage(data.message || 'Google login clicked.')
    } catch {
      setMessage('Unable to connect to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const panelClass =
    activeTab === 'register' ? 'auth-swap-card auth-swap-card--register' : 'auth-swap-card'

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
              <p className="logo-sub auth-logo-sub">Account access</p>
            </div>
          </div>
          <Link className="btn btn-outline" to="/">
            Back to home
          </Link>
        </header>

        <section className="section auth-section">
          <div className={panelClass}>
            <div className="auth-form-side">
              {activeTab === 'login' ? (
                <form className="auth-form" onSubmit={onLoginSubmit}>
                  <h2>Sign In</h2>
                  <p className="auth-helper">Use your email or phone number and password</p>
                  <label>
                    Email or phone number
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(event) => setLoginIdentifier(event.target.value)}
                      placeholder="admin@mycarerwanda.com or 0788xxxxxx"
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </label>
                  <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Please wait...' : 'Sign in'}
                  </button>
                  <button
                    className="btn btn-google"
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={isSubmitting}
                  >
                    Continue with Google
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={onRegisterSubmit}>
                  <h2>Register</h2>
                  <p className="auth-helper">Create your account</p>
                  <label>
                    Full name
                    <input
                      type="text"
                      value={registerFullName}
                      onChange={(event) => setRegisterFullName(event.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      type="tel"
                      value={registerPhoneNumber}
                      onChange={(event) => setRegisterPhoneNumber(event.target.value)}
                      placeholder="0788xxxxxx"
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      placeholder="8+ chars with letters and numbers"
                      minLength={8}
                      required
                    />
                  </label>
                  <label>
                    Re-type password
                    <input
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                      placeholder="Type password again"
                      minLength={8}
                      required
                    />
                  </label>
                  <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Please wait...' : 'Create account'}
                  </button>
                </form>
              )}
            </div>

            <aside className="auth-promo-side">
              {activeTab === 'login' ? (
                <>
                  <h3>Hello there</h3>
                  <p>New to MyCareRwanda? Create your account now.</p>
                  <button className="btn btn-promo" type="button" onClick={() => setActiveTab('register')}>
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  <h3>Welcome back</h3>
                  <p>Already have an account? Sign in quickly.</p>
                  <button className="btn btn-promo" type="button" onClick={() => setActiveTab('login')}>
                    Sign in
                  </button>
                </>
              )}
            </aside>
          </div>

          {message ? <p className="auth-message">{message}</p> : null}
          {currentUser ? (
            <p className="auth-current-user">
              Logged in as <strong>{currentUser.fullName}</strong> ({currentUser.role})
            </p>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default AuthPage
