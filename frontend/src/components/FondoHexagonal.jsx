export default function FondoHexagonal() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: 260, pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
      }}
    >
      <defs>
        <pattern id="login-hex" width="28" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(1.1)">
          <path d="M14 0 L28 8.08 L28 24.25 L14 32.33 L0 24.25 L0 8.08 Z M14 32.33 L14 48.5" fill="none" stroke="#4f8ef7" strokeOpacity="0.22" strokeWidth="1" />
        </pattern>
        <radialGradient id="login-brillo" cx="85%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-hex)" />
      <rect width="100%" height="100%" fill="url(#login-brillo)" />
    </svg>
  )
}
