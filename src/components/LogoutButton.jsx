import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../lib/supabase'

/**
 * LogoutButton — two visual variants:
 *   "dark"  — for the main TradieCheck dark theme (border pill style)
 *   "light" — for the Dashboard sidebar (full-width subtle block)
 */
export default function LogoutButton({ variant = 'dark' }) {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    globalThis.location.replace('/login')
  }

  if (variant === 'light') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid rgba(255,59,59,0.18)',
          borderRadius: '10px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'rgba(255,100,100,0.5)',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          transition: 'all 0.15s',
          marginTop: '8px',
          fontFamily: 'inherit',
          opacity: loading ? 0.5 : 1,
        }}
        onMouseEnter={e => {
          if (!loading) {
            e.currentTarget.style.color = '#ff6464'
            e.currentTarget.style.borderColor = 'rgba(255,59,59,0.4)'
            e.currentTarget.style.background = 'rgba(255,59,59,0.06)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,100,100,0.5)'
          e.currentTarget.style.borderColor = 'rgba(255,59,59,0.18)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {loading ? 'Signing out…' : 'Sign Out'}
      </button>
    )
  }

  // Dark variant — pill button matching the nav link style
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        fontSize: '10px',
        color: '#ff5555',
        padding: '4px 8px',
        borderRadius: '5px',
        border: '1px solid rgba(255,59,59,0.3)',
        background: 'rgba(255,59,59,0.06)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.06em',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        opacity: loading ? 0.5 : 1,
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.background = 'rgba(255,59,59,0.14)'
          e.currentTarget.style.borderColor = 'rgba(255,59,59,0.5)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,59,59,0.06)'
        e.currentTarget.style.borderColor = 'rgba(255,59,59,0.3)'
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {loading ? 'SIGNING OUT…' : 'SIGN OUT'}
    </button>
  )
}

LogoutButton.propTypes = {
  variant: PropTypes.oneOf(['dark', 'light']),
}
