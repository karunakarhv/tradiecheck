import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StarRating from '../StarRating'

describe('StarRating', () => {
  it('renders rating and review count', () => {
    render(<StarRating rating={4.8} reviews={142} />)
    expect(screen.getByText('4.8 (142 reviews)')).toBeInTheDocument()
  })

  it('renders 5 star SVGs', () => {
    const { container } = render(<StarRating rating={4} reviews={10} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('fills stars up to the rounded rating', () => {
    const { container } = render(<StarRating rating={3.2} reviews={5} />)
    const stars = container.querySelectorAll('svg')
    const filled = Array.from(stars).filter(s => s.getAttribute('fill') === '#FFB800')
    expect(filled).toHaveLength(3) // rounds to 3
  })

  it('returns null when rating is falsy', () => {
    const { container } = render(<StarRating rating={0} reviews={10} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows 0 reviews when reviews is not provided', () => {
    render(<StarRating rating={4} />)
    expect(screen.getByText('4 (0 reviews)')).toBeInTheDocument()
  })
})
