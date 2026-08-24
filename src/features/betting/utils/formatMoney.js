/**
 * Format a stake / balance for HUD meters.
 * @param {number} value
 */
export function formatMoney(value) {
  return `€${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
