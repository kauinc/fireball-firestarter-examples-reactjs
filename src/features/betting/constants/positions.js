/** Fill width of All position bar inside the inset track (P1 / P2 / P3). */
export const POSITION_FILL_WIDTH = Object.freeze({
  '1st': '33.333%',
  '2nd': '66.666%',
  '3rd': '100%',
})

/** Pointer center at the actual edge of the inset fill track. */
export const POSITION_THUMB_LEFT = Object.freeze({
  '1st': 'calc(33.333% + 2px * var(--hud-scale))',
  '2nd': 'calc(66.666% - 2px * var(--hud-scale))',
  '3rd': 'calc(100% - 6px * var(--hud-scale))',
})

/** Keep the scroll-position texture full-scale; crop via fill width. */
export const POSITION_FILL_ART_WIDTH = Object.freeze({
  '1st': '300%',
  '2nd': '150%',
  '3rd': '100%',
})

/**
 * @param {string[]} selectedPositions
 * @returns {'1st' | '2nd' | '3rd'}
 */
export function maxSelectedPosition(selectedPositions) {
  let current = '1st'
  for (const pos of ['1st', '2nd', '3rd']) {
    if (selectedPositions.includes(pos)) current = pos
  }
  return current
}

/**
 * Expand position selection up to the tapped seat (1st ⊂ 2nd ⊂ 3rd).
 * @param {string} pos
 * @returns {string[] | null}
 */
export function positionsUpTo(pos) {
  const index = ['1st', '2nd', '3rd'].indexOf(pos)
  if (index < 0) return null
  return ['1st', '2nd', '3rd'].slice(0, index + 1)
}
