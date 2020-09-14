export const inBrowser = typeof window !== 'undefined'
const UA = inBrowser ? window.navigator.userAgent.toLowerCase() : undefined
export const isIE = UA !== undefined ? /msie|trident/.test(UA) : false
export const isIOS = UA !== undefined ? /iphone|ipad|ipod|ios/.test(UA) : false
