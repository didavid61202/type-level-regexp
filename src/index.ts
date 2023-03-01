import { ExhaustiveMatch } from './match'
import { ParseRegexp } from './parse'
import { PermutationResult, ResolvePermutation } from './permutation'
import {
  ArrayToFixReadonlyTupple,
  LengthOfString,
  MatchedResult,
  Matcher,
  NullResult,
} from './utils'

export type FlagUnion = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

export type MatchRegexp<
  InputString extends string,
  Regexp extends string
> = ParseRegexp<Regexp> extends infer ParsedRegexpAST extends Matcher[]
  ? string extends InputString
    ? ResolvePermutation<ParsedRegexpAST> extends PermutationResult<
        infer MatchArray,
        infer NamedCaptures
      >
      ? RegexpMatchResult<{
          matched: MatchArray //TODO: string collape issue after TS 4.8, have to check if matchers include 'notCharSet' (check `[^` is in pattern?), 'notChar'... then union all array item with (string&{})
          namedCaptures: NamedCaptures
          input: InputString
          restInput: undefined
        }> | null
      : never
    : ExhaustiveMatch<InputString, ParsedRegexpAST> extends infer Result
    ? Result extends MatchedResult<
        infer MatchArray extends any[],
        infer RestInputString extends string,
        infer NamedCaptures
      >
      ? RegexpMatchResult<{
          matched: MatchArray
          namedCaptures: NamedCaptures
          input: InputString
          restInput: RestInputString
        }>
      : Result extends NullResult<any, any, any>
      ? Result['results']
      : never
    : never
  : never

type RegexpMatchResult<
  Result extends {
    matched: any[]
    namedCaptures: [string, any]
    input: string
    restInput: string | undefined
  }
> = ArrayToFixReadonlyTupple<Result['matched']> &
  Readonly<{
    index: Result['restInput'] extends undefined
      ? number
      : Result['input'] extends `${infer Prefix}${Result['matched'][0]}${Result['restInput']}`
      ? LengthOfString<Prefix>
      : never
    input: Result['input']
    length: Result['matched']['length']
    groups: (() => Result['namedCaptures']) extends () => never
      ? undefined
      : { [K in Result['namedCaptures'][0]]: Extract<Result['namedCaptures'], [K, any]>[1] }
  }>

declare global {
  interface String {
    match<InputString extends string, RE extends string, Flag extends Exclude<FlagUnion, 'g'>>(
      this: InputString,
      regexp: RE,
      flag?: Flag
    ): MatchRegexp<InputString, RE>

    match<InputString extends string, RE extends string, Flag extends 'g'>(
      this: InputString,
      regexp: RE,
      flag: Flag
    ): MatchRegexp<InputString, RE> //TODO: implement global match
  }
}
