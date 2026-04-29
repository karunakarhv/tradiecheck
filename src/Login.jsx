import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { supabase } from './lib/supabase'

const NAVY = '#0a192f'
const ORANGE = '#ff6b00'
const ORANGE_HOVER = '#e66000'
const TEXT = '#1f2937'
const TEXT_SEC = '#6b7280'
const BORDER = '#e5e7eb'
const ERROR = '#ef4444'
const SUCCESS = '#10b981'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .login-container {
    display: flex;
    min-height: 100dvh;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #ffffff;
    color: ${TEXT};
  }

  /* Left Form Area */
  .login-form-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px;
    max-width: 640px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }

  .login-header {
    margin-bottom: 40px;
    animation: fadeIn 0.4s ease forwards;
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    text-decoration: none;
  }
  
  .login-logo-icon {
    width: 42px;
    height: 42px;
    background: ${NAVY};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(10,25,47,0.2);
  }

  .login-logo-text {
    font-size: 26px;
    font-weight: 800;
    color: ${NAVY};
    letter-spacing: -0.03em;
  }
  
  .login-logo-accent {
    color: ${ORANGE};
  }

  .login-title {
    font-size: 32px;
    font-weight: 800;
    color: ${NAVY};
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }

  .login-subtitle {
    font-size: 15px;
    color: ${TEXT_SEC};
    line-height: 1.5;
  }

  /* Input fields */
  .form-group {
    margin-bottom: 20px;
    animation: fadeIn 0.4s ease forwards;
    opacity: 0;
  }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.15s; }
  .delay-3 { animation-delay: 0.2s; }
  .delay-4 { animation-delay: 0.25s; }
  .delay-5 { animation-delay: 0.3s; }

  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: ${NAVY};
    margin-bottom: 8px;
  }

  .form-input-wrap {
    position: relative;
  }

  .form-input {
    width: 100%;
    padding: 14px 16px;
    font-family: inherit;
    font-size: 15px;
    color: ${TEXT};
    background: #f8fafc;
    border: 1.5px solid ${BORDER};
    border-radius: 10px;
    outline: none;
    transition: all 0.2s;
  }

  .form-input:focus {
    background: #fff;
    border-color: ${ORANGE};
    box-shadow: 0 0 0 4px rgba(255,107,0,0.1);
  }

  .form-input.is-invalid {
    border-color: ${ERROR};
    background: #fef2f2;
    padding-right: 40px;
  }

  .form-input.is-valid {
    border-color: ${SUCCESS};
    padding-right: 40px;
  }

  .validation-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Toggle Password */
  .pw-toggle {
    position: absolute;
    right: ${props => props.hasValidation ? '40px' : '14px'};
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${TEXT_SEC};
    cursor: pointer;
    display: flex;
    transition: color 0.2s;
  }
  .pw-toggle:hover { color: ${NAVY}; }
  
  .pw-input { padding-right: 44px; }

  /* Password Strength */
  .pw-strength {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }
  .pw-bar {
    height: 4px;
    flex: 1;
    border-radius: 2px;
    background: ${BORDER};
    transition: background 0.3s;
  }
  .pw-text {
    font-size: 12px;
    font-weight: 600;
    margin-top: 6px;
    text-align: right;
  }

  /* Primary Button */
  .btn-primary {
    width: 100%;
    background: ${ORANGE};
    color: #fff;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    padding: 14px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    box-shadow: 0 4px 14px rgba(255,107,0,0.25);
  }

  .btn-primary:hover:not(:disabled) {
    background: ${ORANGE_HOVER};
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255,107,0,0.3);
  }

  .btn-primary:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  /* Social Auth */
  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 24px 0;
    color: ${TEXT_SEC};
    font-size: 13px;
    font-weight: 600;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${BORDER};
  }
  .divider::before { margin-right: 16px; }
  .divider::after { margin-left: 16px; }

  .btn-google {
    width: 100%;
    background: #fff;
    color: ${NAVY};
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    padding: 14px;
    border: 1.5px solid ${BORDER};
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
  .btn-google:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  /* Footer Links */
  .form-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 32px;
    font-size: 14px;
    color: ${TEXT_SEC};
  }
  .link-btn {
    background: none;
    border: none;
    color: ${NAVY};
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: color 0.2s;
    margin-left: 6px;
  }
  .link-btn:hover { color: ${ORANGE}; }

  .forgot-btn {
    font-size: 13px;
    color: ${NAVY};
    font-weight: 600;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    margin-top: 8px;
    display: inline-block;
    transition: color 0.2s;
  }
  .forgot-btn:hover { color: ${ORANGE}; }

  /* Alerts */
  .alert-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 24px;
    animation: fadeIn 0.3s ease;
    line-height: 1.5;
  }
  .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .alert-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  
  .spinner {
    width: 20px; height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Right Side Hero */
  .login-hero {
    flex: 1.2;
    background-image: url('/hero-image.png');
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 60px;
    overflow: hidden;
  }
  
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(10, 25, 47, 0.2) 0%, rgba(10, 25, 47, 0.95) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    color: #fff;
    max-width: 500px;
    opacity: 0;
    animation: slideInRight 0.8s ease forwards;
    animation-delay: 0.3s;
  }

  .hero-tagline {
    font-size: 48px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 16px;
    letter-spacing: -0.03em;
  }
  
  .hero-tagline span {
    color: ${ORANGE};
  }

  .hero-desc {
    font-size: 18px;
    color: rgba(255,255,255,0.85);
    line-height: 1.6;
    margin-bottom: 40px;
    font-weight: 500;
  }

  /* Trust Signals */
  .trust-signals {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .trust-badge {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s;
  }
  .trust-badge:hover { transform: translateY(-2px); background: rgba(255,255,255,0.12); }

  .badge-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255,107,0,0.2);
    border: 1px solid rgba(255,107,0,0.3);
    color: ${ORANGE};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .badge-title {
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 3px;
    letter-spacing: -0.01em;
  }
  .badge-text {
    font-size: 13px;
    color: rgba(255,255,255,0.7);
    line-height: 1.4;
  }

  .review-stars {
    color: #FFB800;
    font-size: 14px;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }

  /* Responsive */
  @media (max-width: 960px) {
    .login-hero { display: none; }
    .login-form-area { padding: 40px 24px; align-items: center; }
    .login-form-wrapper { width: 100%; max-width: 420px; }
  }
`

// SVGs
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
)
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
)
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={SUCCESS} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="validation-icon"><polyline points="20 6 9 17 4 12" /></svg>
)
const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ERROR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="validation-icon"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
)
const TrustShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
)
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)

const AlertBanner = ({ error, success }) => {
  if (error) return (
    <div className="alert-banner alert-error">
      <ErrorIcon />
      <div>{error}</div>
    </div>
  )
  if (success) return (
    <div className="alert-banner alert-success">
      <CheckIcon />
      <div>{success}</div>
    </div>
  )
  return null
}
AlertBanner.propTypes = { error: PropTypes.string, success: PropTypes.string }

// Password Strength Logic
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score === 0 ? 1 : score; // minimum 1 if typed
}
const STRENGTH_COLORS = [BORDER, ERROR, '#f59e0b', SUCCESS, '#059669'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Validation States
  const emailValid = email.trim().length > 0 && /.+@.+\..+/.test(email)
  const pwStrength = getStrength(password)
  const pwMatched = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    setError(''); setSuccess(''); setEmail(''); setPassword(''); setConfirmPassword(''); setShowPassword(false);
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
    if (pwStrength < 3) throw new Error('Password is too weak. Please use a stronger password.')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    setSuccess('Account created! Check your email to verify your address.')
    setMode('signin')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${globalThis.location.origin}/welcome` },
      })
      if (error) { setError(error.message); }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const titles = { signin: 'Welcome back', signup: 'Create an account', reset: 'Reset password' }
  const subtitles = {
    signin: 'Enter your credentials to access your dashboard.',
    signup: 'Join thousands of Australians verifying tradies instantly.',
    reset: "Enter your email and we'll send you a recovery link.",
  }

  const isValidForSubmit = () => {
    if (!emailValid) return false
    if (mode === 'reset') return true
    if (mode === 'signin') return password.length > 0
    if (mode === 'signup') return pwStrength >= 3 && pwMatched
    return false
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-container">
        
        {/* LEFT: Form Section */}
        <div className="login-form-area">
          <div className="login-form-wrapper" style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
            
            <div className="login-header">
              <a href="/" className="login-logo">
                <div className="login-logo-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div className="login-logo-text">
                  Tradie<span className="login-logo-accent">Check</span>
                </div>
              </a>
              <h1 className="login-title">{titles[mode]}</h1>
              <p className="login-subtitle">{subtitles[mode]}</p>
            </div>

            <AlertBanner error={error} success={success} />

            <form onSubmit={handleSubmit} noValidate>
              
              {/* Email */}
              <div className="form-group delay-1">
                <label className="form-label">Email address</label>
                <div className="form-input-wrap">
                  <input
                    className={`form-input ${email.length > 0 ? (emailValid ? 'is-valid' : 'is-invalid') : ''}`}
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  {email.length > 0 && (emailValid ? <CheckIcon /> : <ErrorIcon />)}
                </div>
                {email.length > 0 && !emailValid && (
                  <div className="validation-message error">Please enter a valid email.</div>
                )}
              </div>

              {/* Password */}
              {mode !== 'reset' && (
                <div className="form-group delay-2">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="form-label">Password</label>
                    {mode === 'signin' && (
                      <button type="button" className="forgot-btn" onClick={() => {setMode('reset'); setError('')}}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="form-input-wrap">
                    <input
                      className="form-input pw-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      required
                    />
                    <button type="button" className="pw-toggle" style={{ right: '14px' }} onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {mode === 'signup' && password.length > 0 && (
                    <div>
                      <div className="pw-strength">
                        {[1,2,3,4].map(level => (
                          <div key={level} className="pw-bar" style={{ background: pwStrength >= level ? STRENGTH_COLORS[pwStrength] : BORDER }} />
                        ))}
                      </div>
                      <div className="pw-text" style={{ color: STRENGTH_COLORS[pwStrength] }}>
                        {STRENGTH_LABELS[pwStrength]}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password */}
              {mode === 'signup' && (
                <div className="form-group delay-3">
                  <label className="form-label">Confirm Password</label>
                  <div className="form-input-wrap">
                    <input
                      className={`form-input pw-input ${confirmPassword.length > 0 ? (pwMatched ? 'is-valid' : 'is-invalid') : ''}`}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    {confirmPassword.length > 0 && (pwMatched ? <CheckIcon /> : <ErrorIcon />)}
                  </div>
                  {confirmPassword.length > 0 && !pwMatched && (
                    <div className="validation-message error">Passwords do not match.</div>
                  )}
                </div>
              )}

              <button className="btn-primary delay-4" type="submit" disabled={loading || !isValidForSubmit()}>
                {loading ? <span className="spinner" /> : (
                  mode === 'reset' ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {mode !== 'reset' && (
              <div className="delay-5">
                <div className="divider">OR</div>
                <button type="button" className="btn-google" onClick={handleGoogleSignIn} disabled={loading}>
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>
            )}

            <div className="form-footer">
              {mode === 'signin' ? (
                <>Don't have an account? <button className="link-btn" onClick={() => {setMode('signup'); setError('')}}>Sign up here</button></>
              ) : mode === 'signup' ? (
                <>Already have an account? <button className="link-btn" onClick={() => {setMode('signin'); setError('')}}>Log in</button></>
              ) : (
                <button className="link-btn" style={{ marginLeft: 0 }} onClick={() => {setMode('signin'); setError('')}}>← Back to Login</button>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: Hero Image & Trust Signals */}
        <div className="login-hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <h2 className="hero-tagline">
              Verify. <span>Hire.</span> Trust.
            </h2>
            <p className="hero-desc">
              Check licences, reviews, and insurance before you let them through the door. Peace of mind for your most important asset.
            </p>

            <div className="trust-signals">
              <div className="trust-badge">
                <div className="badge-icon"><UsersIcon /></div>
                <div>
                  <div className="badge-title">Join 10,000+ Australians</div>
                  <div className="badge-text">Relying on TradieCheck for safe hiring.</div>
                </div>
              </div>
              
              <div className="trust-badge">
                <div className="badge-icon"><TrustShieldIcon /></div>
                <div>
                  <div className="review-stars">★★★★★</div>
                  <div className="badge-title">Live Government Data</div>
                  <div className="badge-text">"Saved me from an unlicensed sparky!"</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
