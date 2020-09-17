import { Store } from './store'
import { isPlainObject } from './util'

/**
 * @public
 */
export type GettersOption<S extends object> = { readonly [name: string]: (this: any, state: S) => any }

/**
 * @public
 */
export type ActionsOption<S extends object> = { readonly [name: string]: (this: any, state: S, ...args: any[]) => any }

/**
 * @public
 */
export type ActionParameters<T extends (state: any, ...args: any) => any> = T extends (state: any, ...args: infer P) => any ? P : never

/**
 * @public
 */
export interface StrictStoreOptions<
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
class StrictStore<
  S extends object,
  G extends GettersOption<S>,
  A extends ActionsOption<S>
> extends Store<S> {
  public static create<
    S extends object,
    G extends GettersOption<S>,
    A extends ActionsOption<S>,
  > (options: StrictStoreOptions<S, G, A>): StrictStore<S, G, A> & {
    readonly [K in keyof G]: ReturnType<G[K]>
  } & {
    [K in keyof A]: (...args: ActionParameters<A[K]>) => ReturnType<A[K]>
  } {
    return new StrictStore(options) as any
  }

  private constructor (options: StrictStoreOptions<S, G, A>) {
    super(options.state)

    const getters = options.getters
    const _gettersCache: {
      [K in keyof G]: boolean
    } = {} as any

    if (isPlainObject(getters)) {
      Object.keys(getters!).forEach(g => {
        const getterName: keyof G = g
        let getterValue: ReturnType<G[typeof getterName]>

        Object.defineProperty(this, getterName, {
          configurable: true,
          enumerable: true,
          get: () => {
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this
    if (isPlainObject(actions)) {
      Object.keys(actions!).forEach(a => {
        const actionName: keyof A = a
        Object.defineProperty(this, actionName, {
          configurable: true,
          enumerable: false,
          writable: true,
          value (...args: ActionParameters<A[typeof actionName]>) {
            return actions![actionName].call(_this, _this.state, ...args)
          }
        })
      })
    }

    this.on('change', () => {
      if (isPlainObject(getters)) {
        Object.keys(getters!).forEach(g => {
          const getterName: keyof G = g
          _gettersCache[getterName] = false
        })
      }
    })
  }

  public dispatch<T extends keyof A> (type: T, ...args: ActionParameters<A[T]>): ReturnType<A[T]> {
    if (Object.prototype.hasOwnProperty.call(this, type)) {
      return (this as any)[type](this.state, ...args)
    }
    throw new Error(`Action type "${type as string}" is not defined`)
  }

  public dispose (): void {
    super.dispose()
  }
}

export { StrictStore }
