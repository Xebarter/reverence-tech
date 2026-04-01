import { FlaskConical } from 'lucide-react';

/**
 * Shown only when VITE_DPO_TEST_MODE=true. For DPO sandbox checkout only.
 */
export default function DpoSandboxTestCards({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-950 ${className}`}
      role="region"
      aria-label="DPO sandbox test card details"
    >
      <div className="flex items-start gap-2 mb-3">
        <FlaskConical size={20} className="text-amber-700 shrink-0 mt-0.5" aria-hidden />
        <div>
          <div className="font-bold text-sm text-amber-900">DPO sandbox — test cards</div>
          <p className="text-xs text-amber-800/90 mt-0.5">
            Use only with sandbox company token and service type on your server. Cardholder name: any valid name.
          </p>
        </div>
      </div>
      <ul className="text-xs font-mono space-y-1.5 text-amber-950">
        <li>5436 8862 6984 8367 (Mastercard)</li>
        <li>4012 8888 8888 1881 (Visa)</li>
        <li>3456 7890 1234 564 (Amex)</li>
      </ul>
      <p className="text-xs text-amber-800 mt-3">
        Expiry: any future date (e.g. <span className="font-mono font-semibold">12/26</span>). CVV:{' '}
        <span className="font-mono font-semibold">123</span> per DPO sandbox docs; if the form requires four digits, try{' '}
        <span className="font-mono font-semibold">1234</span>.
      </p>
    </div>
  );
}
