import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Sets Access-Control-Allow-Origin for browser calls to Vercel serverless routes.
 * Set ALLOWED_ORIGINS to a comma-separated list of exact origins (e.g. https://example.com).
 * If unset, uses * (typical when SPA and /api are same-site).
 */
export function setPaymentApiCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const raw = (process.env.ALLOWED_ORIGINS || '').trim();
  const requestOrigin = (req.headers.origin as string | undefined)?.trim();

  if (raw) {
    const allowed = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (requestOrigin && allowed.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Vary', 'Origin');
    }
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
}
