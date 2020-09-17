import { Store } from './store'
import { isPlainObject } from './util'

const store = { Store }

/**
 * @public
 */
export type ActionParameters<T extends (state: any, ...args: any) => any> = T extends (state: any, ...args: infer P) => any ? P : never

/**
 * @public
 */
export type IStore<S extends object, G extends GettersOption<S>, A extends ActionsOption<S>> = Store<S> & {
  readonly [K in keyof G]: ReturnType<G[K]>
} & {
  [K in keyof A]: (...args: ActionParameters<A[K]>) => ReturnType<A[K]>
}

/**
 * @public
 */
export type GettersOption<S extends object> = { readonly [name: string]: (this: IStore<S, GettersOption<S>, ActionsOption<S>>, state: S) => any }

/**
 * @public
 */
export type ActionsOption<S extends object> = { readonly [name: string]: (this: IStore<S, GettersOption<S>, ActionsOption<S>>, state: S, ...args: any[]) => any }

/**
 * @public
 */
export interface CreateStoreOptions<
  S extends object,
  G extends GettersOption<S>,
  A extends ActionsOption<S>
> {
  state: S
  getters?: G
  actions?: A
}

/**
 * @public
 */
export function createStore<
  S extends object,
  G extends GettersOption<S>,
  A extends ActionsOption<S>,
> (options: CreateStoreOptions<S, G, A>): IStore<S, G, A> {
  const getters = options.getters
  const _gettersCache: {
    [K in keyof G]: boolean
  } = {} as any

  class Store extends store.Store<S> {
    public constructor (options: CreateStoreOptions<S, G, A>) {
      super(options.state)

      this.on('change', () => {
        if (isPlainObject(getters)) {
          Object.keys(getters!).forEach(g => {
            const getterName: keyof G = g
            _gettersCache[getterName] = false
          })
        }
      })
    }
  }

  if (isPlainObject(getters)) {
    Object.keys(getters!).forEach(g => {
      const getterName: keyof G = g
      let getterValue: ReturnType<G[typeof getterName]>

      Object.defineProperty(Store.prototype, getterName, {
        configurable: true,
        enumerable: false,
        get () {
          if (!_gettersCache[getterName]) {
            getterValue = getters![getterName].call(this, this.state)
            _gettersCache[getterName] = true
          }
          return getterValue
        }
      })
    })
  }

  const actions = options.actions
  if (isPlainObject(actions)) {
    Object.keys(actions!).forEach(a => {
      const actionName: keyof A = a
      Object.defineProperty((Store.prototype as any), actionName, {
        configurable: true,
        enumerable: false,
        writable: true,
        value (...args: ActionParameters<A[typeof actionName]>) {
          return actions![actionName].call(this, this.state, ...args)
        }
      })
    })
  }

  return new Store(options) as any
}

// /**
//  * @public
//  */
// function dispatch<S extends object, A extends ActionsOption<any>, ST extends IStore<S, any, A>, T extends keyof A> (store: ST, type: T, ...args: Parameters<ST[T]>): ReturnType<ST[T]> {
//   if (!(type in Store.prototype) && typeof store[type] === 'function') {
//     return (store[type] as any)(...args)
//   }
//   throw new Error(`Action type "${type as string}" is not defined`)
// }
