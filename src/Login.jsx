import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { supabase } from './lib/supabase'

const BLUE = '#1a73e8'
const BLUE_HOVER = '#1557b0'
const TEXT = '#202124'
const TEXT_SEC = '#5f6368'
const BORDER = '#dadce0'
const ERROR = '#d93025'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap');

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .gl-page {
    min-height: 100vh;
    background: #f1f3f4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Roboto', sans-serif;
    padding: 24px 16px;
    width: 100%;
  }

  .gl-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
    width: 100%;
    max-width: 400px;
    padding: 48px 40px 36px;
    animation: fadeIn 0.35s ease both;
  }

  @media (max-width: 480px) {
    .gl-card {
      padding: 40px 24px 28px;
      box-shadow: none;
      border: 1px solid ${BORDER};
    }
  }

  /* Logo + heading */
  .gl-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .gl-logo {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .gl-title {
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 24px;
    font-weight: 400;
    color: ${TEXT};
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .gl-subtitle {
    font-size: 14px;
    color: ${TEXT_SEC};
    line-height: 1.5;
  }

  .gl-subtitle strong {
    color: ${TEXT};
    font-weight: 500;
  }

  /* Inputs — Material outlined style */
  .gl-field {
    position: relative;
    margin-bottom: 24px;
  }

  .gl-input {
    width: 100%;
    padding: 13px 14px;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    color: ${TEXT};
    background: #fff;
    border: 1px solid ${BORDER};
    border-radius: 4px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none;
  }

  .gl-input:focus {
    border-color: ${BLUE};
    box-shadow: inset 0 0 0 1px ${BLUE};
  }

  .gl-input.gl-error {
    border-color: ${ERROR};
    box-shadow: inset 0 0 0 1px ${ERROR};
  }

  .gl-input::placeholder {
    color: #bdc1c6;
  }

  .gl-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${TEXT_SEC};
    margin-bottom: 6px;
  }

  /* Password wrapper — show/hide toggle */
  .gl-pw-wrap {
    position: relative;
  }

  .gl-pw-wrap .gl-input {
    padding-right: 44px;
  }

  .gl-pw-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: ${TEXT_SEC};
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    transition: background 0.15s;
  }

  .gl-pw-toggle:hover {
    background: rgba(0,0,0,0.06);
  }

  /* Forgot password */
  .gl-forgot {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    font-weight: 500;
    color: ${BLUE};
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    text-align: right;
    width: 100%;
    transition: color 0.15s;
  }

  .gl-forgot:hover { color: ${BLUE_HOVER}; }

  /* Alerts */
  .gl-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .gl-alert.error {
    background: #fce8e6;
    color: #c5221f;
  }

  .gl-alert.success {
    background: #e6f4ea;
    color: #137333;
  }

  /* Primary button */
  .gl-btn-primary {
    width: 100%;
    padding: 10px 24px;
    background: ${BLUE};
    color: #fff;
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.01em;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
  }

  .gl-btn-primary:hover:not(:disabled) {
    background: ${BLUE_HOVER};
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .gl-btn-primary:disabled {
    background: #f1f3f4;
    color: #bdc1c6;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Divider */
  .gl-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }

  .gl-divider-line {
    flex: 1;
    height: 1px;
    background: ${BORDER};
  }

  .gl-divider-text {
    font-size: 12px;
    color: ${TEXT_SEC};
    letter-spacing: 0.03em;
  }

  /* Google OAuth button */
  .gl-btn-google {
    width: 100%;
    padding: 10px 16px;
    background: #fff;
    color: ${TEXT};
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid ${BORDER};
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.15s, box-shadow 0.15s;
    min-height: 40px;
  }

  .gl-btn-google:hover:not(:disabled) {
    background: #f8f9fa;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }

  .gl-btn-google:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Footer row — create account / back link */
  .gl-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 28px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .gl-link {
    font-size: 14px;
    font-weight: 500;
    color: ${BLUE};
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 0;
    font-family: 'Roboto', sans-serif;
    text-decoration: none;
    transition: color 0.15s;
  }

  .gl-link:hover { color: ${BLUE_HOVER}; }

  /* Spinner */
  .gl-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
    flex-shrink: 0;
  }

  .gl-spinner.dark {
    border-color: rgba(0,0,0,0.12);
    border-top-color: ${TEXT_SEC};
  }

  /* Page footer */
  .gl-page-footer {
    margin-top: 24px;
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .gl-page-footer a {
    font-size: 12px;
    color: ${TEXT_SEC};
    text-decoration: none;
    transition: color 0.15s;
  }

  .gl-page-footer a:hover { color: ${TEXT}; }
`

// Eye / Eye-off SVGs
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function AlertBanner({ error, success }) {
  if (error) return (
    <div className="gl-alert error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {error}
    </div>
  )
  if (success) return (
    <div className="gl-alert success">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {success}
    </div>
  )
  return null
}

AlertBanner.propTypes = {
  error: PropTypes.string,
  success: PropTypes.string,
}

function OAuthSection({ loading, onGoogle }) {
  return (
    <>
      <div className="gl-divider">
        <div className="gl-divider-line" />
        <span className="gl-divider-text">or</span>
        <div className="gl-divider-line" />
      </div>
      <button type="button" className="gl-btn-google" onClick={onGoogle} disabled={loading}>
        {loading
          ? <span className="gl-spinner dark" />
          : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )
        }
        Continue with Google
      </button>
    </>
  )
}

OAuthSection.propTypes = {
  loading: PropTypes.bool.isRequired,
  onGoogle: PropTypes.func.isRequired,
}

function CardFooterLinks({ mode, setMode }) {
  if (mode === 'signin') return (
    <button type="button" className="gl-link" onClick={() => setMode('signup')}>
      Create account
    </button>
  )
  if (mode === 'signup') return (
    <button type="button" className="gl-link" onClick={() => setMode('signin')}>
      Sign in instead
    </button>
  )
  return (
    <button type="button" className="gl-link" onClick={() => setMode('signin')}>
      ← Back to sign in
    </button>
  )
}

CardFooterLinks.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
}

function getBtnLabel(mode, loading) {
  if (mode === 'reset') return loading ? 'Sending…' : 'Send reset link'
  if (mode === 'signup') return loading ? 'Creating…' : 'Create account'
  return loading ? 'Signing in…' : 'Sign in'
}

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setError('')
    setSuccess('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirm(false)
  }, [mode])

  async function handleReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${globalThis.location.origin}/welcome`,
    })
    if (error) throw error
    setSuccess('Check your email for a password reset link.')
  }

  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function handleSignUp() {
    if (password !== confirmPassword) throw new Error('Passwords do not match.')
    if (password.length < 6) throw new Error('Password must be at least 6 characters.')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    setSuccess('Account created! Check your email to verify your address.')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'reset') await handleReset()
      else if (mode === 'signin') await handleSignIn()
      else await handleSignUp()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${globalThis.location.origin}/welcome` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const isValid = email.trim().length > 0 &&
    (mode === 'reset' || password.length > 0) &&
    (mode !== 'signup' || confirmPassword.length > 0)

  const titles = {
    signin: 'Sign in',
    signup: 'Create account',
    reset: 'Reset password',
  }

  const subtitles = {
    signin: <>to continue to <strong>TradieCheck</strong></>,
    signup: <>to get started with <strong>TradieCheck</strong></>,
    reset: <>We'll send a link to your email</>,
  }

  const btnLabel = getBtnLabel(mode, loading)

  return (
    <>
      <style>{styles}</style>
      <div className="gl-page">
        <div className="gl-card">

          {/* Logo + title */}
          <div className="gl-header">
            <div className="gl-logo">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="6" />
                <path d="m21 21-4.5-4.5" />
                <path d="M7.5 10l2 2 3-3" />
              </svg>
            </div>
            <h1 className="gl-title">{titles[mode]}</h1>
            <p className="gl-subtitle">{subtitles[mode]}</p>
          </div>

          <AlertBanner error={error} success={success} />

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="gl-field">
              <label className="gl-label" htmlFor="gl-email">Email address</label>
              <input
                id="gl-email"
                className={`gl-input${error && !email ? ' gl-error' : ''}`}
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {/* Password */}
            {mode !== 'reset' && (
              <div className="gl-field">
                <label className="gl-label" htmlFor="gl-password">Password</label>
                <div className="gl-pw-wrap">
                  <input
                    id="gl-password"
                    className={`gl-input${error && !password ? ' gl-error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                  />
                  <button type="button" className="gl-pw-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {mode === 'signin' && (
                  <button type="button" className="gl-forgot" onClick={() => setMode('reset')}>
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Confirm password */}
            {mode === 'signup' && (
              <div className="gl-field">
                <label className="gl-label" htmlFor="gl-confirm">Confirm password</label>
                <div className="gl-pw-wrap">
                  <input
                    id="gl-confirm"
                    className={`gl-input${error && confirmPassword !== password ? ' gl-error' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="gl-pw-toggle" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button className="gl-btn-primary" type="submit" disabled={loading || !isValid}>
              {loading && <span className="gl-spinner" />}
              {btnLabel}
            </button>
          </form>

          {mode !== 'reset' && (
            <OAuthSection loading={loading} onGoogle={handleGoogleSignIn} />
          )}

          {/* Card footer links */}
          <div className="gl-card-footer">
            <CardFooterLinks mode={mode} setMode={setMode} />
          </div>
        </div>

        {/* Page-level footer */}
        <div className="gl-page-footer">
          <button type="button" className="gl-link" style={{ fontSize: '12px', fontWeight: 400, color: '#5f6368' }}>Privacy</button>
          <button type="button" className="gl-link" style={{ fontSize: '12px', fontWeight: 400, color: '#5f6368' }}>Terms</button>
          <a href="/help" className="gl-link" style={{ fontSize: '12px', fontWeight: 400, color: '#5f6368' }}>Help</a>
        </div>
      </div>
    </>
  )
}
