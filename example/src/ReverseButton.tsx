import * as React from 'react'

import { store } from './Store'

const ReverseButton: React.FC<{}> = function ReverseButton () {
  console.log('ReverseButton render')
  return <button onClick={() => { store.reverse() }}>reverse</button>
}

export default ReverseButton
