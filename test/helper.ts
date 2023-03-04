export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false

export type Expect<T extends true> = T

export type MergeUnion<
  Union extends any[],
  ResultTuple extends any[] = [],
  Count extends any[] = []
> = Union['length'] extends Count['length']
  ? ResultTuple
  : MergeUnion<Union, [...ResultTuple, Union[Count['length']]], [...Count, '']>
