import { useAuth } from './AuthContext'
import LogoutButton from './components/LogoutButton'

const GREEN = '#00e87a'

const cards = [
  {
    href: '/verifyTradie',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M7.5 11l2 2 3-3" />
      </svg>
    ),
    label: 'Verify a Tradie',
    description: 'Check licences, certifications & insurance against live NSW registers.',
    accent: GREEN,
    tag: 'MAIN TOOL',
  },
  {
    href: '/dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    label: 'Dashboard',
    description: 'View and manage tradie profiles loaded from the NSW register.',
    accent: '#00c4ff',
    tag: 'PORTAL',
  },
  {
    href: '/help',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r=".5" fill="currentColor" />
      </svg>
    ),
    label: 'Help & FAQs',
    description: 'Learn how TradieCheck works and what data sources are used.',
    accent: '#ff9500',
    tag: 'SUPPORT',
  },
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes gridDrift {
    0%   { background-position: 0 0; }
    100% { background-position: 60px 60px; }
  }

  .wc-root {
    min-height: 100vh;
    background: #050505;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .wc-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,232,122,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,232,122,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridDrift 10s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  .wc-glow {
    position: fixed;
    top: -160px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(0,232,122,0.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .wc-body {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 24px 80px;
  }

  /* Top bar */
  .wc-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 0 0;
    margin-bottom: 72px;
  }

  .wc-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }

  .wc-logo-mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(0,232,122,0.2), rgba(0,232,122,0.08));
    border: 1px solid rgba(0,232,122,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wc-logo-name {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: -0.03em;
  }

  .wc-logo-name span {
    color: ${GREEN};
  }

  .wc-live {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #444;
    letter-spacing: 0.1em;
  }

  .wc-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${GREEN};
    animation: pulse 2s infinite;
  }

  /* Hero */
  .wc-hero {
    margin-bottom: 52px;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  .wc-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(0,232,122,0.08);
    border: 1px solid rgba(0,232,122,0.2);
    border-radius: 20px;
    padding: 5px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: ${GREEN};
    font-weight: 700;
    margin-bottom: 24px;
  }

  .wc-greeting {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.05;
    margin-bottom: 14px;
  }

  .wc-greeting span {
    background: linear-gradient(90deg, ${GREEN}, #00c4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .wc-subtitle {
    font-size: 15px;
    color: #555;
    line-height: 1.7;
    max-width: 480px;
  }

  /* User info strip */
  .wc-user-strip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #0d0d0d;
    border: 1px solid #1a1a1a;
    border-radius: 12px;
    margin-bottom: 48px;
    animation: fadeUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both;
  }

  .wc-avatar {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: linear-gradient(135deg, rgba(0,232,122,0.2), rgba(0,232,122,0.4));
    border: 1px solid rgba(0,232,122,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: ${GREEN};
    flex-shrink: 0;
  }

  .wc-user-email {
    font-size: 13px;
    color: #888;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wc-user-tag {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: ${GREEN};
    background: rgba(0,232,122,0.08);
    border: 1px solid rgba(0,232,122,0.2);
    border-radius: 4px;
    padding: 3px 8px;
  }

  /* Cards grid */
  .wc-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 52px;
  }

  @media (min-width: 600px) {
    .wc-cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .wc-card {
    display: block;
    text-decoration: none;
    background: #0d0d0d;
    border: 1px solid #1a1a1a;
    border-radius: 14px;
    padding: 22px 20px;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s, background 0.2s;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  .wc-card:hover {
    transform: translateY(-2px);
    background: #111;
  }

  .wc-card-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .wc-card-tag {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.14em;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .wc-card-label {
    font-size: 15px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .wc-card-desc {
    font-size: 12px;
    color: #444;
    line-height: 1.6;
  }

  /* Footer */
  .wc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24px;
    border-top: 1px solid #111;
  }

  .wc-footer-text {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #2a2a2a;
    letter-spacing: 0.08em;
  }
`

function getInitials(email) {
  if (!email) return '?'
  return email[0].toUpperCase()
}

export default function Welcome() {
  const { session } = useAuth()
  const email = session?.user?.email ?? ''
  const initials = getInitials(email)

  return (
    <>
      <style>{styles}</style>
      <div className="wc-root">
        <div className="wc-glow" />

        <div className="wc-body">
          {/* Top bar */}
          <div className="wc-topbar">
            <a href="/welcome" className="wc-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="wc-logo-mark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5">
                  <circle cx="10" cy="10" r="6" />
                  <path d="m21 21-4.5-4.5" strokeLinecap="round" />
                  <path d="M7.5 10l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="wc-logo-name">Tradie<span>Check</span></div>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="wc-live">
                <div className="wc-live-dot" />
                LIVE
              </div>
              <LogoutButton variant="dark" />
            </div>
          </div>

          {/* Hero */}
          <div className="wc-hero">
            <div className="wc-badge">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }} />
              NSW VERIFIED PLATFORM
            </div>
            <div className="wc-greeting">
              Welcome back,<br />
              <span>let's get started.</span>
            </div>
            <p className="wc-subtitle">
              Instantly verify tradie licences, certifications, and insurance against live NSW Government registers.
            </p>
          </div>

          {/* Signed-in user strip */}
          <div className="wc-user-strip">
            <div className="wc-avatar">{initials}</div>
            <div className="wc-user-email">{email}</div>
            <div className="wc-user-tag">SIGNED IN</div>
          </div>

          {/* Action cards */}
          <div className="wc-cards">
            {cards.map((card, i) => (
              <a
                key={card.href}
                href={card.href}
                className="wc-card"
                style={{
                  animationDelay: `${0.15 + i * 0.07}s`,
                  borderColor: '#1a1a1a',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${card.accent}44` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
              >
                <div
                  className="wc-card-icon"
                  style={{
                    background: `${card.accent}14`,
                    border: `1px solid ${card.accent}33`,
                    color: card.accent,
                  }}
                >
                  {card.icon}
                </div>
                <div className="wc-card-tag" style={{ color: card.accent }}>{card.tag}</div>
                <div className="wc-card-label">{card.label}</div>
                <div className="wc-card-desc">{card.description}</div>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="wc-footer">
            <span className="wc-footer-text">DATA: NSW FAIR TRADING · SAFEWORK NSW</span>
            <span className="wc-footer-text">© {new Date().getFullYear()} TRADIECHECK</span>
          </div>
        </div>
      </div>
    </>
  )
}
