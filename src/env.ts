import { isNative } from './util'

export const inBrowser = typeof window !== 'undefined'
const UA = inBrowser ? window.navigator.userAgent.toLowerCase() : undefined
export const isIE = UA !== undefined ? /msie|trident/.test(UA) : false
export const isIE9 = UA !== undefined && UA.indexOf('msie 9.0') > 0
export const isIE10 = UA !== undefined && UA.indexOf('msie 10.0') > 0
export const isIOS = UA !== undefined ? /iphone|ipad|ipod|ios/.test(UA) : false
export const hasProxy = typeof Proxy === 'function' && isNative(Proxy)
