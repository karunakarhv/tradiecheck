import './App.css'

import TradieCheck from './TradieCheck'
import Dashboard from './TradieCheck-Dashboard'
import Mobile from './TradieCheck-Mobile'
import NSWConfig from './TradieCheck-NSW-API-Config'
import HelpPage from './TradieCheck-Help'
import { FLAGS } from './lib/flags'

const routes = {
  '/': TradieCheck,
  '/dashboard': Dashboard,
  '/mobile': Mobile,
  '/help': HelpPage,
  ...(FLAGS.API_CONFIG && { '/api-config': NSWConfig }),
}

export default function App() {
  const path = window.location.pathname
  const Component = routes[path] || TradieCheck
  return <Component />
}