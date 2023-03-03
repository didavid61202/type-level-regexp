import { ExhaustiveMatch, GlobalMatch } from './match'
import { ParseRegexp } from './parse'
import { PermutationResult, PrependAndUnionToAll, ResolvePermutation } from './permutation'
import { ExtractRegExpParts, Flag, RegExpParts, TypedRegExp } from './regexp'
import { GlobalReplace, ResolveRepalceValue } from './replace'
import {
  LengthOfString,
  MatchedResult,
  Matcher,
  NamedCapturesTuple,
  NullResult,
  ToReadonlyTuple,
} from './utils'

export type MatchRegExp<
  InputString extends string,
  Regexp extends string,
  Flags extends Flag,
  ParsedRegexpAST extends Matcher[] = ParseRegexp<Regexp>
> = string extends InputString
  ? ResolvePermutation<ParsedRegexpAST> extends PermutationResult<
      infer MatchArray,
      infer NamedCaptures extends NamedCapturesTuple
    >
    ? 'g' extends Flags
      ? MatchArray[0][]
      : RegExpMatchResult<{
          matched: 'i' extends Flags
            ? PrependAndUnionToAll<MatchArray, '[Case Insensitive] ', string & { all: true }>
            : MatchArray //TODO: string collape issue after TS 4.8, have to check if matchers include 'notCharSet' (check `[^` is in pattern?), 'notChar'... then union all array item with (string&{})
          namedCaptures: NamedCaptures //TODO: add '[Case Insensitive] ' prefix to named captures values
          input: InputString
          restInput: undefined
        }> | null
    : never
  : 'g' extends Flags
  ? GlobalMatch<InputString, ParsedRegexpAST, Flags>
  : ExhaustiveMatch<InputString, ParsedRegexpAST, Flags> extends infer Result
  ? Result extends MatchedResult<
      infer MatchArray extends any[],
      infer RestInputString extends string,
      infer NamedCaptures extends NamedCapturesTuple
    >
    ? RegExpMatchResult<{
        matched: MatchArray
        namedCaptures: NamedCaptures
        input: InputString
        restInput: RestInputString
      }>
    : Result extends NullResult<any, any, any>
    ? Result['results']
    : never
  : never

type RegExpMatchResult<
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

export type ReplaceWithRegExp<
  InputString extends string,
  Regexp extends string,
  ReplaceValue extends string,
  Flags extends Flag,
  ParsedRegexpAST extends Matcher[] = ParseRegexp<Regexp>
> = 'g' extends Flags
  ? GlobalReplace<InputString, ParsedRegexpAST, ReplaceValue, Flags>
  : ExhaustiveMatch<InputString, ParsedRegexpAST, Flags> extends infer Result
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
      RE extends TypedRegExp,
      REParts extends RegExpParts = ExtractRegExpParts<RE>
    >(
      this: InputString,
      regexp: RE
    ): MatchRegExp<InputString, REParts['pattern'], REParts['flags']>

    match<
      InputString extends string,
      RE extends TypedRegExp,
      REParts extends RegExpParts = ExtractRegExpParts<RE>
    >(
      this: InputString,
      regexp: RE
    ): MatchRegExp<InputString, REParts['pattern'], REParts['flags']>

    replace<
      InputString extends string,
      RE extends TypedRegExp,
      ReplaceValue extends string,
      REParts extends RegExpParts = ExtractRegExpParts<RE>
    >(
      this: InputString,
      regexp: RE,
      replaceValue: ReplaceValue | ((substring: ReplaceValue, ...args: any[]) => string)
    ): ReplaceWithRegExp<InputString, REParts['pattern'], ReplaceValue, REParts['flags']>
  }
}
