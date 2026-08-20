/** Status copy for the branded boot / connect screens. */
export const LoadingStatus = Object.freeze({
  LOADING: 'loading',
  CONNECTING: 'connecting',
})

/** @type {Record<string, string>} */
export const LOADING_STATUS_LABEL = Object.freeze({
  [LoadingStatus.LOADING]: 'LOADING...',
  [LoadingStatus.CONNECTING]: 'CONNECTING TO STREAM...',
})
