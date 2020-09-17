<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@tybys/reactx](./reactx.md) &gt; [IStore](./reactx.istore.md)

## IStore type


<b>Signature:</b>

```typescript
export declare type IStore<S extends object, G extends GettersOption<S>, A extends ActionsOption<S>> = Store<S> & {
    readonly [K in keyof G]: ReturnType<G[K]>;
} & {
    [K in keyof A]: (...args: ActionParameters<A[K]>) => ReturnType<A[K]>;
};
```