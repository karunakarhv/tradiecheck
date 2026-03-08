import './App.css'

import TradieCheck from './TradieCheck'
import Dashboard from './TradieCheck-Dashboard'
import Mobile from './TradieCheck-Mobile'
import NSWConfig from './TradieCheck-NSW-API-Config'
import HelpPage from './TradieCheck-Help'

const routes = {
  '/': TradieCheck,
  '/dashboard': Dashboard,
  '/mobile': Mobile,
  '/api-config': NSWConfig,
  '/help': HelpPage,
}

export default function App() {
  const path = window.location.pathname
  const Component = routes[path] || TradieCheck
  return <Component />
}