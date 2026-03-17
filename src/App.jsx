import './App.css'

import TradieCheck from './TradieCheck'
import Dashboard from './Dashboard'
import Mobile from './Mobile'
import NSWConfig from './NSWApiConfig'
import HelpPage from './Help'
import Welcome from './Welcome'
import Login from './Login'
import { AuthProvider, useAuth } from './AuthContext'
import { FLAGS } from './lib/flags'

const PUBLIC_ROUTES = {
  '/login': Login,
}

const PROTECTED_ROUTES = {
  '/': Welcome,
  '/welcome': Welcome,
  '/verifyTradie': TradieCheck,
  '/dashboard': Dashboard,
  '/mobile': Mobile,
  '/help': HelpPage,
  ...(FLAGS.API_CONFIG && { '/api-config': NSWConfig }),
}

function Router() {
  const { session, loading } = useAuth()
  const path = globalThis.location.pathname

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '24px', height: '24px',
          border: '2px solid #1e1e1e',
          borderTop: '2px solid #00e87a',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Public-only route: redirect logged-in users away from /login
  if (path === '/login') {
    if (session) {
      globalThis.location.replace('/welcome')
      return null
    }
    return <Login />
  }

  // Protected routes: redirect unauthenticated users to /login
  if (!session) {
    globalThis.location.replace('/login')
    return null
  }

  const Component = PROTECTED_ROUTES[path] ?? Welcome
  return <Component />
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
