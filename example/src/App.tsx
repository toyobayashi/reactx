import * as React from 'react'
import MinusButton from './MinusButton'
import PlusButton from './PlusButton'
import MultiplyButton from './MultiplyButton'
import Display from './Display'

class App extends React.Component<{}, {}> {
  render (): JSX.Element {
    console.log('App render')
    return (
      <>
        <Display />
        <PlusButton />
        <MinusButton />
        <MultiplyButton />
      </>
    )
  }
}

export default App
