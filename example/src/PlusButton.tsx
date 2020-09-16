import * as React from 'react'

import { store } from './Store'

const PlusButton: React.FC<{}> = function PlusButton () {
  console.log('PlusButton render')
  return <button onClick={() => { store.dispatch('increment').catch(console.log) }}>+</button>
}

export default PlusButton
