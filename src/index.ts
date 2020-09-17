/**
 * Reactive state management library for React.
 *
 * @packageDocumentation
 */

import { Store } from './store'
import { createStore, IStore, ActionParameters, GettersOption, ActionsOption, CreateStoreOptions } from './strict-store'
import { connect, InferableComponentEnhancerWithProps, Matching, GetProps, ConnectedComponent, Shared, NonReactStatics, REACT_STATICS, KNOWN_STATICS, MEMO_STATICS, FORWARD_REF_STATICS } from './connect'
import { Provider, ProviderProps, ProviderState } from './provider'
import { nextTick } from './tick'

export {
  ActionsOption,
  ActionParameters,
  connect,
  ConnectedComponent,
  createStore,
  CreateStoreOptions,
  FORWARD_REF_STATICS,
  GetProps,
  GettersOption,
  InferableComponentEnhancerWithProps,
  IStore,
  KNOWN_STATICS,
  Matching,
  MEMO_STATICS,
  nextTick,
  NonReactStatics,
  Provider,
  ProviderProps,
  ProviderState,
  REACT_STATICS,
  Shared,
  Store
}
