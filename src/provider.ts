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
  private readonly _unsubscribe: { [P in keyof Stores]?: () => void }

  public constructor (props: ProviderProps<Stores>) {
    super(props)
    this._unsubscribe = {}

    Object.keys(this.props.stores).forEach(k => {
      const handler = (): void => {
        this.setState({ contextValue: { ...this.props.stores } })
      }
      this._unsubscribe[k as keyof Stores] = this.props.stores[k as keyof Stores].subscribe(handler)
    })

    this.state = {
      contextValue: { ...this.props.stores }
    }
  }

  public componentWillUnmount (): void {
    Object.keys(this._unsubscribe).forEach(k => {
      this._unsubscribe[k as keyof Stores]!()
      this.props.stores[k as keyof Stores].dispose()
    })
  }

  public render (): JSX.Element {
    return React.createElement(ReactContext.Provider, { value: this.state.contextValue }, this.props.children)
  }
}
