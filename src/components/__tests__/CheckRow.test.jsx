import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CheckRow from '../CheckRow'

describe('CheckRow', () => {
  it('shows CONFIRMED when value is true', () => {
    render(<CheckRow label="Insurance" value={true} />)
    expect(screen.getByText('Insurance')).toBeInTheDocument()
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument()
  })

  it('shows NOT VERIFIED when value is false', () => {
    render(<CheckRow label="Asbestos" value={false} />)
    expect(screen.getByText('Asbestos')).toBeInTheDocument()
    expect(screen.getByText('NOT VERIFIED')).toBeInTheDocument()
  })

  it('shows checkmark icon when value is true', () => {
    render(<CheckRow label="Licence" value={true} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows cross icon when value is false', () => {
    render(<CheckRow label="Licence" value={false} />)
    expect(screen.getByText('✕')).toBeInTheDocument()
  })
})
