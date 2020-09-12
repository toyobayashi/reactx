import * as React from 'react'

import { store } from './Store'

const MinusButton: React.FC<{}> = function MinusButton () {
  console.log('MinusButton render')
  return <button onClick={() => { store.decrement() }}>-</button>
}

export default MinusButton
