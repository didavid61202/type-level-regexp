import { ExhaustiveMatch } from './match'
import { ParseRegexp } from './parse'
import { PermutationResult, ResolvePermutation } from './permutation'
import { ArrayToFixReadonlyTupple, MatchedResult, Matcher, NullResult } from './utils'

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
          matched: MatchArray
          namedCaptures: NamedCaptures
          input: InputString
        }>
      : never
    : ExhaustiveMatch<InputString, ParsedRegexpAST> extends infer Result
    ? Result extends MatchedResult<infer MatchArray extends any[], any, infer NamedCaptures>
      ? RegexpMatchResult<{
          matched: MatchArray
          namedCaptures: NamedCaptures
          input: InputString
        }>
      : Result extends NullResult<any, any, any>
      ? Result['results']
      : never
    : never
  : never

type RegexpMatchResult<
  Result extends { matched: any[]; namedCaptures: [string, any]; input: string }
> = ArrayToFixReadonlyTupple<Result['matched']> &
  Readonly<{
    index: number // ? infer?
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
