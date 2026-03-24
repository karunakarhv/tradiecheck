import { describe, it, expect } from 'vitest'
import { MOCK_TRADES } from '../mockData'

describe('MOCK_TRADES', () => {
  it('contains demo records for all states (8 total)', () => {
    expect(Object.keys(MOCK_TRADES)).toHaveLength(8)
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

  it('contains records for all other states', () => {
    expect(MOCK_TRADES['QLD-55221'].issuer).toBe('QBCC Queensland')
    expect(MOCK_TRADES['WA-88331'].issuer).toBe('Building Services WA')
    expect(MOCK_TRADES['SA-11223'].issuer).toBe('CBS South Australia')
    expect(MOCK_TRADES['ACT-99001'].issuer).toBe('Access Canberra')
    expect(MOCK_TRADES['TAS-44556'].issuer).toBe('CBOS Tasmania')
  })
})
