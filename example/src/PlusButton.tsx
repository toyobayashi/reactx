import * as React from 'react'

import { store } from './Store'

const PlusButton: React.FC<{}> = function PlusButton () {
  console.log('PlusButton render')
  return <button onClick={() => { store.increment() }}>+</button>
}

export default PlusButton
