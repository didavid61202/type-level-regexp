export type FlagUnion = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

declare global {
  interface String {
    match<InputString extends string, RE extends string, Flag extends Exclude<FlagUnion, 'g'>>(
      this: InputString,
      regexp: RE,
      flag?: Flag
    ): [InputString] | null

    match<InputString extends string, RE extends string, Flag extends 'g'>(
      this: InputString,
      regexp: RE,
      flag: Flag
    ): InputString[] | null
  }
}
