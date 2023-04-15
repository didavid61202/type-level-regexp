import type { RegExpSyntaxError, ParseRegExp } from './parse'
import type { Matcher } from './utils'
import type { ExhaustiveMatch, GlobalMatch } from './match'
import type { PermutationResult, PrependAndUnionToAll, ResolvePermutation } from './permutation'
import type { GlobalReplace, ResolveRepalceValue } from './replace'
import type { LengthOfString, MatchedResult, NamedCapturesTuple, NullResult } from './utils'

export type { Matcher } from './utils'
export type { ParseRegExp } from './parse'
export type { ExhaustiveMatch, GlobalMatch } from './match'
export type { ResolvePermutation } from './permutation'

export type Flag = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

export type TypedRegExp<
  RegExpPattern extends string,
  Flags extends Flag,
  ParsedRegExpAST extends Matcher[]
> = RegExp & {
  regexp: RegExpPattern
  flags: Flags
  parsedRegExpAST: ParsedRegExpAST
}

export type RegExpIterableIterator<MatchedTuple extends any[]> = Omit<
  IterableIterator<MatchedTuple[number]>,
  'next'
> & {
  _matchedTuple: MatchedTuple
  next: () => IteratorResult<MatchedTuple[number], MatchedTuple[number] | undefined>
}

export type ValidateRegExpSyntaxError<
  RawRegExpPattern extends string,
  RegExpParsedResult extends Matcher[] | RegExpSyntaxError<any> = ParseRegExp<RawRegExpPattern>
> = RegExpParsedResult extends RegExpSyntaxError<any> ? RegExpParsedResult : RawRegExpPattern

export function createRegExp<
  RegExpPattern extends string,
  Flags extends Flag = never,
  RegExpParsedResult extends Matcher[] = ParseRegExp<RegExpPattern>
>(pattern: ValidateRegExpSyntaxError<RegExpPattern>, flags?: Flags[] | Set<Flags>) {
  return new RegExp(pattern, [...(flags || '')].join('')) as TypedRegExp<
    RegExpPattern,
    Flags,
    RegExpParsedResult
  >
}

export function spreadRegExpMatchArray<
  MatchArray extends
    | {
        [Symbol.iterator]: () => IterableIterator<any>
        _matchArray: any[]
      }
    | null
    | undefined
>(matchArray: MatchArray) {
  return (matchArray ? [...matchArray] : null) as MatchArray extends {
    [Symbol.iterator]: () => IterableIterator<any>
    _matchArray: any[]
  }
    ? MatchArray['_matchArray']
    : null
}

export function spreadRegExpIterator<Iter extends Iterable<any> & { _matchedTuple: any }>(
  iterableIterator: Iter
) {
  return [...iterableIterator] as Iter extends { _matchedTuple: infer Tuple } ? Tuple : never
}

export type MatchRegExp<
  InputString extends string,
  ParsedRegExpAST extends Matcher[],
  Flags extends Flag
> = string extends InputString
  ? ResolvePermutation<ParsedRegExpAST> extends PermutationResult<
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
  ? GlobalMatch<InputString, ParsedRegExpAST, Flags>
  : ExhaustiveMatch<InputString, ParsedRegExpAST, Flags> extends infer Result
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
  ParsedRegExpAST extends Matcher[],
  Flags extends Flag,
  MatchedResultTuple extends any[] = [],
  InitialInputString extends string = InputString
> = ParsedRegExpAST extends ParsedRegExpAST
  ? string extends InputString
    ? ResolvePermutation<ParsedRegExpAST> extends PermutationResult<
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
    : ExhaustiveMatch<InputString, ParsedRegExpAST, Flags> extends infer Result
    ? Result extends MatchedResult<
        infer MatchArray extends any[],
        infer RestInputString extends string,
        infer NamedCaptures extends NamedCapturesTuple
      >
      ? MatchAllRegExp<
          RestInputString,
          ParsedRegExpAST,
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
          InitialInputString
        >
      : RegExpIterableIterator<MatchedResultTuple>
    : never
  : never

export type ReplaceWithRegExp<
  InputString extends string,
  ParsedRegExpAST extends Matcher[],
  ReplaceValue extends string,
  Flags extends Flag
> = 'g' extends Flags
  ? GlobalReplace<InputString, ParsedRegExpAST, ReplaceValue, Flags>
  : ExhaustiveMatch<InputString, ParsedRegExpAST, Flags> extends infer Result
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
