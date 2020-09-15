import * as React from 'react'

import { connect } from '../..'
import { Store, ProviderStores } from './Store'

const Display: React.FC<{ store: Store }> = function Display (props) {
  console.log('Display render')
  console.log(props.store)
  console.log(props.store.state.deep.data.count)
  console.log(JSON.stringify(props.store.state.deep.data.count))
  return (
    <>
      <p>{props.store.state.deep.data.count.join(', ')}</p>
      <p>{props.store.state.deep.data.count[0]} * 5 = {props.store.countDouble}</p>
    </>
  )
}

const ConnectedDisplay = connect<ProviderStores>()(Display)
console.log(ConnectedDisplay.WrappedComponent === Display)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const mapProps = (stores: ProviderStores) => {
  return { store: stores.store }
}
export default connect<ProviderStores, {}, typeof mapProps>(mapProps)(Display)
