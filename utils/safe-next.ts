// Post-login redirect targets come from the URL, so only allow plain in-app paths
// ("/join/abc"), never "//evil.com", "/\evil.com" or absolute URLs (open-redirect protection).
export function safeNext(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/'
  return value
}

// Appends ?next=<path> (or &next=) to a URL, only when there is a safe, non-root destination.
export function withNext(url: string, next: string): string {
  if (next === '/') return url
  return url + (url.includes('?') ? '&' : '?') + 'next=' + encodeURIComponent(next)
}
