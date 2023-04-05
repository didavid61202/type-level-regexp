import type { RegExpSyntaxError, ParseRegExp } from './parse'
import type { Matcher } from './utils'

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
