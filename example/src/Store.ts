import { Store as BaseStore } from '../..'

const useProxy = typeof Proxy === 'function'

export interface StoreState {
  deep: {
    data: {
      count: number[]
    }
  }
}

export class Store extends BaseStore<StoreState> {
  public constructor () {
    super({
      deep: {
        data: {
          count: [0]
        }
      }
    })
  }

  public increment (): void {
    this.state.deep.data.count.push(this.state.deep.data.count.length)
    if (useProxy) {
      this.state.deep.data.count[0]++
    } else {
      this.set(this.state.deep.data.count, 0, this.state.deep.data.count[0] + 1)
    }
  }

  public decrement (): void {
    if (this.state.deep.data.count.length > 0) {
      if (useProxy) {
        this.state.deep.data.count[0]--
      } else {
        this.set(this.state.deep.data.count, 0, this.state.deep.data.count[0] - 1)
      }
      this.state.deep.data.count.length--
    }
  }

  public get countDouble (): number {
    return this.state.deep.data.count[0] * 5
  }

  public multiply (): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    }).then(() => {
      if (useProxy) {
        this.state.deep.data.count[0] *= 2
      } else {
        this.set(this.state.deep.data.count, 0, this.state.deep.data.count[0] * 2)
      }
    })
  }

  public reverse (): void {
    this.state.deep.data.count.reverse()
  }

  public sort (): void {
    this.state.deep.data.count.sort((a, b) => (a - b))
  }
}

export const store = new Store()

export type ProviderStores = {
  store: Store
}
