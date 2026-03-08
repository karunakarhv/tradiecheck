import { describe, it, expect } from 'vitest'
import { NSW_STATUS, parseNSWDate } from '../nsw'

describe('parseNSWDate', () => {
  it('parses a valid DD/MM/YYYY string to ISO format', () => {
    expect(parseNSWDate('30/11/2026')).toBe('2026-11-30')
  })

  it('parses single-digit day and month', () => {
    expect(parseNSWDate('01/03/2025')).toBe('2025-03-01')
  })

  it('returns null for empty string', () => {
    expect(parseNSWDate('')).toBeNull()
  })

  it('returns null for null', () => {
    expect(parseNSWDate(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(parseNSWDate(undefined)).toBeNull()
  })

  it('returns null for incomplete date string', () => {
    expect(parseNSWDate('30/11')).toBeNull()
  })
})

describe('NSW_STATUS', () => {
  it('maps Current to ACTIVE', () => {
    expect(NSW_STATUS.Current).toBe('ACTIVE')
  })

  it('maps Expired to EXPIRED', () => {
    expect(NSW_STATUS.Expired).toBe('EXPIRED')
  })

  it('maps Cancelled to SUSPENDED', () => {
    expect(NSW_STATUS.Cancelled).toBe('SUSPENDED')
  })
})
