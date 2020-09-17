import { Store as BaseStore, createStore } from '../..'

const useProxy = BaseStore.isUsingProxy()

export interface StoreState {
  deep: {
    data: {
      count: number[]
    }
  }
}

export const store = createStore({
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  state: {
    deep: {
      data: {
        count: [0]
      }
    }
  } as StoreState,
  getters: {
    countDouble () {
      // console.log(`store.c:${store.c}`)
      return this.c * 5
    },
    c (state) {
      return state.deep.data.count[0]
    }
  },
  actions: {
    increment (state, n: number) {
      console.log(state === this.state)
      console.log(state.deep.data.count.push.name)
      state.deep.data.count.push(state.deep.data.count.length)
      if (useProxy) {
        state.deep.data.count[0] += n
      } else {
        store.set(state.deep.data.count, 0, state.deep.data.count[0] + n)
      }
      return Promise.resolve()
    }
  }
})

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
    console.log(this.state.deep.data.count.push.name)
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
      if (!useProxy) {
        (this.state.deep.data.count as any).__origin__.length--
      }
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

// export const store = new Store()

export type ProviderStores = {
  store: typeof store
}
