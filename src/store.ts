import { hasProxy, isIE9, isIE10 } from './env'
import {
  isPlainObject,
  isPrimitive,
  assertString,
  assertFunction,
  is,
  setPrototypeOf
} from './util'

type ChangeCallback = () => void

const observe = hasProxy ? tryCreateProxy : tryObserve

const arrayMethodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

function definePropertyNonEnumerable (o: any, name: string | number | symbol, value: any): any {
  return Object.defineProperty(o, name, {
    configurable: true,
    writable: true,
    enumerable: false,
    value
  })
}

function patchArrayMethods (obj: any[], proxyTarget: any[], onChange?: ChangeCallback): void {
  const common = function (name: string, args: IArguments): any {
    Array.prototype[name as any].apply(obj, args)
    let items: any[] | IArguments
    let shouldNotify: boolean = false
    switch (name) {
      case 'push':
      case 'unshift':
        items = Array.prototype.map.call(args, value => observe(value, onChange))
        shouldNotify = true
        break
      case 'splice':
        items = Array.prototype.map.call(args, (value, i) => i > 1 ? observe(value, onChange) : value)
        shouldNotify = true
        break
      default:
        items = args
        shouldNotify = proxyTarget.length > 0
        break
    }
    const r = Array.prototype[name as any].apply(proxyTarget, items)
    if (shouldNotify && typeof onChange === 'function') onChange()
    return r
  }

  const proto: any = []

  if (isIE9 || isIE10) {
    arrayMethodsToPatch.forEach(m => {
      proto[m] = function (): any { return common(m, arguments) }
    })
  } else {
    arrayMethodsToPatch.forEach(m => {
      definePropertyNonEnumerable(proto, m, function (): any { return common(m, arguments) })
    })
  }

  setPrototypeOf(proxyTarget, proto)
}

function createProxyHandlers (obj: any, onChange?: ChangeCallback): {
  deleteProperty: (target: any, p: PropertyKey) => boolean
  set: (target: any, p: PropertyKey, value: any, receiver: any) => boolean
} {
  return {
    deleteProperty (target: any, p: PropertyKey) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[p]
      if (Object.prototype.hasOwnProperty.call(target, p)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete target[p]
        if (typeof onChange === 'function') onChange()
        return true
      }
      return false
    },
    set (target: any, prop: string | number | symbol, value: any): boolean {
      if (Array.isArray(target) && prop === 'length') {
        if (target.length === value && obj.length === value) return true
        obj.length = value
        target.length = value
        if (typeof onChange === 'function') onChange()
        return true
      }
      if (isPrimitive(value) && is(value, obj[prop])) {
        return true
      }
      obj[prop] = value
      target[prop] = tryCreateProxy(value, onChange)
      if (typeof onChange === 'function') onChange()
      return true
    }
  }
}

function tryCreateProxy (obj: any, onChange?: ChangeCallback): any {
  if (isPlainObject(obj)) {
    const o: any = {}
    const keys = Object.keys(obj)
    keys.forEach(k => {
      const value = obj[k]
      o[k] = tryCreateProxy(value, onChange)
    })
    const proxy = new Proxy(o, createProxyHandlers(obj, onChange))

    return proxy
  } else if (Array.isArray(obj)) {
    const a: any[] = []
    const observeItem = (value: any, i: number): void => {
      a[i] = tryCreateProxy(value, onChange)
    }
    obj.forEach(observeItem)

    patchArrayMethods(obj, a, onChange)
    const proxy = new Proxy(a, createProxyHandlers(obj, onChange))
    return proxy
  } else {
    return obj
  }
}

const originKey = '__origin__'

function def (o: any, target: any, prop: string, value: any, onChange?: ChangeCallback): void {
  let observed = tryObserve(value, onChange)
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
      target[prop] = v
      observed = tryObserve(v, onChange)
      if (typeof onChange === 'function') onChange()
    }
  })
}

function tryObserve (obj: any, onChange?: ChangeCallback): any {
  if (isPlainObject(obj)) {
    if (Object.prototype.hasOwnProperty.call(obj, originKey)) {
      return tryObserve(obj[originKey], onChange)
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
      def(o, obj, k, obj[k], onChange)
    })
    return o
  } else if (Array.isArray(obj)) {
    if (Object.prototype.hasOwnProperty.call(obj, originKey)) {
      return tryObserve(obj[originKey as any], onChange)
    }
    const mapItem = (value: any): any => tryObserve(value, onChange)
    const a: any[] = obj.map(mapItem)
    Object.defineProperty(a, originKey, {
      configurable: true,
      enumerable: false,
      writable: false,
      value: obj
    })

    patchArrayMethods(obj, a, onChange)
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

const eventName = 'change'

function emitChange<T extends Store<any>> (store: T): void {
  ((store as any)._event as EventEmitter).emit(eventName)
}

class EventEmitter {
  private _events: { [event: string]: Function[] } = {}

  public emit (event: string, payload?: any): boolean {
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
    if (typeof event === 'string') {
      if (event in this._events && Object.prototype.hasOwnProperty.call(this._events, event)) {
        this._events[event].length = 0
      }
    } else {
      this._events = {}
    }
  }
}

/**
 * @public
 */
export function isUsingProxy (): boolean {
  return hasProxy
}

export const createdByFactory = '__createdByFactory'

export function cacheGetters (proto: any, getters: { [key: string]: (state: any) => any }): () => void {
  const getterKeys = Object.keys(getters)
  let _gettersCache: { [key: string]: boolean } = {}
  getterKeys.forEach(g => {
    const getterName: string = g
    let getterValue: any

    Object.defineProperty(proto, getterName, {
      configurable: true,
      enumerable: false,
      get () {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!_gettersCache[getterName]) {
          getterValue = getters[getterName].call(this, this.state)
          _gettersCache[getterName] = true
        }
        return getterValue
      }
    })
  })

  return (): void => {
    _gettersCache = {}
  }
}

/**
 * Store class
 * @public
 */
export class Store<T extends object> {
  private _disposed: boolean
  private readonly _event: EventEmitter
  // private static readonly __clearGetterCacheDeps: Array<() => void>
  public state!: T

  public constructor (initialState: T) {
    if (!isPlainObject(initialState) && !Array.isArray(initialState)) {
      throw new TypeError('Initial state must be a plain object or an array')
    }
    this._disposed = false
    this._event = new EventEmitter()

    const onChange = (): void => {
      emitChange(this)
      // if (Store.__clearGetterCacheDeps.length > 0) Store.__clearGetterCacheDeps.forEach(f => f())
    }
    let _state = observe(initialState, onChange)
    Object.defineProperty(this, 'state', {
      configurable: true,
      enumerable: true,
      get: () => _state,
      set: (state) => {
        if (!isPlainObject(state) && !Array.isArray(state)) {
          throw new TypeError('State must be a plain object or an array')
        }
        _state = observe(state, onChange)
        onChange()
      }
    })

    /* if (typeof Object.getOwnPropertyDescriptors === 'function' && typeof (this as any)[createdByFactory] === 'undefined') {
      try {
        let proto: any = Object.getPrototypeOf(this)
        let constructor = proto.constructor
        while (constructor !== Store) {
          if (!constructor.__clearGetterCache) {
            const descs = Object.getOwnPropertyDescriptors(proto)
            const descKeys = Object.keys(descs)
            const getters: any = {}
            for (let i = 0; i < descKeys.length; i++) {
              if (typeof descs[descKeys[i]].get === 'function') {
                getters[descKeys[i]] = descs[descKeys[i]].get
              }
            }
            if (Object.keys(getters).length > 0) {
              const f = cacheGetters(proto, getters)
              Object.defineProperty(constructor, '__clearGetterCache', {
                configurable: true,
                enumerable: false,
                writable: true,
                value: f
              })
              Store.__clearGetterCacheDeps.push(f)
            }
          }

          proto = Object.getPrototypeOf(proto)
          constructor = proto.constructor
        }
      } catch (_) {}
    } */
  }

  public set (observed: any, keyOrIndex: string | number, value: any): void {
    ensureStoreAvailable(this)
    const isObject = isPlainObject(observed)
    if (!isObject && !Array.isArray(observed)) {
      throw new TypeError('store.set must receive a plain object or an array as first argument')
    }
    if (!hasProxy && !Object.prototype.hasOwnProperty.call(observed, originKey)) {
      throw new TypeError('Cannot modify a non-observed object')
    }

    if (hasProxy) {
      observed[keyOrIndex] = value
    } else {
      if (isObject && Object.prototype.hasOwnProperty.call(observed, keyOrIndex)) {
        observed[keyOrIndex] = value
      } else {
        const onChange = (): void => {
          emitChange(this)
          // if (Store.__clearGetterCacheDeps.length > 0) Store.__clearGetterCacheDeps.forEach(f => f())
        }
        observed[originKey][keyOrIndex] = value
        observed[keyOrIndex] = observe(value, onChange)
        onChange()
      }
    }
  }

  public subscribe (fn: () => void): () => void {
    ensureStoreAvailable(this)
    this._event.on(eventName, fn)
    return () => {
      this._event.off(eventName, fn)
    }
  }

  public dispose (): void {
    if (!this._disposed) {
      this._event.removeAllListeners()
      this._disposed = true
    }
  }
}

// Object.defineProperty(Store, '__clearGetterCacheDeps', {
//   configurable: true,
//   enumerable: false,
//   writable: true,
//   value: []
// })

export const disabledKeys = [
  '_disposed',
  '_event',
  'state',
  'set',
  'subscribe',
  'dispose'
]
