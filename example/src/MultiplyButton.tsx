import * as React from 'react'

import { store } from './Store'

const MultiplyButton: React.FC<{}> = function MultiplyButton () {
  console.log('MultiplyButton render')
  return <button onClick={() => { store.multiply().catch(err => console.log(err)) }}>* 2</button>
}

export default MultiplyButton
