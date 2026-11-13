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
  // Horoscope: a crescent moon with a small star beside it
  return (
    <svg {...svgProps}>
      <path d="M27 8.5A15.5 15.5 0 1 0 39.5 31 12.5 12.5 0 1 1 27 8.5Z" />
      <path strokeWidth={1.8} d="M36 9.5q.6 3.4 4 4-3.4.6-4 4-.6-3.4-4-4 3.4-.6 4-4Z" />
      <circle cx="41" cy="22" r="1.4" fill="currentColor" stroke="none" />
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

// Desk Intelligence: four-point sparkle with secondary sparkles.
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
