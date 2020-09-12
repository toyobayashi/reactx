const inBrowser = typeof window !== 'undefined'
const UA = inBrowser ? window.navigator.userAgent.toLowerCase() : undefined
const isIE = UA !== undefined ? /msie|trident/.test(UA) : false
const isIOS = UA !== undefined ? /iphone|ipad|ipod|ios/.test(UA) : false
function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

function noop (): void {}

export let isUsingMicroTask = false

const callbacks: Function[] = []
let pending = false

function flushCallbacks (): void {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let timerFunc: () => void

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = function () {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = function () {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
/* } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = function () {
    setImmediate(flushCallbacks)
  } */
} else {
  timerFunc = function () {
    setTimeout(flushCallbacks, 0)
  }
}

/**
 * Next tick return a Promise
 * @public
 */
export function nextTick (): Promise<void>

/**
 * Next tick with callback
 * @param cb - Callback to be invoked in the next tick
 * @public
 */
export function nextTick (cb: () => any): void

/**
 * @public
 */
export function nextTick (cb?: () => any): any {
  let _resolve: (value?: unknown) => void
  callbacks.push(function () {
    if (cb !== undefined) {
      try {
        cb()
      } catch (err) {
        if (inBrowser && typeof console !== 'undefined') {
          console.error(err)
        } else {
          throw err
        }
      }
    } else if (_resolve !== undefined) {
      _resolve()
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  if (cb === undefined && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve
    })
  }
}
