<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@tybys/reactx](./reactx.md)

## reactx package

Reactive state management library for React.

## Classes

|  Class | Description |
|  --- | --- |
|  [Provider](./reactx.provider.md) | Provider component |
|  [Store](./reactx.store.md) | Store class |

## Functions

|  Function | Description |
|  --- | --- |
|  [connect()](./reactx.connect.md) | Connect store with react component |
|  [connect(mapProps)](./reactx.connect_1.md) | Connect store with react component |
|  [createStore(options)](./reactx.createstore.md) |  |
|  [isUsingProxy()](./reactx.isusingproxy.md) |  |
|  [nextTick()](./reactx.nexttick.md) | Next tick return a Promise |
|  [nextTick(cb)](./reactx.nexttick_1.md) | Next tick with callback |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [CreateStoreOptions](./reactx.createstoreoptions.md) |  |
|  [FORWARD\_REF\_STATICS](./reactx.forward_ref_statics.md) |  |
|  [KNOWN\_STATICS](./reactx.known_statics.md) |  |
|  [MEMO\_STATICS](./reactx.memo_statics.md) |  |
|  [ProviderProps](./reactx.providerprops.md) |  |
|  [ProviderState](./reactx.providerstate.md) |  |
|  [REACT\_STATICS](./reactx.react_statics.md) |  |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [ActionParameters](./reactx.actionparameters.md) |  |
|  [ActionsOption](./reactx.actionsoption.md) |  |
|  [ConnectedComponent](./reactx.connectedcomponent.md) | Applies LibraryManagedAttributes (proper handling of defaultProps and propTypes), as well as defines WrappedComponent. |
|  [GetProps](./reactx.getprops.md) | Infers prop type from component C |
|  [GettersOption](./reactx.gettersoption.md) |  |
|  [InferableComponentEnhancerWithProps](./reactx.inferablecomponentenhancerwithprops.md) | Injects props and removes them from the prop requirements. Will not pass through the injected props if they are passed in during render. Also adds new prop requirements from TNeedsProps. |
|  [IStore](./reactx.istore.md) |  |
|  [Matching](./reactx.matching.md) | A property P will be present if: - it is present in DecorationTargetProps<!-- -->Its value will be dependent on the following conditions - if property P is present in InjectedProps and its definition extends the definition in DecorationTargetProps, then its definition will be that of DecorationTargetProps\[P\] - if property P is not present in InjectedProps then its definition will be that of DecorationTargetProps\[P\] - if property P is present in InjectedProps but does not extend the DecorationTargetProps\[P\] definition, its definition will be that of InjectedProps\[P\] |
|  [NonReactStatics](./reactx.nonreactstatics.md) |  |
|  [Shared](./reactx.shared.md) | a property P will be present if : - it is present in both DecorationTargetProps and InjectedProps - InjectedProps\[P\] can satisfy DecorationTargetProps\[P\] ie: decorated component can accept more types than decorator is injecting<!-- -->For decoration, inject props or ownProps are all optionally required by the decorated (right hand side) component. But any property required by the decorated component must be satisfied by the injected property. |

