import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders ACTIVE badge', () => {
    render(<StatusBadge status="ACTIVE" />)
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('renders EXPIRING badge', () => {
    render(<StatusBadge status="EXPIRING" />)
    expect(screen.getByText('EXPIRING')).toBeInTheDocument()
  })

  it('renders EXPIRED badge', () => {
    render(<StatusBadge status="EXPIRED" />)
    expect(screen.getByText('EXPIRED')).toBeInTheDocument()
  })

  it('renders SUSPENDED badge', () => {
    render(<StatusBadge status="SUSPENDED" />)
    expect(screen.getByText('SUSPENDED')).toBeInTheDocument()
  })

  it('returns null for unknown status', () => {
    const { container } = render(<StatusBadge status="UNKNOWN" />)
    expect(container.firstChild).toBeNull()
  })
})
