// Original minimal line icons for the Lab "planets" on the links page.
// Stroke-only, currentColor, 48x48 box with ~6px padding.

const svgProps = {
  viewBox: '0 0 48 48',
  className: 'links-orb-icon',
  'aria-hidden': 'true',
  focusable: 'false',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// Astra Dies: small chart wheel with house lines and a planet dot.
function AstroIcon() {
  // A natal-chart wheel: zodiac ring split into 12 houses, two planets inside
  return (
    <svg {...svgProps}>
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="11" />
      <path strokeWidth={1.4} d="M35.0 24.0L42.0 24.0 M33.5 29.5L39.6 33.0 M29.5 33.5L33.0 39.6 M24.0 35.0L24.0 42.0 M18.5 33.5L15.0 39.6 M14.5 29.5L8.4 33.0 M13.0 24.0L6.0 24.0 M14.5 18.5L8.4 15.0 M18.5 14.5L15.0 8.4 M24.0 13.0L24.0 6.0 M29.5 14.5L33.0 8.4 M33.5 18.5L39.6 15.0" />
      <circle cx="20" cy="20.5" r="2" fill="currentColor" stroke="none" />
      <circle cx="28.5" cy="27" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Five Elements: clothes hanger with a tiny sparkle.
function OutfitIcon() {
  return (
    <svg {...svgProps}>
      <g transform="translate(0 2)">
        <path d="M24 19v-2.5c0-1.2 3.5-2 3.5-5a3.5 3.5 0 1 0-7 0" />
        <path d="M24 19L7.6 30.6A2.6 2.6 0 0 0 9.1 35H38.9a2.6 2.6 0 0 0 1.5-4.4L24 19z" />
      </g>
    </svg>
  )
}

// Super Intelligence: four-point sparkle with secondary sparkles.
function SparkIcon() {
  return (
    <svg {...svgProps}>
      <path d="M21 8Q22.5 22 35 24Q22.5 26 21 40Q19.5 26 7 24Q19.5 22 21 8Z" />
      <path d="M38 6Q38.4 10.6 43 11Q38.4 11.4 38 16Q37.6 11.4 33 11Q37.6 10.6 38 6Z" strokeWidth={1.8} />
      <circle cx="38" cy="37" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const LAB_ICONS = { astro: AstroIcon, outfit: OutfitIcon, spark: SparkIcon }
