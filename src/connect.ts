import * as React from 'react'
import { ReactContext } from './context.js'

/**
 * @public
 */
export interface REACT_STATICS {
  childContextTypes: true
  contextType: true
  contextTypes: true
  defaultProps: true
  displayName: true
  getDefaultProps: true
  getDerivedStateFromError: true
  getDerivedStateFromProps: true
  mixins: true
  propTypes: true
  type: true
}

/**
 * @public
 */
export interface KNOWN_STATICS {
  name: true
  length: true
  prototype: true
  caller: true
  callee: true
  arguments: true
  arity: true
}

/**
 * @public
 */
export interface MEMO_STATICS {
  '$$typeof': true
  compare: true
  defaultProps: true
  displayName: true
  propTypes: true
  type: true
}

/**
 * @public
 */
export interface FORWARD_REF_STATICS {
  '$$typeof': true
  render: true
  defaultProps: true
  displayName: true
  propTypes: true
}

/**
 * @public
 */
export type NonReactStatics<
  S extends React.ComponentType<any>,
  C extends {
    [key: string]: true
  } = {}
> = {
  [key in Exclude<
  keyof S,
  S extends React.MemoExoticComponent<any>
    ? keyof MEMO_STATICS | keyof C
    : S extends React.ForwardRefExoticComponent<any>
      ? keyof FORWARD_REF_STATICS | keyof C
      : keyof REACT_STATICS | keyof KNOWN_STATICS | keyof C
  >]: S[key]
}

/**
 * Applies LibraryManagedAttributes (proper handling of defaultProps
 * and propTypes), as well as defines WrappedComponent.
 * @public
 */
export type ConnectedComponent<
  C extends React.ComponentType<any>,
  P
> = React.NamedExoticComponent<JSX.LibraryManagedAttributes<C, P>> & NonReactStatics<C> & {
  WrappedComponent: C
}

/**
 * Infers prop type from component C
 * @public
 */
export type GetProps<C> = C extends React.ComponentType<infer P>
  ? C extends React.ComponentClass<P> ? React.ClassAttributes<InstanceType<C>> & P : P
  : never

/**
 * A property P will be present if:
 * - it is present in DecorationTargetProps
 *
 * Its value will be dependent on the following conditions
 * - if property P is present in InjectedProps and its definition extends the definition
 *   in DecorationTargetProps, then its definition will be that of DecorationTargetProps[P]
 * - if property P is not present in InjectedProps then its definition will be that of
 *   DecorationTargetProps[P]
 * - if property P is present in InjectedProps but does not extend the
 *   DecorationTargetProps[P] definition, its definition will be that of InjectedProps[P]
 * @public
 */
export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
    ? InjectedProps[P] extends DecorationTargetProps[P]
      ? DecorationTargetProps[P]
      : InjectedProps[P]
    : DecorationTargetProps[P];
}

/**
 * a property P will be present if :
 * - it is present in both DecorationTargetProps and InjectedProps
 * - InjectedProps[P] can satisfy DecorationTargetProps[P]
 * ie: decorated component can accept more types than decorator is injecting
 *
 * For decoration, inject props or ownProps are all optionally
 * required by the decorated (right hand side) component.
 * But any property required by the decorated component must be satisfied by the injected property.
 * @public
 */
export type Shared<
  InjectedProps,
  DecorationTargetProps
> = {
  [P in Extract<keyof InjectedProps, keyof DecorationTargetProps>]?: InjectedProps[P] extends DecorationTargetProps[P] ? DecorationTargetProps[P] : never;
}

/**
 * Injects props and removes them from the prop requirements.
 * Will not pass through the injected props if they are passed in during
 * render. Also adds new prop requirements from TNeedsProps.
 * @public
 */
export type InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> =
  <C extends React.ComponentType<Matching<TInjectedProps, GetProps<C>>>>(
    component: C
  ) => ConnectedComponent<C, Omit<GetProps<C>, keyof Shared<TInjectedProps, GetProps<C>>> & TNeedsProps>

/**
 * Connect store with react component
 * @returns Connected component
 * @public
 */
export function connect<Stores, P = {}> (): InferableComponentEnhancerWithProps<{ stores: Stores }, P>
/**
 * Connect store with react component
 * @param mapProps - Map props function
 * @returns Connected component
 * @public
 */
export function connect<Stores, P, F extends (stores: Stores, props: P) => any> (mapProps: F): InferableComponentEnhancerWithProps<ReturnType<F>, P>

/**
 * @public
 */
export function connect (mapProps?: any): any {
  return function (C: any): any {
    class WrapperComponent extends React.Component {
      public static readonly contextType = ReactContext
      public static readonly WrappedComponent = C

      public render (): JSX.Element {
        const props = {
          ...this.props,
          ...(typeof mapProps === 'function' ? mapProps(this.context, this.props) : { stores: this.context })
        }
        return React.createElement(C, props)
      }
    }

    return WrapperComponent
  }
}
