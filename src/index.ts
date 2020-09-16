/**
 * Reactive state management library for React.
 *
 * @packageDocumentation
 */

import { Store } from './store'
import { StrictStore } from './strict-store'
import { connect, InferableComponentEnhancerWithProps, Matching, GetProps, ConnectedComponent, Shared, NonReactStatics, REACT_STATICS, KNOWN_STATICS, MEMO_STATICS, FORWARD_REF_STATICS } from './connect'
import { Provider, ProviderProps, ProviderState } from './provider'
import { nextTick } from './tick'

export {
  connect,
  ConnectedComponent,
  FORWARD_REF_STATICS,
  GetProps,
  InferableComponentEnhancerWithProps,
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
  Store,
  StrictStore
}
