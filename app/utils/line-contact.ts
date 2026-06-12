export { buildPropertyInterestLineMessage } from '~~/server/utils/property-inquiry-message'

export function lineOaMessageUrl(oaId: string, message: string): string {
  const id = oaId.replace(/^@/, '')
  return `https://line.me/R/oaMessage/@${encodeURIComponent(id)}/?${encodeURIComponent(message)}`
}

export function openLineOaMessage(oaId: string, message: string): void {
  window.open(lineOaMessageUrl(oaId, message), '_blank', 'noopener,noreferrer')
}
