import { Store as BaseStore } from '../..'

export interface StoreState {
  deep: {
    data: {
      count: number
    }
  }
}

export class Store extends BaseStore<StoreState> {
  public constructor () {
    super({
      deep: {
        data: {
          count: 0
        }
      }
    })
  }

  public increment (): void {
    this.state.deep.data.count++
  }

  public decrement (): void {
    this.state.deep.data.count--
  }

  public get countDouble (): number {
    return this.state.deep.data.count * 5
  }

  public multiply (): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    }).then(() => {
      this.state.deep.data.count *= 2
    })
  }
}

export const store = new Store()

export type ProviderStores = {
  store: Store
}
