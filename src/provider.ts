import * as React from 'react'
import { ReactContext } from './context'
import { Store } from './store'

/**
 * @public
 */
export interface ProviderProps<Stores extends { [name: string]: Store<any> }> {
  stores: Stores
}

/**
 * @public
 */
export interface ProviderState<Stores extends { [name: string]: Store<any> }> {
  contextValue: Stores
}

/**
 * Provider component
 * @public
 */
export class Provider<Stores extends { [name: string]: Store<any> }> extends React.Component<ProviderProps<Stores>, ProviderState<Stores>> {
  public handlers: { [P in keyof Stores]?: Function }

  public constructor (props: ProviderProps<Stores>) {
    super(props)
    this.handlers = {}

    Object.keys(this.props.stores).forEach(k => {
      const handler = (): void => {
        this.setState({ contextValue: { ...this.props.stores } })
      }
      this.props.stores[k as keyof Stores].on('change', handler)
      this.handlers[k as keyof Stores] = handler
    })

    this.state = {
      contextValue: { ...this.props.stores }
    }
  }

  public componentWillUnmount (): void {
    Object.keys(this.handlers).forEach(k => {
      this.props.stores[k as keyof Stores].off('change', this.handlers[k as keyof Stores]!)
      this.props.stores[k as keyof Stores].dispose()
    })
  }

  public render (): JSX.Element {
    return React.createElement(ReactContext.Provider, { value: this.state.contextValue }, this.props.children)
  }
}
