import { describe, it, expect } from 'vitest'
import { MOCK_TRADES } from '../mockData'

describe('MOCK_TRADES', () => {
  it('contains three demo records', () => {
    expect(Object.keys(MOCK_TRADES)).toHaveLength(3)
  })

  it('LIC-48291 is an ACTIVE electrician', () => {
    const jake = MOCK_TRADES['LIC-48291']
    expect(jake.status).toBe('ACTIVE')
    expect(jake.name).toBe('Jake Morrison')
    expect(jake.highRiskWork).toBe(true)
    expect(jake.asbestosCleared).toBe(true)
    expect(jake.insuranceValid).toBe(true)
    expect(jake.alerts).toHaveLength(0)
  })

  it('PLB-77432 is ACTIVE but has an expiry alert', () => {
    const sandra = MOCK_TRADES['PLB-77432']
    expect(sandra.status).toBe('ACTIVE')
    expect(sandra.alerts.length).toBeGreaterThan(0)
  })

  it('BLD-10293 is SUSPENDED with multiple alerts', () => {
    const tony = MOCK_TRADES['BLD-10293']
    expect(tony.status).toBe('SUSPENDED')
    expect(tony.insuranceValid).toBe(false)
    expect(tony.alerts.length).toBeGreaterThanOrEqual(3)
  })

  it('all records have required fields', () => {
    for (const record of Object.values(MOCK_TRADES)) {
      expect(record).toHaveProperty('name')
      expect(record).toHaveProperty('trade')
      expect(record).toHaveProperty('status')
      expect(record).toHaveProperty('licence')
      expect(record).toHaveProperty('expiry')
      expect(record).toHaveProperty('suburb')
    }
  })
})
