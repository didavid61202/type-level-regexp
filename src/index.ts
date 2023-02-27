import { ExhaustiveMatch } from './match'
import { ParseRegexp } from './parse'
import { MatchedResult, NullResult } from './utils'

export type FlagUnion = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

export type MatchRegexp<InputString extends string, Regexp extends string> = ExhaustiveMatch<
  InputString,
  ParseRegexp<Regexp>
> extends infer Result
  ? Result extends MatchedResult<infer MatchArray extends any[], any, infer NamedCaptures>
    ? MatchArray & {
        index: number // ? infer?
        input: InputString
        length: MatchArray['length']
        groups: (() => NamedCaptures) extends () => never
          ? undefined
          : { [K in NamedCaptures[0]]: Extract<NamedCaptures, [K, any]>[1] }
      }
    : Result extends NullResult<any, any, any>
    ? Result['results']
    : never
  : never

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
