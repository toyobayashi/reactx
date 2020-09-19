import { Store, disabledKeys, cacheGetters } from './store'
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

function check (o: { [k: string]: any }, notAllowed: string[]): void {
  const keys = Object.keys(o)
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    // eslint-disable-next-line @typescript-eslint/prefer-includes
    if (notAllowed.indexOf(k) !== -1) {
      throw new Error(`Invalid key: "${k}"`)
    }
  }
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

  let init = false

  class Store extends store.Store<S> {
    public constructor (options: CreateStoreOptions<S, G, A>) {
      if (init) {
        throw new Error('Construction is not allowed')
      }
      super(options.state)

      init = true
    }
  }

  Object.defineProperty(Store, '__cached', { value: true })

  let getterKeys: string[] = []
  if (isPlainObject(getters)) {
    check(getters!, disabledKeys)
    getterKeys = Object.keys(getters!)
    cacheGetters(Store.prototype, getters!)
  }

  const actions = options.actions
  if (isPlainObject(actions)) {
    check(actions!, [...disabledKeys, ...getterKeys])
    Object.keys(actions!).forEach(a => {
      const actionName: keyof A = a
      Object.defineProperty(Store.prototype, actionName, {
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
