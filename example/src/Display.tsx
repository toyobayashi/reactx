import * as React from 'react'

import { connect } from '../..'
import { ProviderStores, store } from './Store'

const Display: React.FC<{ store: typeof store }> = function Display (props) {
  console.log('Display render')
  console.log(props.store)
  console.log(props.store.state.deep.data.count)
  console.log(JSON.stringify(props.store.state.deep.data.count))
  console.log(props.store.getters.c)
  return (
    <>
      <p>{props.store.state.deep.data.count.join(', ')}</p>
      <p>{props.store.getters.c} * 5 = {props.store.getters.countDouble}</p>
    </>
  )
}

const ConnectedDisplay = connect<typeof store>()(Display)
console.log(ConnectedDisplay.WrappedComponent === Display)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const mapProps = (stores: ProviderStores) => {
  return { store: stores.store }
}
export default connect<ProviderStores, {}, typeof mapProps>(mapProps)(Display)
