function isPlainObject (obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function throwInvalidArgType (name: string, type: string, received: string): never {
  throw new TypeError('[ERR_INVALID_ARG_TYPE]: The "' + name + '" argument must be of type ' + type + '. Received ' + received)
}

function isPrimitive (obj: any): boolean {
  return typeof obj !== 'object' || obj === null
}

function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

function assertString (v: any, name: string): void {
  const type = typeof v
  if (type !== 'string') {
    throwInvalidArgType(name, 'string', type)
  }
}

function assertFunction (v: any, name: string): void {
  const type = typeof v
  if (type !== 'function') {
    throwInvalidArgType(name, 'function', type)
  }
}

function is (x: any, y: any): boolean {
  if (typeof Object.is === 'function') {
    return Object.is(x, y)
  }

  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    // eslint-disable-next-line no-self-compare
    return x !== x && y !== y
  }
}

const arrayMethodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

function createSetTrap (obj: any, onChange?: (path: string, value: any, oldValue?: any) => void, patharr?: string[]): (target: any, p: PropertyKey, value: any, receiver: any) => boolean {
  patharr = patharr ?? []
  return function set (target: any, prop: string | number | symbol, value: any): boolean {
    if (Array.isArray(target) && prop === 'length') {
      obj.length = value
      target.length = value
      if (typeof onChange === 'function') {
        const paths = patharr!.concat([prop.toString()])
        onChange(paths.join('.'), value)
      }
      return true
    }
    if (isPrimitive(value) && is(value, obj[prop])) {
      return true
    }
    const paths = patharr!.concat([prop.toString()])
    const old = obj[prop]
    obj[prop] = value
    target[prop] = tryCreateProxy(value, onChange, paths)
    if (typeof onChange === 'function') {
      onChange(paths.join('.'), value, old)
    }
    return true
  }
}

function tryCreateProxy (obj: any, onChange?: (path: string, value: any, oldValue?: any) => void, patharr?: string[]): any {
  patharr = patharr ?? []
  if (isPlainObject(obj)) {
    const o: any = {}
    const keys = Object.keys(obj)
    keys.forEach(k => {
      const value = obj[k]
      const paths = patharr!.concat([k])
      o[k] = tryCreateProxy(value, onChange, paths)
    })
    const proxy = new Proxy(o, {
      set: createSetTrap(obj, onChange, patharr)
    })

    return proxy
  } else if (Array.isArray(obj)) {
    const a: any[] = []
    const observeItem = (value: any, i: number): void => {
      const paths = patharr!.concat([String(i)])
      a[i] = tryCreateProxy(value, onChange, paths)
    }
    obj.forEach(observeItem)
    arrayMethodsToPatch.forEach((method) => {
      a[method as any] = function (...args: any[]): any {
        const r = obj[method as any](...args)
        a.length = 0
        obj.forEach(observeItem)

        if (typeof onChange === 'function') {
          onChange((patharr as string[]).join('.'), obj)
        }
        return r
      }
    })
    const proxy = new Proxy(a, {
      set: createSetTrap(obj, onChange, patharr)
    })
    return proxy
  } else {
    return obj
  }
}

const originKey = '__origin__'

function def (o: any, target: any, prop: string | number, value: any, onChange?: (path: string, value: any, oldValue?: any) => void, patharr?: string[]): void {
  patharr = patharr ?? []
  const paths = patharr.concat([prop.toString()])
  let observed = tryObserve(value, onChange, paths)
  Object.defineProperty(o, prop, {
    configurable: true,
    enumerable: true,
    get () {
      return observed
    },
    set (v) {
      if (isPrimitive(v) && is(v, target[prop])) {
        return
      }
      const old = target[prop]
      target[prop] = v
      observed = tryObserve(v, onChange, paths)
      if (typeof onChange === 'function') {
        onChange(paths.join('.'), v, old)
      }
    }
  })
}

function tryObserve (obj: any, onChange?: (path: string, value: any, oldValue?: any) => void, patharr?: string[]): any {
  patharr = patharr ?? []
  if (isPlainObject(obj)) {
    if (Object.prototype.hasOwnProperty.call(obj, originKey)) {
      return tryObserve(obj[originKey], onChange, patharr)
    }
    const o = {}
    Object.defineProperty(o, originKey, {
      configurable: true,
      enumerable: false,
      writable: false,
      value: obj
    })
    const keys = Object.keys(obj)
    keys.forEach(k => {
      def(o, obj, k, obj[k], onChange, patharr)
    })
    return o
  } else if (Array.isArray(obj)) {
    if (Object.prototype.hasOwnProperty.call(obj, originKey)) {
      return tryObserve(obj[originKey as any], onChange, patharr)
    }
    const a: any[] = []
    Object.defineProperty(a, originKey, {
      configurable: true,
      enumerable: false,
      writable: false,
      value: obj
    })
    const observeItem = (value: any, i: number): void => {
      def(a, obj, i, value, onChange, patharr)
    }
    obj.forEach(observeItem)

    arrayMethodsToPatch.forEach((method) => {
      a[method as any] = function (...args: any[]): any {
        const r = obj[method as any](...args)
        a.length = 0
        obj.forEach(observeItem)

        if (typeof onChange === 'function') {
          onChange((patharr as string[]).join('.'), obj)
        }
        return r
      }
    })

    return a
  } else {
    return obj
  }
}

function ensureStoreAvailable (obj: any): void {
  if (obj._disposed as boolean) {
    throw new Error('Cannot call method of a disposed store')
  }
}

const isProxyAvailable = typeof Proxy !== 'undefined' && isNative(Proxy)
const observe = isProxyAvailable ? tryCreateProxy : tryObserve

/**
 * Store class
 * @public
 */
export class Store<T extends object> {
  private _disposed: boolean
  private _events: { [event: string]: Function[] }

  public readonly state!: T

  public constructor (initialState: T) {
    if (!isPlainObject(initialState) && !Array.isArray(initialState)) {
      throw new TypeError('Initial state must be a plain object or an array')
    }
    this._disposed = false
    this._events = {}
    Object.defineProperty(this, 'state', {
      configurable: true,
      enumerable: true,
      writable: false,
      value: observe(initialState, () => {
        this.emit('change')
      })
    })
  }

  public set (observed: any, keyOrIndex: string | number, value: any): void {
    ensureStoreAvailable(this)
    const isObject = isPlainObject(observed)
    if (!isObject && !Array.isArray(observed)) {
      throw new TypeError('store.set must receive a plain object or an array as first argument')
    }
    if (!isProxyAvailable && !Object.prototype.hasOwnProperty.call(observed, originKey)) {
      throw new TypeError('Cannot modify a non-observed object')
    }

    if (isProxyAvailable) {
      observed[keyOrIndex] = value
    } else {
      if (isObject) {
        if (Object.prototype.hasOwnProperty.call(observed, keyOrIndex)) {
          observed[keyOrIndex] = value
        } else {
          observed[originKey][keyOrIndex] = value
          observed[keyOrIndex] = observe(value, () => { this.emit('change') })
          this.emit('change')
        }
      } else {
        observed[originKey][keyOrIndex] = value
        observed[keyOrIndex] = observe(value, () => { this.emit('change') })
        this.emit('change')
      }
    }
  }

  public emit (event: string, payload?: any): boolean {
    ensureStoreAvailable(this)
    assertString(event, 'event')
    if (event in this._events && Object.prototype.hasOwnProperty.call(this._events, event)) {
      const arr = this._events[event].slice(0)
      for (let i = 0; i < arr.length; i++) {
        arr[i](payload)
      }
      return true
    }
    return false
  }

  public on (event: string, listener: Function): this {
    ensureStoreAvailable(this)
    assertString(event, 'event')
    assertFunction(listener, 'listener')
    if (event in this._events && Object.prototype.hasOwnProperty.call(this._events, event)) {
      this._events[event].push(listener)
    } else {
      this._events[event] = []
      this._events[event].push(listener)
    }
    return this
  }

  public off (event: string, listener: Function): this {
    ensureStoreAvailable(this)
    assertString(event, 'event')
    assertFunction(listener, 'listener')
    if (event in this._events && Object.prototype.hasOwnProperty.call(this._events, event)) {
      const index = this._events[event].indexOf(listener)
      if (index !== -1) {
        this._events[event].splice(index, 1)
      }
    }
    return this
  }

  public removeAllListeners (event?: string): void {
    ensureStoreAvailable(this)
    if (typeof event === 'string') {
      if (event in this._events && Object.prototype.hasOwnProperty.call(this._events, event)) {
        this._events[event].length = 0
      }
    } else {
      this._events = {}
    }
  }

  public dispose (): void {
    if (!this._disposed) {
      this.removeAllListeners()
      this._disposed = true
    }
  }
}
