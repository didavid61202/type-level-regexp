import { ExhaustiveMatch, GlobalMatch } from './match'
import { ParseRegExp } from './parse'
import { PermutationResult, PrependAndUnionToAll, ResolvePermutation } from './permutation'
import {
  ExtractRegExpParts,
  Flag,
  RegExpIterableIterator,
  RegExpParts,
  TypedRegExp,
} from './regexp'
import { GlobalReplace, ResolveRepalceValue } from './replace'
import { LengthOfString, MatchedResult, Matcher, NamedCapturesTuple, NullResult } from './utils'

export { createRegExp, spreadRegExpIterator, spreadRegExpMatchArray } from './regexp'
export type { Flag } from './regexp'
export type { ParseRegExp } from './parse'
export type { ExhaustiveMatch, GlobalMatch } from './match'
export type { ResolvePermutation } from './permutation'

export type MatchRegExp<
  InputString extends string,
  Regexp extends string,
  Flags extends Flag,
  ParsedRegexpAST extends Matcher[] = ParseRegExp<Regexp>
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

export type RegExpMatchResult<
  Result extends {
    matched: any[]
    namedCaptures: [string, any]
    input: string
    restInput: string | undefined
  },
  MatchObject = {
    index: Result['restInput'] extends undefined
      ? number
      : Result['input'] extends `${infer Precedes}${Result['matched'][0]}${Result['restInput']}`
      ? LengthOfString<Precedes>
      : never
    input: Result['input']
    groups: (() => Result['namedCaptures']) extends () => never
      ? undefined
      : { [K in Result['namedCaptures'][0]]: Extract<Result['namedCaptures'], [K, any]>[1] }
    keys: () => IterableIterator<Extract<keyof Result['matched'], `${number}`>>
    _matchArray: Result['matched']
  }
> = {
  [K in
    | Exclude<keyof Result['matched'], number | string>
    | keyof MatchObject]: K extends keyof MatchObject
    ? MatchObject[K]
    : K extends keyof Result['matched']
    ? Result['matched'][K]
    : never
} & Pick<Result['matched'], Exclude<Extract<keyof Result['matched'], string>, keyof MatchObject>>

export type MatchAllRegExp<
  InputString extends string,
  Regexp extends string,
  Flags extends Flag,
  MatchedResultTuple extends any[] = [],
  InitialInputString extends string = InputString,
  ParsedRegexpAST extends Matcher[] = ParseRegExp<Regexp>
> = ParsedRegexpAST extends ParsedRegexpAST
  ? string extends InputString
    ? ResolvePermutation<ParsedRegexpAST> extends PermutationResult<
        infer MatchArray,
        infer NamedCaptures extends NamedCapturesTuple
      >
      ? RegExpIterableIterator<
          (RegExpMatchResult<{
            matched: 'i' extends Flags
              ? PrependAndUnionToAll<MatchArray, '[Case Insensitive] ', string & { all: true }>
              : MatchArray //TODO: string collape issue after TS 4.8, have to check if matchers include 'notCharSet' (check `[^` is in pattern?), 'notChar'... then union all array item with (string&{})
            namedCaptures: NamedCaptures //TODO: add '[Case Insensitive] ' prefix to named captures values
            input: InputString
            restInput: undefined
          }> | null)[]
        >
      : never
    : ExhaustiveMatch<InputString, ParsedRegexpAST, Flags> extends infer Result
    ? Result extends MatchedResult<
        infer MatchArray extends any[],
        infer RestInputString extends string,
        infer NamedCaptures extends NamedCapturesTuple
      >
      ? MatchAllRegExp<
          RestInputString,
          'Distributed',
          Flags,
          [
            ...MatchedResultTuple,
            RegExpMatchResult<{
              matched: MatchArray
              namedCaptures: NamedCaptures
              input: InitialInputString
              restInput: RestInputString
            }>
          ],
          InitialInputString,
          ParsedRegexpAST
        >
      : RegExpIterableIterator<MatchedResultTuple>
    : never
  : never

export type ReplaceWithRegExp<
  InputString extends string,
  Regexp extends string,
  ReplaceValue extends string,
  Flags extends Flag,
  ParsedRegexpAST extends Matcher[] = ParseRegExp<Regexp>
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

    /** @deprecated String.matchAll requires global flag to be set. */
    matchAll<InputString extends string, RE extends TypedRegExp<string, Exclude<Flag, 'g'>>>(
      this: InputString,
      regexp: RE
    ): never

    matchAll<
      InputString extends string,
      RE extends TypedRegExp,
      REParts extends RegExpParts = ExtractRegExpParts<RE>
    >(
      this: InputString,
      regexp: RE
    ): MatchAllRegExp<InputString, REParts['pattern'], REParts['flags']>

    /** @deprecated String.matchAll requires global flag to be set. */
    matchAll<RE extends TypedRegExp<string, never>>(regexp: RE): never

    replace<
      InputString extends string,
      RE extends TypedRegExp,
      ReplaceValue extends string,
      REParts extends RegExpParts = ExtractRegExpParts<RE>,
      MatchResult = MatchRegExp<InputString, REParts['pattern'], REParts['flags']>,
      Match extends any[] = MatchResult extends RegExpMatchResult<
        {
          matched: infer MatchArray extends any[]
          namedCaptures: [string, any]
          input: infer Input extends string
          restInput: string | undefined
        },
        {
          index: infer Index extends number
          groups: infer Groups
          input: string
          keys: (...arg: any) => any
        }
      >
        ? [...MatchArray, Index, Input, Groups]
        : never
    >(
      this: InputString,
      regexp: RE,
      replaceValue: ReplaceValue | ((...match: Match) => ReplaceValue)
    ): ReplaceWithRegExp<InputString, REParts['pattern'], ReplaceValue, REParts['flags']>
  }
}
