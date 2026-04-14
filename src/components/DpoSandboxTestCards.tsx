/**
 * Optional dev-only helper when integrating against DPO sandbox.
 * Import only behind isDpoTestModeEnabled() — not used on the live checkout path.
 */
export default function DpoSandboxTestCards({ className = '' }: { className?: string }) {
  if (!import.meta.env.DEV) return null;

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-amber-950 ${className}`}
      role="note"
      aria-label="DPO sandbox card hints (development only)"
    >
      <div className="font-bold text-sm text-amber-900">Sandbox checkout (dev only)</div>
      <p className="mt-2 text-xs text-amber-900/90">
        Use only with sandbox company token and service type. Cardholder name: any valid name.
      </p>
      <p className="mt-2 font-mono text-xs text-amber-950">
        Card: <span className="font-semibold">4242 4242 4242 4242</span> — expiry: any future date — CVC:{' '}
        <span className="font-mono font-semibold">123</span> (or 1234 if four digits).
      </p>
    </div>
  );
}
