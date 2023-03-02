import { ExhaustiveMatch, GlobalMatch } from './match'
import { ParseRegexp } from './parse'
import { PermutationResult, ResolvePermutation } from './permutation'
import { GlobalReplace, ResolveRepalceValue } from './replace'
import {
  LengthOfString,
  MatchedResult,
  Matcher,
  NamedCapturesTuple,
  NullResult,
  ToReadonlyTuple,
} from './utils'

export type FlagUnion = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

export type MatchRegexp<
  InputString extends string,
  Regexp extends string,
  Flag extends FlagUnion | undefined = undefined,
  ParsedRegexpAST extends Matcher[] = ParseRegexp<Regexp>
> = string extends InputString
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

type RegexpMatchResult<
  Result extends {
    matched: any[]
    namedCaptures: [string, any]
    input: string
    restInput: string | undefined
  }
> = ToReadonlyTuple<Result['matched']> &
  Readonly<{
    [K: number]: undefined
    index: Result['restInput'] extends undefined
      ? number
      : Result['input'] extends `${infer Precedes}${Result['matched'][0]}${Result['restInput']}`
      ? LengthOfString<Precedes>
      : never
    input: Result['input']
    groups: (() => Result['namedCaptures']) extends () => never
      ? undefined
      : { [K in Result['namedCaptures'][0]]: Extract<Result['namedCaptures'], [K, any]>[1] }
  }>

export type ReplaceWithRegexp<
  InputString extends string,
  Regexp extends string,
  ReplaceValue extends string,
  Flag extends 'g' | '' = '',
  ParsedRegexpAST extends Matcher[] = ParseRegexp<Regexp>
> = Flag extends 'g'
  ? GlobalReplace<InputString, ParsedRegexpAST, ReplaceValue>
  : ExhaustiveMatch<InputString, ParsedRegexpAST> extends infer Result
  ? Result extends MatchedResult<
      infer MatchArray extends any[],
      infer RestInputString extends string,
      infer NamedCaptures extends NamedCapturesTuple
    >
    ? InputString extends `${infer Precedes}${MatchArray[0]}${RestInputString}`
      ? `${Precedes}${ResolveRepalceValue<
          ReplaceValue,
          Precedes,
          MatchArray,
          RestInputString,
          NamedCaptures
        >}${RestInputString}`
      : never
    : InputString
  : never

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

    replace<
      InputString extends string,
      RE extends `/${string}/${'g' | ''}`,
      ReplaceValue extends string,
      ExtractedRE extends string = RE extends `/${infer R}/${'g' | ''}` ? R : never,
      Flag extends 'g' | '' = RE extends `/${string}/${infer F extends 'g' | ''}` ? F : never
    >(
      this: InputString,
      regexp: RE,
      replaceValue: ReplaceValue | ((substring: ReplaceValue, ...args: any[]) => string)
    ): ReplaceWithRegexp<InputString, ExtractedRE, ReplaceValue, Flag>
  }
}
