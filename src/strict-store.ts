import { Store } from './store'
import { isPlainObject } from './util'

/**
 * @public
 */
export type GettersOption<S extends object> = { readonly [name: string]: (state: S) => any }

/**
 * @public
 */
export type ActionsOption<S extends object> = { readonly [name: string]: (state: S, payload: any) => any }

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
  private readonly _gettersCache: {
    [K in keyof G]: boolean
  } = {} as any

  private readonly _actions: A

  public readonly getters: {
    [K in keyof G]: ReturnType<G[K]>
  } = {} as any

  public constructor (options: StrictStoreOptions<S, G, A>) {
    super(options.state)

    const getters = options.getters
    // const getterErrors: Error[] = []
    if (isPlainObject(getters)) {
      Object.keys(getters!).forEach(g => {
        const getterName: keyof G = g
        let getterValue: ReturnType<G[typeof getterName]>
        try {
          getterValue = getters![getterName](this.state)
          this._gettersCache[getterName] = true
        } catch (err) {
          // getterErrors.push(err)
          this._gettersCache[getterName] = false
        }

        Object.defineProperty(this.getters, getterName, {
          configurable: true,
          enumerable: true,
          get: () => {
            if (!this._gettersCache[getterName]) {
              getterValue = getters![getterName](this.state)
              this._gettersCache[getterName] = true
            }
            return getterValue
          }
        })
      })
    }

    const actions = options.actions
    this._actions = actions ?? {} as any

    this.on('change', () => {
      if (isPlainObject(getters)) {
        Object.keys(getters!).forEach(g => {
          const getterName: keyof G = g
          this._gettersCache[getterName] = false
        })
      }
    })

    /* if (getterErrors.length > 0) {
      throw getterErrors[0]
    } */
  }

  public dispatch<T extends keyof A> (type: T, payload?: Parameters<A[T]>[1]): ReturnType<A[T]> {
    if (Object.prototype.hasOwnProperty.call(this._actions, type)) {
      return this._actions[type](this.state, payload)
    }
    throw new Error(`Action type "${type as string}" is not defined`)
  }

  public dispose (): void {
    super.dispose()
  }
}

export { StrictStore }
