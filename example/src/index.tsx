import * as React from 'react'
import * as ReactDom from 'react-dom'

import App from './App'

import { Provider } from '../..'
import { store, ProviderStores } from './Store'

ReactDom.render((
  <Provider<ProviderStores> stores={{ store }}>
    <App />
  </Provider>
), document.getElementById('app'))

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if ((module as any).hot) {
  (module as any).hot.accept()
}
