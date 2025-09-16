export default function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 160 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet">
      <defs>
        <linearGradient id="symbolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#4F46E5', stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:'#7C3AED', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#2563EB', stopOpacity:1}} />
        </linearGradient>
        <linearGradient
          id="symbolGradient2"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{stopColor:'#06B6D4', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#3B82F6', stopOpacity:1}} />
        </linearGradient>
      </defs>

      <path
        d="M8 8 Q15 5 22 8 Q25 12 22 16 Q18 22 12 22 Q6 18 8 16 Z"
        fill="url(#symbolGradient)"
        opacity="0.9"
      />
      <path
        d="M15 12 Q22 9 29 12 Q32 15 29 19 Q25 25 19 25 Q13 22 15 19 Z"
        fill="url(#symbolGradient2)"
        opacity="0.8"
      />

      <text x="42" y="25" fontFamily="'Inter', 'Segoe UI', sans-serif" fontSize="25" fill="currentColor">
        <tspan fontWeight="800" >jamie</tspan>
        <tspan dx="4" fontWeight="600" >tech</tspan>
      </text>
    </svg>
  )
}
