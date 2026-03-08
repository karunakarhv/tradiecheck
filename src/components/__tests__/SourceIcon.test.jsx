import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SourceIcon from '../SourceIcon'

describe('SourceIcon', () => {
  it('renders wrench for trades', () => {
    render(<SourceIcon source="trades" />)
    expect(screen.getByTitle('trades')).toHaveTextContent('🔧')
  })

  it('renders warning for hrw', () => {
    render(<SourceIcon source="hrw" />)
    expect(screen.getByTitle('hrw')).toHaveTextContent('⚠️')
  })

  it('renders shield for asbestos', () => {
    render(<SourceIcon source="asbestos" />)
    expect(screen.getByTitle('asbestos')).toHaveTextContent('🛡️')
  })

  it('renders fallback for unknown source', () => {
    render(<SourceIcon source="other" />)
    expect(screen.getByTitle('other')).toHaveTextContent('📋')
  })
})
