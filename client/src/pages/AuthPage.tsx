import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

type NoticeType = 'success' | 'error' | 'info'
type FieldErrors = Record<string, string>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(?:\+?250|0)7(?:2|3|8|9)\d{7}$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/

function AuthPage() {
  const navigate = useNavigate()
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5050', [])
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
  const [notice, setNotice] = useState<{ type: NoticeType; text: string } | null>(null)

  const [loginErrors, setLoginErrors] = useState<FieldErrors>({})
  const [registerErrors, setRegisterErrors] = useState<FieldErrors>({})

  const registerEmailValid = registerEmail.length > 0 && EMAIL_REGEX.test(registerEmail.trim())
  const registerPhoneValid = registerPhoneNumber.length > 0 && PHONE_REGEX.test(registerPhoneNumber.trim())
  const registerPasswordValid =
    registerPassword.length > 0 && PASSWORD_REGEX.test(registerPassword.trim())
  const registerConfirmValid =
    registerConfirmPassword.length > 0 && registerPassword === registerConfirmPassword

  useEffect(() => {
    const hydrateSession = async () => {
      const authToken = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!authToken) return

      try {
        const parsedToken = JSON.parse(authToken)
        const tokenValue = parsedToken?.accessToken || parsedToken
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${tokenValue}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem('token')
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          return
        }

        const data = await response.json()
        if (data?.data) {
          localStorage.setItem('user', JSON.stringify(data.data))
          navigate('/dashboard', { replace: true })
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }

    void hydrateSession()
  }, [apiBaseUrl, navigate])

  useEffect(() => {
    if (registerEmail.length === 0) return
    setRegisterErrors((prev) => ({
      ...prev,
      email: EMAIL_REGEX.test(registerEmail.trim()) ? '' : 'Enter a valid email address.',
    }))
  }, [registerEmail])

  useEffect(() => {
    if (registerPhoneNumber.length === 0) return
    setRegisterErrors((prev) => ({
      ...prev,
      phoneNumber: PHONE_REGEX.test(registerPhoneNumber.trim())
        ? ''
        : '072/073/078/079 / +25072/+25073/+25078/+25079.',
    }))
  }, [registerPhoneNumber])

  useEffect(() => {
    if (registerPassword.length === 0) return
    setRegisterErrors((prev) => ({
      ...prev,
      password: PASSWORD_REGEX.test(registerPassword.trim())
        ? ''
        : 'Use 8-72 chars with at least one letter and one number.',
    }))
  }, [registerPassword])

  useEffect(() => {
    if (registerConfirmPassword.length === 0) return
    setRegisterErrors((prev) => ({
      ...prev,
      confirmPassword:
        registerPassword === registerConfirmPassword ? '' : 'Passwords do not match.',
    }))
  }, [registerPassword, registerConfirmPassword])

  const inputClassName = (isError: boolean, isSuccess: boolean) => {
    if (isError) return 'auth-input auth-input--error'
    if (isSuccess) return 'auth-input auth-input--success'
    return 'auth-input'
  }

  const onLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setLoginErrors({})

    const nextErrors: FieldErrors = {}
    if (!loginIdentifier.trim()) nextErrors.identifier = 'Provide your email or phone number.'
    if (!loginPassword.trim()) nextErrors.password = 'Password is required.'

    if (Object.keys(nextErrors).length > 0) {
      setLoginErrors(nextErrors)
      toast.error('Please fix the highlighted login fields.')
      setIsSubmitting(false)
      return
    }

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
        const serverFieldErrors = (data?.fieldErrors || {}) as FieldErrors
        setLoginErrors(serverFieldErrors)
        toast.error(data?.message || 'Login failed.')
        return
      }

      const token = data?.data?.token || data?.token
      const user = data?.data?.user || data?.user
      if (token) {
        localStorage.setItem('token', JSON.stringify(token))
        localStorage.setItem('authToken', token.accessToken || token)
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      toast.success(data?.message || 'Login successful.')
      setLoginPassword('')
      navigate('/dashboard')
    } catch {
      toast.error('Unable to connect to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setNotice(null)

    const nextErrors: FieldErrors = {}
    if (!registerFullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!registerEmail.trim()) nextErrors.email = 'Email is required.'
    else if (!EMAIL_REGEX.test(registerEmail.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!registerPhoneNumber.trim()) nextErrors.phoneNumber = 'Phone number is required.'
    else if (!PHONE_REGEX.test(registerPhoneNumber.trim())) {
      nextErrors.phoneNumber = 'Use Rwanda prefixes 072/073/078/079 or +25072/+25073/+25078/+25079.'
    }
    if (!registerPassword.trim()) nextErrors.password = 'Password is required.'
    else if (!PASSWORD_REGEX.test(registerPassword.trim())) {
      nextErrors.password = 'Use 8-72 chars with at least one letter and one number.'
    }
    if (!registerConfirmPassword.trim()) nextErrors.confirmPassword = 'Please re-type your password.'
    else if (registerPassword !== registerConfirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setRegisterErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setNotice({ type: 'error', text: 'Please fix the highlighted registration fields.' })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: registerFullName.trim(),
          email: registerEmail.trim(),
          phoneNumber: registerPhoneNumber.trim(),
          password: registerPassword,
          confirmPassword: registerConfirmPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const serverFieldErrors = (data?.fieldErrors || {}) as FieldErrors
        setRegisterErrors((prev) => ({ ...prev, ...serverFieldErrors }))
        setNotice({ type: 'error', text: data?.message || 'Registration failed.' })
        return
      }

      localStorage.removeItem('token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setNotice({
        type: 'success',
        text: `${data?.message || 'Registration successful.'} Please sign in.`,
      })
      setRegisterPassword('')
      setRegisterConfirmPassword('')
      setRegisterEmail('')
      setRegisterPhoneNumber('')
      setRegisterFullName('')
      setRegisterErrors({})
      setActiveTab('login')
    } catch {
      setNotice({ type: 'error', text: 'Unable to connect to server.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onGoogleLogin = async () => {
    setIsSubmitting(true)
    setNotice(null)
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/google`, { method: 'POST' })
      const data = await response.json()
      setNotice({ type: 'info', text: data.message || 'Google login clicked.' })
    } catch {
      setNotice({ type: 'error', text: 'Unable to connect to server.' })
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
                <form className="auth-form auth-form--login" onSubmit={onLoginSubmit}>
                  <h2>Sign In</h2>
                  <p className="auth-helper">Use your email or phone number and password</p>
                  <label>
                    Email or phone number
                    <input
                      className={inputClassName(Boolean(loginErrors.identifier), loginIdentifier.length > 0)}
                      type="text"
                      value={loginIdentifier}
                      onChange={(event) => {
                        setLoginIdentifier(event.target.value)
                        setLoginErrors((prev) => ({ ...prev, identifier: '' }))
                      }}
                      placeholder="admin@mycarerwanda.com or 0788xxxxxx"
                      required
                    />
                    {loginErrors.identifier ? <span className="field-error">{loginErrors.identifier}</span> : null}
                  </label>
                  <label>
                    Password
                    <input
                      className={inputClassName(Boolean(loginErrors.password), loginPassword.length > 0)}
                      type="password"
                      value={loginPassword}
                      onChange={(event) => {
                        setLoginPassword(event.target.value)
                        setLoginErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      placeholder="Enter password"
                      required
                    />
                    {loginErrors.password ? <span className="field-error">{loginErrors.password}</span> : null}
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
                <form className="auth-form auth-form--register" onSubmit={onRegisterSubmit}>
                  <h2>Register</h2>
                  <p className="auth-helper">Create your account</p>
                  <label>
                    Full name
                    <input
                      className={inputClassName(Boolean(registerErrors.fullName), registerFullName.length > 0)}
                      type="text"
                      value={registerFullName}
                      onChange={(event) => {
                        setRegisterFullName(event.target.value)
                        setRegisterErrors((prev) => ({ ...prev, fullName: '' }))
                      }}
                      placeholder="Your full name"
                      required
                    />
                    {registerErrors.fullName ? <span className="field-error">{registerErrors.fullName}</span> : null}
                    {!registerErrors.fullName && registerFullName.length > 3 ? (
                      <span className="field-success" aria-label="Valid full name" title="Valid full name">
                        ✓
                      </span>
                    ) : null}
                  </label>
                  <label>
                    Email
                    <input
                      className={inputClassName(Boolean(registerErrors.email), registerEmailValid)}
                      type="email"
                      value={registerEmail}
                      onChange={(event) => {
                        setRegisterEmail(event.target.value)
                        setRegisterErrors((prev) => ({ ...prev, email: '' }))
                      }}
                      placeholder="you@example.com"
                      required
                    />
                    {registerErrors.email ? <span className="field-error">{registerErrors.email}</span> : null}
                    {!registerErrors.email && registerEmailValid ? (
                       <span className="field-success" aria-label="Valid email" title="Valid email">
                       ✓
                     </span>
                    ) : null}
                  </label>
                  <label>
                    Phone number
                    <input
                      className={inputClassName(Boolean(registerErrors.phoneNumber), registerPhoneValid)}
                      type="tel"
                      value={registerPhoneNumber}
                      onChange={(event) => {
                        setRegisterPhoneNumber(event.target.value)
                        setRegisterErrors((prev) => ({ ...prev, phoneNumber: '' }))
                      }}
                      placeholder="0788xxxxxx"
                      required
                    />
                    {registerErrors.phoneNumber ? (
                      <span className="field-error">{registerErrors.phoneNumber}</span>
                    ) : null}
                    {!registerErrors.phoneNumber && registerPhoneValid ? (
                        <span className="field-success" aria-label="Valid email" title="Valid email">
                        ✓
                      </span>
                    ) : null}
                  </label>
                  <label>
                    Password
                    <input
                      className={inputClassName(Boolean(registerErrors.password), registerPasswordValid)}
                      type="password"
                      value={registerPassword}
                      onChange={(event) => {
                        setRegisterPassword(event.target.value)
                        setRegisterErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      placeholder="8+ chars with letters and numbers"
                      minLength={8}
                      required
                    />
                    {registerErrors.password ? <span className="field-error">{registerErrors.password}</span> : null}
                    {!registerErrors.password && registerPasswordValid ? (
                         <span className="field-success" aria-label="Valid email" title="Valid email">
                         ✓
                       </span>
                    ) : null}
                  </label>
                  <label>
                    Re-type password
                    <input
                      className={inputClassName(Boolean(registerErrors.confirmPassword), registerConfirmValid)}
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(event) => {
                        setRegisterConfirmPassword(event.target.value)
                        setRegisterErrors((prev) => ({ ...prev, confirmPassword: '' }))
                      }}
                      placeholder="Type password again"
                      minLength={8}
                      required
                    />
                    {registerErrors.confirmPassword ? (
                      <span className="field-error">{registerErrors.confirmPassword}</span>
                    ) : null}
                    {!registerErrors.confirmPassword && registerConfirmValid ? (
                      <span className="field-success">Passwords match.</span>
                    ) : null}
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

          {notice ? <p className={`auth-notice auth-notice--${notice.type}`}>{notice.text}</p> : null}
        </section>
      </main>
    </div>
  )
}

export default AuthPage
