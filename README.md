# Reactx

响应式的 React 全局状态管理。

## 为什么不用 Redux ？

用过的都知道，太啰里吧嗦了，为了支持异步操作还需要做出额外的选择： thunk / saga / ...

条条框框太多，虽然约束力很强，但是写出来的代码实在是可以用坨来形容，如果是个人开发的小项目的话没什么必要。

## 为什么不用 Mobx ？

看到装饰器就怕，大坑。现阶段应尽量避免去用任何深度依赖装饰器的库。虽然 Mobx 可以不使用装饰器，但是写起来还是有点别扭的。

## 为什么用 Reactx ？

* 以最简洁最直观的方式修改全局状态！
* 没有 Reducer / Action / Mutaion 之类的概念！
* 不依赖不稳定的 ES 特性（如装饰器）！
* TypeScript 友好！
* 面向 Store 对象，按你想要的方式编写成员方法即可，不论同步异步！
* 类似 Vue 的响应式原理，简洁高效，符合 JavaScript 直觉，要的就是简单、好用！

请看下面的用法自行体会。

## 安装

```bash
# 从 GitHub
npm install toyobayashi/reactx

# 从 NPM（暂未发布，先我自己试用和完善）
npm install @tybys/reactx
```

[API 文档](./docs/api/index.md)

## 用法

写一个简单的计数器，例子在 `example` 目录中，`npm install` 然后 `npm run serve` 就可以跑起来看效果。

1. 编写你的 Store 类

    ```js
    // store.js
    import { Store as BaseStore } from '@tybys/reactx'

    export class Store extends BaseStore {
      constructor () {
        super({
          count: 0
        }) // 传入初始状态树，该对象会被深度观测，通过 this.state 访问
      }

      // 普通的成员函数，类似 Vuex 的 Mutation
      increment () {
        this.state.count++
      }

      decrement () {
        this.state.count--
      }

      // 类成员访问器类似 Vuex 的 Getter
      get countDouble () {
        return this.state.count * 5
      }

      // 普通的异步成员函数，类似 Vuex 的 Action
      multiply () {
        return new Promise((resolve) => {
          setTimeout(resolve, 500)
        }).then(() => {
          this.state.count *= 2
        })
      }
    }

    export const store = new Store()
    ```

2. 类似 `react-redux` 利用 `Provider` 全局注入你想使用的 stores

    ```jsx
    // index.jsx
    import * as React from 'react'
    import * as ReactDom from 'react-dom'

    import App from './App.jsx'

    import { Provider } from '@tybys/reactx'
    import { store } from './store.js'

    ReactDom.render((
      // stores 属性需要传入一个对象，对象的所有属性值都是 store 实例
      <Provider stores={{ store }}>
        <App />
      </Provider>
    ), document.getElementById('app'))
    ```

    ```jsx
    // App.jsx

    // render函数返回
    (<>
      <Display />
      <PlusButton />
      <MinusButton />
      <MultiplyButton />
    </>)
    ```

3. 类似 `react-redux` 利用 `connect` 连接**需要访问 store 中状态**的组件，只有连接过的组件才能响应 store 状态的变化重新渲染变化的数据。

    ```jsx
    // Display.jsx
    import * as React from 'react'

    import { connect } from '@tybys/reactx'

    const Display = function Display (props) {
      // 默认注入到组件的 stores 属性，它就是传入 Provider 组件的 stores
      const store = props.stores.store
      return <p>{store.state.count} * 5 = {store.countDouble}</p>
    }
    const ConnectedDisplay = connect()(Display)

    // 也可以传入函数，返回需要注入的属性
    // connect((stores) => ({ store: stores.store }))(Display)
    // 然后在组件中访问 props.store

    export default ConnectedDisplay
    ```

    不需要访问 store 中状态的组件不用 connect，直接导入 store 进来用即可，可避免不必要的重渲染。connect 后也可以通过 `shouldComponentUpdate` 钩子自行选择何时重渲染。

    ```jsx
    // PlusButton.jsx
    import * as React from 'react'

    import { store } from './store.js'

    export default function PlusButton () {
      return <button onClick={() => { store.increment() }}>+</button>
    }
    ```

    ```jsx
    // MinusButton.jsx
    import * as React from 'react'

    import { store } from './store.js'

    export default function MinusButton () {
      return <button onClick={() => { store.decrement() }}>-</button>
    }
    ```

    ```jsx
    // MultiplyButton.jsx
    import * as React from 'react'

    import { store } from './store.js'

    export default function MultiplyButton () {
      return <button onClick={() => { store.multiply().catch(err => console.log(err)) }}>* 2</button>
    }
    ```

## 注意事项

* 初始状态必须是对象或数组

    ```js
    class extends reactx.Store {
      constructor () {
        super({ /* ... */ }) // 传入对象或数组
      }
    }
    ```

* 所有状态需要先定义好，不可在初始化之后动态添加，可通过 Store 的 `set` 方法添加。

    ```js
    this.state.notExist = 'xxx' // notExist 属性在初始化的时候不存在，这是不可监听的
    this.set(this.state, 'notExist', 'xxx') // OK
    ```

* 通过索引修改数组的元素不可监听，可通过 Store 的 `set` 方法修改。此外，数组的 `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse` 方法可以被监听到。

    ```js
    class extends reactx.Store {
      constructor () {
        super({ arr: [1, 2, 3] })
      }

      change () {
        this.state.arr[1] = 6 // 不可监听

        this.set(this.state.arr, 1, 6) // OK
        this.state.arr.push(10) // OK
      }
    }
    ```

* 尽量避免修改大对象或大数组，可能会产生性能问题，因为这样要重新深度观测新对象里面的所有数据

    ```js
    class extends reactx.Store {
      constructor () {
        super({ 
          obj: { /* 里面数据很多很深 */ },
          arr: [ /* 里面数据很多很深 */ ] 
        })
      }

      change () {
        this.state.obj = { /* 里面数据很多很深 */ } // 不推荐
        this.state.arr = [ /* 里面数据很多很深 */ ] // 不推荐
      }
    }
    ```