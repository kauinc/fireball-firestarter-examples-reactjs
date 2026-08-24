/**
 * Doof sprites from `src/assets/doofs`.
 * Handles Blue "Srtipes" typo from source files.
 */
const doofModules = import.meta.glob('../../../assets/doofs/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** @type {Record<string, string>} */
const doofUrlByName = Object.fromEntries(
  Object.entries(doofModules).map(([path, url]) => {
    const fileName = path.split('/').pop()
    return [fileName, url]
  }),
)

/** All available doof sprite URLs (for history / random picks). */
export const ALL_DOOF_URLS = Object.freeze(Object.values(doofUrlByName))

/**
 * Fixed lineup for the center betting table (color × pattern → file).
 * Matches the product mockup roster (mixed Hats / Glasses).
 */
const BOARD_ROSTER = Object.freeze({
  'Red-Dots': 'Red_Dots_Hats.png',
  'Yellow-Dots': 'Yellow_Dots_Glasses.png',
  'Green-Dots': 'Green_Dots_Hats.png',
  'Cyan-Dots': 'Cyan_Dots_Glasses.png',
  'Blue-Dots': 'Blue_Dots_Hats.png',
  'Magenta-Dots': 'Magenta_Dots_Glasses.png',

  'Red-Solid': 'Red_Solid_Glasses.png',
  'Yellow-Solid': 'Yellow_Solid_Hats.png',
  'Green-Solid': 'Green_Solid_Glasses.png',
  'Cyan-Solid': 'Cyan_Solid_Hats.png',
  'Blue-Solid': 'Blue_Solid_Glasses.png',
  'Magenta-Solid': 'Magenta_Solid_Hats.png',

  'Red-Stripes': 'Red_Stripes_Hats.png',
  'Yellow-Stripes': 'Yellow_Stripes_Glasses.png',
  'Green-Stripes': 'Green_Stripes_Hats.png',
  'Cyan-Stripes': 'Cyan_Stripes_Glasses.png',
  'Blue-Stripes': 'Blue_Srtipes_Hats.png',
  'Magenta-Stripes': 'Magenta_Stripes_Glasses.png',
})

/**
 * @param {string} color
 * @param {string} pattern
 * @returns {{ src: string, accessory: 'Hats' | 'Glasses' } | null}
 */
export function getDoofBoardCell(color, pattern) {
  const fileName = BOARD_ROSTER[`${color}-${pattern}`]
  if (!fileName) return null
  const src = doofUrlByName[fileName]
  if (!src) return null
  const accessory = /Glasses/i.test(fileName) ? 'Glasses' : 'Hats'
  return { src, accessory }
}

/**
 * @param {string} color
 * @param {string} pattern
 * @returns {string | null}
 */
export function getDoofImageUrl(color, pattern) {
  return getDoofBoardCell(color, pattern)?.src ?? null
}

/**
 * @param {number} count
 * @returns {string[]}
 */
export function pickRandomDoofUrls(count) {
  const pool = [...ALL_DOOF_URLS]
  const picks = []
  for (let i = 0; i < count; i += 1) {
    if (pool.length === 0) break
    const index = Math.floor(Math.random() * pool.length)
    picks.push(pool.splice(index, 1)[0])
  }
  // If we need more than unique pool size, allow repeats
  while (picks.length < count && ALL_DOOF_URLS.length > 0) {
    picks.push(
      ALL_DOOF_URLS[Math.floor(Math.random() * ALL_DOOF_URLS.length)],
    )
  }
  return picks
}
