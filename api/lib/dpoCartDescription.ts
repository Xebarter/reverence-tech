/**
 * Build a short, receipt-friendly line summary for DPO Description / Booking fields.
 */
export function cartLinesSummary(items: unknown, maxLines = 15, maxLen = 220): string {
  if (!Array.isArray(items) || items.length === 0) return '';

  const parts: string[] = [];
  for (const raw of items.slice(0, maxLines)) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const name = String(row.product_name ?? row.name ?? 'Item').trim() || 'Item';
    const qty = Math.max(1, Math.round(Number(row.quantity) || 1));
    const shortName = name.length > 72 ? `${name.slice(0, 69)}…` : name;
    parts.push(`${shortName} ×${qty}`);
  }

  if (parts.length === 0) return '';

  let s = parts.join(', ');
  if (items.length > maxLines) {
    s += ', …';
  }
  if (s.length > maxLen) {
    s = `${s.slice(0, maxLen - 1)}…`;
  }
  return s;
}

export function buildDpoDescriptions(serviceName: string, items: unknown): {
  rootDescription: string;
  bookingDescription: string;
} {
  const lines = cartLinesSummary(items);
  if (!lines) {
    return { rootDescription: serviceName, bookingDescription: serviceName };
  }
  return {
    rootDescription: `${serviceName}: ${lines}`,
    bookingDescription: lines,
  };
}
