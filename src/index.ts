import { ExhaustiveMatch, GlobalMatch } from './match'
import { ParseRegexp } from './parse'
import { PermutationResult, ResolvePermutation } from './permutation'
import {
  ArrayToFixReadonlyTupple,
  LengthOfString,
  MatchedResult,
  Matcher,
  NamedCapturesTuple,
  NullResult,
} from './utils'

export type FlagUnion = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

export type MatchRegexp<
  InputString extends string,
  Regexp extends string,
  Flag extends FlagUnion | undefined = undefined
> = ParseRegexp<Regexp> extends infer ParsedRegexpAST extends Matcher[]
  ? string extends InputString
    ? ResolvePermutation<ParsedRegexpAST> extends PermutationResult<
        infer MatchArray,
        infer NamedCaptures extends NamedCapturesTuple
      >
      ? Flag extends 'g'
        ? MatchArray[0][]
        : RegexpMatchResult<{
            matched: MatchArray //TODO: string collape issue after TS 4.8, have to check if matchers include 'notCharSet' (check `[^` is in pattern?), 'notChar'... then union all array item with (string&{})
            namedCaptures: NamedCaptures
            input: InputString
            restInput: undefined
          }> | null
      : never
    : Flag extends 'g'
    ? GlobalMatch<InputString, ParsedRegexpAST>
    : ExhaustiveMatch<InputString, ParsedRegexpAST> extends infer Result
    ? Result extends MatchedResult<
        infer MatchArray extends any[],
        infer RestInputString extends string,
        infer NamedCaptures extends NamedCapturesTuple
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
      : Result['input'] extends `${infer Precedes}${Result['matched'][0]}${Result['restInput']}`
      ? LengthOfString<Precedes>
      : never
    input: Result['input']
    length: Result['matched']['length']
    groups: (() => Result['namedCaptures']) extends () => never
      ? undefined
      : { [K in Result['namedCaptures'][0]]: Extract<Result['namedCaptures'], [K, any]>[1] }
  }>

declare global {
  interface String {
    match<
      InputString extends string,
      RE extends `/${string}/`,
      Flag extends Exclude<FlagUnion, 'g'>,
      ExtractedRE extends string = RE extends `/${infer R}/` ? R : never
    >(
      this: InputString,
      regexp: RE,
      flag?: Flag
    ): MatchRegexp<InputString, ExtractedRE, Flag>

    match<
      InputString extends string,
      RE extends `/${string}/`,
      Flag extends 'g',
      ExtractedRE extends string = RE extends `/${infer R}/` ? R : never
    >(
      this: InputString,
      regexp: RE,
      flag: Flag
    ): MatchRegexp<InputString, ExtractedRE, Flag>

  }
}
