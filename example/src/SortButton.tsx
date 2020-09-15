import * as React from 'react'

import { store } from './Store'

const SortButton: React.FC<{}> = function SortButton () {
  console.log('SortButton render')
  return <button onClick={() => { store.sort() }}>sort</button>
}

export default SortButton
