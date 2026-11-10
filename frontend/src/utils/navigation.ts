/** Only allow in-app redirect targets (prevents open redirects via ?next=). */
export function safeNext(next: string | null | undefined, fallback: string) {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : fallback;
}
