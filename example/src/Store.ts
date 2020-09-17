import { Store, createStore } from '../..'

const useProxy = Store.isUsingProxy()

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
    countDouble (state) {
      // console.log(`store.c:${store.c}`)
      return state.deep.data.count[0] * 5
    }
  },
  actions: {
    increment (state) {
      console.log(state.deep.data.count.push.name)
      state.deep.data.count.push(state.deep.data.count.length)
      if (useProxy) {
        state.deep.data.count[0] += 1
      } else {
        store.set(state.deep.data.count, 0, state.deep.data.count[0] + 1)
      }
    },
    decrement (state): void {
      if (state.deep.data.count.length > 0) {
        if (useProxy) {
          state.deep.data.count[0]--
        } else {
          this.set(state.deep.data.count, 0, state.deep.data.count[0] - 1)
        }
        state.deep.data.count.length--
        if (!useProxy) {
          (state.deep.data.count as any).__origin__.length--
        }
      }
    },
    multiply (state): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, 500)
      }).then(() => {
        if (useProxy) {
          state.deep.data.count[0] *= 2
        } else {
          this.set(state.deep.data.count, 0, state.deep.data.count[0] * 2)
        }
      })
    },
    reverse (state): void {
      state.deep.data.count.reverse()
    },
    sort (state): void {
      state.deep.data.count.sort((a, b) => (a - b))
    }
  }
})

export class CounterStore extends Store<StoreState> {
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

export const store1 = new CounterStore()

export type ProviderStores = {
  store: typeof store
}
