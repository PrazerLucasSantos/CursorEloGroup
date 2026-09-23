import type { FieldType } from '../types'

const common = {
  width: 14,
  height: 14,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.35,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export default function FieldTypeIcon({ type, className }: { type: FieldType; className?: string }) {
  switch (type) {
    case 'text':
      return (
        <svg {...common} className={className} aria-hidden>
          <rect x="2.5" y="2" width="11" height="12" rx="1.25" />
          <path d="M5 5.5h6M5 8h6M5 10.5h5M5 13h4" />
        </svg>
      )
    case 'number':
      return (
        <svg {...common} className={className} aria-hidden>
          <circle cx="5" cy="4.75" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="8" cy="4.75" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="11" cy="4.75" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="5" cy="8" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="11" cy="8" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="5" cy="11.25" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="8" cy="11.25" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="11" cy="11.25" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'decimal':
      return (
        <svg {...common} className={className} aria-hidden>
          <text x="0" y="12" fontSize="9" fontWeight="700" fill="currentColor" stroke="none" fontFamily="inherit">0,0</text>
        </svg>
      )
    case 'boolean':
      return (
        <svg {...common} className={className} aria-hidden>
          <rect x="2" y="5" width="12" height="6" rx="3" />
          <circle cx="11" cy="8" r="2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'date':
      return (
        <svg {...common} className={className} aria-hidden>
          <rect x="2.5" y="3" width="11" height="11" rx="1.5" />
          <path d="M2.5 6.5h11M6 2v2M10 2v2" />
        </svg>
      )
    case 'reference':
      return (
        <svg {...common} className={className} aria-hidden>
          <rect x="2.5" y="3.5" width="11" height="9" rx="1" />
          <path d="M5 8l3 2 3-2" />
        </svg>
      )
    case 'textOptions':
      return (
        <svg {...common} className={className} aria-hidden>
          <rect x="2" y="5" width="3.5" height="6" rx="0.5" />
          <rect x="6.25" y="5" width="3.5" height="6" rx="0.5" />
          <rect x="10.5" y="5" width="3.5" height="6" rx="0.5" />
        </svg>
      )
    case 'embeddedReference':
      return (
        <svg {...common} className={className} aria-hidden>
          <rect x="2" y="2" width="7" height="7" rx="1" />
          <rect x="7" y="7" width="7" height="7" rx="1" />
        </svg>
      )
    case 'file':
      return (
        <svg {...common} className={className} aria-hidden>
          <path d="M9 2H4.5A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V6L9 2z" />
          <path d="M9 2v4h4" />
        </svg>
      )
    case 'geopoint':
      return (
        <svg {...common} className={className} aria-hidden>
          <path d="M8 14s4-3.5 4-7a4 4 0 1 0-8 0c0 3.5 4 7 4 7z" />
          <circle cx="8" cy="7" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'html':
      return (
        <svg {...common} className={className} aria-hidden>
          <path d="M4 4L1.5 8 4 12M12 4l2.5 4L12 12M9.5 3l-3 10" />
        </svg>
      )
    case 'alert':
      return (
        <svg {...common} className={className} aria-hidden>
          <path d="M8 2.5L2.5 12h11L8 2.5z" fill="currentColor" stroke="none" opacity="0.2" />
          <path d="M8 5v4M8 10.5h.01" strokeWidth="1.75" />
        </svg>
      )
    default:
      return null
  }
}
