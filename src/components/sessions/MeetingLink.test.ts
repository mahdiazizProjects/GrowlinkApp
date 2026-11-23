import { describe, expect, it } from 'vitest'
import { safeMeetingUrl } from './MeetingLink'

describe('safeMeetingUrl', () => {
  it('accepts normal call links', () => {
    expect(safeMeetingUrl('https://meet.google.com/abc-defg-hij')).toBe('https://meet.google.com/abc-defg-hij')
    expect(safeMeetingUrl('  https://zoom.us/j/123  ')).toBe('https://zoom.us/j/123')
  })

  it('rejects script and other non-web links', () => {
    expect(safeMeetingUrl('javascript:alert(1)')).toBeNull()
    expect(safeMeetingUrl('data:text/html,<b>x</b>')).toBeNull()
  })

  it('rejects text that is not a URL', () => {
    expect(safeMeetingUrl('meet me at the library')).toBeNull()
    expect(safeMeetingUrl('')).toBeNull()
    expect(safeMeetingUrl(undefined)).toBeNull()
  })
})
