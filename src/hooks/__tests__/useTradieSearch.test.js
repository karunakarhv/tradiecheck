import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useTradieSearch } from '../useTradieSearch'

// ─── Fetch helpers ────────────────────────────────────────────────────────────

function mockFetchOk(body) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    status: 200,
    json: () => Promise.resolve(body),
  })
}

function mockFetchStatus(status) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    status,
    json: () => Promise.resolve({}),
  })
}

// ─── NSW API fixtures ─────────────────────────────────────────────────────────

const LICENCE = {
  licensee:      'Jake Morrison',
  licenceNumber: 'EC-48291',
  licenceType:   'Electrical Contractor',
  status:        'Current',
  expiryDate:    '30/11/2026',
  issuer:        'NSW Fair Trading',
}

const LICENCE_CANCELLED = {
  ...LICENCE,
  licenceNumber: 'EC-99999',
  status:        'Cancelled',
  expiryDate:    '01/01/2020',  // also in the past → expired
}

const LICENCE_PAST_EXPIRY = { ...LICENCE, expiryDate: '01/01/2020' }

const ONE_RESULT   = { trades: [LICENCE], highRiskWork: [], asbestos: [] }
const MULTI_RESULT = {
  trades: [LICENCE, { ...LICENCE, licenceNumber: 'EC-22222', licensee: 'Sam Lee' }],
  highRiskWork: [],
  asbestos: [],
}
const EMPTY_RESULT = { trades: [], highRiskWork: [], asbestos: [] }

/** Minimal File-like for bulk upload tests. */
function makeFile(content, sizeOverride) {
  const csv = typeof content === 'string' ? content : content.join('\n')
  return {
    size: sizeOverride ?? csv.length,
    text: () => Promise.resolve(csv),
  }
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('useTradieSearch', () => {
  beforeEach(() => {
    // Only fake setTimeout/clearTimeout — leaving setInterval real prevents
    // the hook's 60-second LIVE ticker from triggering an infinite loop when
    // vi.runAllTimers() / vi.runAllTimersAsync() is called in tests.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  // ── Initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('has correct defaults', () => {
      const { result } = renderHook(() => useTradieSearch())
      expect(result.current.query).toBe('')
      expect(result.current.loading).toBe(false)
      expect(result.current.results).toBeNull()
      expect(result.current.result).toBeNull()
      expect(result.current.notFound).toBe(false)
      expect(result.current.rateLimited).toBe(false)
      expect(result.current.selectedState).toBe('NSW')
      expect(result.current.bulkResults).toBeNull()
    })
  })

  // ── handleSearch ─────────────────────────────────────────────────────────

  describe('handleSearch', () => {
    it('does nothing for an empty or whitespace-only term', async () => {
      const spy = vi.spyOn(globalThis, 'fetch')
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        await result.current.handleSearch('')
        await result.current.handleSearch('   ')
        await result.current.handleSearch(undefined)
      })
      expect(spy).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
      expect(result.current.notFound).toBe(false)
    })

    it('returns mock data for a demo code without calling fetch', async () => {
      const spy = vi.spyOn(globalThis, 'fetch')
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('LIC-48291') })
      expect(spy).not.toHaveBeenCalled()
      expect(result.current.result).not.toBeNull()
      expect(result.current.result.name).toBe('Jake Morrison')
    })

    it('sets result for a single-result API response', async () => {
      mockFetchOk(ONE_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('EC-48291') })
      expect(result.current.result).not.toBeNull()
      expect(result.current.result.name).toBe('Jake Morrison')
      expect(result.current.results).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('sets the results list for a multi-result API response', async () => {
      mockFetchOk(MULTI_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('Morrison') })
      expect(result.current.results).not.toBeNull()
      expect(result.current.results.trades).toHaveLength(2)
      expect(result.current.result).toBeNull()
    })

    it('sets notFound for an empty trades response', async () => {
      mockFetchOk(EMPTY_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('ghost-tradie') })
      expect(result.current.notFound).toBe(true)
      expect(result.current.result).toBeNull()
    })

    it('sets rateLimited on a 429 response', async () => {
      mockFetchStatus(429)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('flood') })
      expect(result.current.rateLimited).toBe(true)
      expect(result.current.notFound).toBe(false)
    })

    it('sets notFound on a network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network failure'))
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('boom') })
      expect(result.current.notFound).toBe(true)
      expect(result.current.loading).toBe(false)
    })

    it('always clears loading in finally — even on 429', async () => {
      mockFetchStatus(429)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('flood') })
      expect(result.current.loading).toBe(false)
    })

    it('uses query state when called without an argument', async () => {
      const spy = mockFetchOk(ONE_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.setQuery('EC-48291') })
      await act(async () => { await result.current.handleSearch() })
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('EC-48291'))
    })

    it('includes selectedState in the API URL', async () => {
      const spy = mockFetchOk(ONE_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.setSelectedState('VIC') })
      await act(async () => { await result.current.handleSearch('EC-48291') })
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('state=VIC'))
    })

    it('URL-encodes special characters in the search term', async () => {
      // encodeURIComponent encodes spaces as %20 (apostrophes are left as-is per spec)
      const spy = mockFetchOk(EMPTY_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('John Smith') })
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('John%20Smith'))
    })

    it('clears rateLimited and notFound at the start of a new search', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ status: 429, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ status: 200, json: () => Promise.resolve(ONE_RESULT) })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('flood') })
      expect(result.current.rateLimited).toBe(true)
      await act(async () => { await result.current.handleSearch('EC-48291') })
      expect(result.current.rateLimited).toBe(false)
      expect(result.current.result).not.toBeNull()
    })

    it('stores hrw and asbestos in the results list for later fallback', async () => {
      const withHRW = {
        trades: [LICENCE, { ...LICENCE, licenceNumber: 'EC-22222' }],
        highRiskWork: [{ licenceNumber: 'HRW-001' }],
        asbestos: [],
      }
      mockFetchOk(withHRW)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('Morrison') })
      expect(result.current.results.hrw).toHaveLength(1)
    })
  })

  // ── handleSelect ─────────────────────────────────────────────────────────

  describe('handleSelect', () => {
    it('maps API licence fields to the result shape', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => {
        result.current.handleSelect(LICENCE, { highRiskWork: [], asbestos: [] })
      })
      expect(result.current.result).toMatchObject({
        name:    'Jake Morrison',
        trade:   'Electrical Contractor',
        licence: 'EC-48291',
        status:  'ACTIVE',
        expiry:  '2026-11-30',
        issuer:  'NSW Fair Trading',
        alerts:  [],
      })
    })

    it('sets highRiskWork true when the HRW array is non-empty', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => {
        result.current.handleSelect(LICENCE, {
          highRiskWork: [{ licenceNumber: 'HRW-001' }],
          asbestos: [],
        })
      })
      expect(result.current.result.highRiskWork).toBe(true)
    })

    it('sets asbestosCleared true when the asbestos array is non-empty', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => {
        result.current.handleSelect(LICENCE, {
          highRiskWork: [],
          asbestos: [{ licenceNumber: 'ASB-001' }],
        })
      })
      expect(result.current.result.asbestosCleared).toBe(true)
    })

    it('derives photo initials from the licensee name', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.handleSelect(LICENCE, {}) })
      expect(result.current.result.photo).toBe('JM')  // Jake Morrison
    })

    it('produces no alerts for an active non-expired licence', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.handleSelect(LICENCE, {}) })
      expect(result.current.result.alerts).toHaveLength(0)
    })

    it('adds a cancelled alert when licence.status is Cancelled', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.handleSelect(LICENCE_CANCELLED, {}) })
      expect(result.current.result.alerts).toContain('🚨 Licence cancelled')
    })

    it('adds an expired alert when the expiry date is in the past', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.handleSelect(LICENCE_PAST_EXPIRY, {}) })
      expect(result.current.result.alerts).toContain('🚨 Licence has expired')
    })

    it('can produce both cancelled and expired alerts simultaneously', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.handleSelect(LICENCE_CANCELLED, {}) })
      expect(result.current.result.alerts).toContain('🚨 Licence cancelled')
      expect(result.current.result.alerts).toContain('🚨 Licence has expired')
    })

    it('defaults issuer to NSW Fair Trading when licence.issuer is absent', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => {
        result.current.handleSelect({ ...LICENCE, issuer: undefined }, {})
      })
      expect(result.current.result.issuer).toBe('NSW Fair Trading')
    })

    it('uses state-specific Authority as issuer for non-NSW selected state', () => {
      const { result } = renderHook(() => useTradieSearch())
      act(() => { result.current.setSelectedState('VIC') })
      act(() => {
        result.current.handleSelect({ ...LICENCE, issuer: undefined }, {})
      })
      expect(result.current.result.issuer).toBe('VIC Authority')
    })

    it('falls back to results.hrw when called without a data argument', async () => {
      // Multi-result search populates results.hrw = []
      mockFetchOk(MULTI_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('Morrison') })
      // Select without passing data — should use results.hrw fallback
      act(() => { result.current.handleSelect(LICENCE, undefined) })
      // results.hrw is [] so highRiskWork must be false
      expect(result.current.result.highRiskWork).toBe(false)
    })
  })

  // ── resetToList ───────────────────────────────────────────────────────────

  describe('resetToList', () => {
    it('clears the selected result but preserves the results list', async () => {
      mockFetchOk(MULTI_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('Morrison') })
      act(() => {
        result.current.handleSelect(result.current.results.trades[0], null)
      })
      expect(result.current.result).not.toBeNull()

      act(() => {
        result.current.resetToList()
        vi.runAllTimers()
      })

      expect(result.current.result).toBeNull()       // single selection cleared
      expect(result.current.results).not.toBeNull()  // list preserved
    })

    it('clears notFound', async () => {
      mockFetchOk(EMPTY_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('ghost') })
      expect(result.current.notFound).toBe(true)

      act(() => {
        result.current.resetToList()
        vi.runAllTimers()
      })
      expect(result.current.notFound).toBe(false)
    })
  })

  // ── resetAll ──────────────────────────────────────────────────────────────

  describe('resetAll', () => {
    it('clears all search-related state fields', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ status: 429, json: () => Promise.resolve({}) })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleSearch('flood') })
      expect(result.current.rateLimited).toBe(true)

      act(() => {
        result.current.resetAll()
        vi.runAllTimers()
      })
      expect(result.current.result).toBeNull()
      expect(result.current.results).toBeNull()
      expect(result.current.query).toBe('')
      expect(result.current.notFound).toBe(false)
      expect(result.current.rateLimited).toBe(false)
    })
  })

  // ── resetBulk ─────────────────────────────────────────────────────────────

  describe('resetBulk', () => {
    it('clears bulkResults and calls resetAll', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200, json: () => Promise.resolve(ONE_RESULT),
      })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile('EC-48291'))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults).not.toBeNull()

      act(() => {
        result.current.resetBulk()
        vi.runAllTimers()
      })
      expect(result.current.bulkResults).toBeNull()
      expect(result.current.query).toBe('')
    })
  })

  // ── handleBulkUpload ─────────────────────────────────────────────────────

  describe('handleBulkUpload', () => {
    it('does nothing for a null file', async () => {
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => { await result.current.handleBulkUpload(null) })
      expect(result.current.bulkResults).toBeNull()
    })

    it('alerts and bails for files over 100 KB', async () => {
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        await result.current.handleBulkUpload(makeFile('EC-48291', 200_000))
      })
      expect(globalThis.alert).toHaveBeenCalledWith(expect.stringContaining('too large'))
      expect(result.current.bulkResults).toBeNull()
    })

    it('alerts and bails when row count exceeds 50', async () => {
      const rows = Array.from({ length: 51 }, (_, i) => `QUERY-${i}`)
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        await result.current.handleBulkUpload(makeFile(rows))
      })
      expect(globalThis.alert).toHaveBeenCalledWith(expect.stringContaining('50'))
      expect(result.current.bulkResults).toBeNull()
    })

    it('filters blank lines and # comment rows', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200, json: () => Promise.resolve(ONE_RESULT),
      })
      const csv = '# header\nEC-48291\n\n   \nEC-22222\n# footer'
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile(csv))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults).toHaveLength(2)
    })

    it('deduplicates identical entries', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200, json: () => Promise.resolve(ONE_RESULT),
      })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile(['EC-48291', 'EC-48291', 'EC-48291']))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults).toHaveLength(1)
    })

    it('marks results as success when the API returns trades', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200, json: () => Promise.resolve(ONE_RESULT),
      })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile(['EC-48291', 'EC-22222']))
        await vi.runAllTimersAsync()
        await p
      })
      for (const r of result.current.bulkResults) {
        expect(r.status).toBe('success')
        expect(r.data).not.toBeNull()
      }
    })

    it('marks results as notFound when the API returns empty trades', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200, json: () => Promise.resolve(EMPTY_RESULT),
      })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile('UNKNOWN-99'))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults[0].status).toBe('notFound')
      expect(result.current.bulkResults[0].data).toBeNull()
    })

    it('marks results as error on network failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile('EC-bad'))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults[0].status).toBe('error')
    })

    it('retries after 5 s on 429 and succeeds if the retry passes', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ status: 429, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ status: 200, json: () => Promise.resolve(ONE_RESULT) })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile('EC-flood'))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults[0].status).toBe('success')
    })

    it('stays rateLimited when the retry also returns 429', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 429, json: () => Promise.resolve({}),
      })
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile('EC-flood'))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults[0].status).toBe('rateLimited')
    })

    it('clears any existing result and results list before processing', async () => {
      mockFetchOk(ONE_RESULT)
      const { result } = renderHook(() => useTradieSearch())
      // Populate a single result first
      await act(async () => { await result.current.handleSearch('EC-48291') })
      expect(result.current.result).not.toBeNull()

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200, json: () => Promise.resolve(ONE_RESULT),
      })
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile('EC-11111'))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.result).toBeNull()
      expect(result.current.results).toBeNull()
    })

    it('processes multiple rows sequentially and all reach a terminal status', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ status: 200, json: () => Promise.resolve(ONE_RESULT) })
        .mockResolvedValueOnce({ status: 200, json: () => Promise.resolve(EMPTY_RESULT) })
        .mockRejectedValueOnce(new Error('offline'))
      const { result } = renderHook(() => useTradieSearch())
      await act(async () => {
        const p = result.current.handleBulkUpload(makeFile(['EC-1', 'EC-2', 'EC-3']))
        await vi.runAllTimersAsync()
        await p
      })
      expect(result.current.bulkResults[0].status).toBe('success')
      expect(result.current.bulkResults[1].status).toBe('notFound')
      expect(result.current.bulkResults[2].status).toBe('error')
    })
  })
})
