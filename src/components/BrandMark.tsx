type BrandMarkProps = {
  className?: string;
  variant?: 'full' | 'compact';
  title?: string;
};

/**
 * MediaHubAccess brand mark.
 * Inline SVG so it inherits sizing from parent Tailwind classes (w-/h-)
 * and scales perfectly on any phone DPR without raster pixelation.
 */
export default function BrandMark({
  className = 'w-10 h-10',
  variant = 'full',
  title = 'MediaHubAccess',
}: BrandMarkProps) {
  const gid = variant === 'compact' ? 'c' : 'f';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${gid}Bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        {variant === 'full' && (
          <>
            <linearGradient id={`${gid}Gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCF6BA" />
              <stop offset="55%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#BF953F" />
            </linearGradient>
            <linearGradient id={`${gid}Shield`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E5EDFF" />
            </linearGradient>
          </>
        )}
      </defs>

      <rect width="64" height="64" rx="14" fill={`url(#${gid}Bg)`} />
      <rect
        x="0.5"
        y="0.5"
        width="63"
        height="63"
        rx="13.5"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.14"
      />

      {variant === 'full' && (
        <path
          d="M14 4 H50 Q60 4 60 14 V22 Q40 14 4 22 V14 Q4 4 14 4 Z"
          fill="#FFFFFF"
          fillOpacity="0.06"
        />
      )}

      <path
        d="M32 9 L50.5 15 V31 C50.5 41.5 42.8 50 32 54.5 C21.2 50 13.5 41.5 13.5 31 V15 Z"
        fill={variant === 'full' ? `url(#${gid}Shield)` : '#FFFFFF'}
      />

      <path d="M28 25 V40 L41 32.5 Z" fill={`url(#${gid}Bg)`} />

      {variant === 'full' && (
        <path
          d="M24.5 21 Q32 17 39.5 21"
          stroke="#1E40AF"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      )}

      <circle
        cx="49"
        cy="14"
        r={variant === 'full' ? 7.5 : 6}
        fill={variant === 'full' ? `url(#${gid}Gold)` : '#D4AF37'}
      />
      <circle
        cx="49"
        cy="14"
        r={variant === 'full' ? 7.5 : 6}
        fill="none"
        stroke="#050505"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {variant === 'full' && (
        <path
          d="M45.4 14 L48.1 16.7 L52.8 11.7"
          stroke="#050505"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </svg>
  );
}
