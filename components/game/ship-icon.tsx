import { cn } from '@/lib/utils'

export function ShipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" aria-hidden="true" className={cn('drop-shadow-[0_0_14px_#38bdf8]', className)}>
      <defs>
        <linearGradient id="ship-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#0b1030" />
        </linearGradient>
        <linearGradient id="ship-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="0.4" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M24 52 Q32 80 40 52 Z" fill="url(#ship-flame)" className="origin-top animate-pulse" />
      <path
        d="M32 4 L40 26 L56 50 L42 46 L22 46 L8 50 L24 26 Z"
        fill="url(#ship-body)"
        stroke="#7dd3fc"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="28" rx="4.5" ry="8" fill="#c084fc" />
    </svg>
  )
}
