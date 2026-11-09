const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function CheckIcon({ className = 'size-4' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function XIcon({ className = 'size-4' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function SpinnerIcon({ className = 'size-4' }) {
  return (
    <svg {...svgProps} className={`${className} animate-spin`}>
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" />
    </svg>
  )
}

export function AlertIcon({ className = 'size-4' }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
}

export function CopyIcon({ className = 'size-4' }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function DownloadIcon({ className = 'size-4' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

export function SparkIcon({ className = 'size-4' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    </svg>
  )
}