/* eslint-disable @typescript-eslint/no-unused-vars */
import { ParseRegexp } from '../src/parse'
import { ResolvePermutation } from '../src/permutation'
import { Equal, Expect } from './helper'

type Tests = [
  /** Exact string */
  Expect<Equal<ResolvePermutation<ParseRegexp<'foo'>>['results'], ['foo']>>,

  /** Non-Capture */
  Expect<Equal<ResolvePermutation<ParseRegexp<'(?:foo-(?:bar)-baz)'>>['results'], ['foo-bar-baz']>>,

  /** Capture */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'(foo-(bar)-(baz))'>>['results'],
      ['foo-bar-baz', 'foo-bar-baz', 'bar', 'baz']
    >
  >,

  /** Named Capture */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'(?<g1>foo-(?<g2>bar)-(?:baz))'>>['results'],
      ['foo-bar-baz', 'foo-bar-baz', 'bar']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'(?<g1>foo-(?<g2>bar)-(?:baz))'>>['namedCapture'],
      ['g1', 'foo-bar-baz'] | ['g2', 'bar']
    >
  >,

  /** Backreference */
  Expect<
    Equal<
      ResolvePermutation<
        ParseRegexp<'(?<g1>foo-(?<g2>bar)-(?:baz))_g2:\\k<g2>_g1:\\k<g1>'>
      >['results'],
      ['foo-bar-baz_g2:bar_g1:foo-bar-baz', 'foo-bar-baz', 'bar']
    >
  >,

  /** CharSet, not-charSet */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'[2-4a-c#]_[^A-Z]'>>['results'],
      [
        | '2_[any char NOT in [A-Z]]'
        | '3_[any char NOT in [A-Z]]'
        | '4_[any char NOT in [A-Z]]'
        | 'a_[any char NOT in [A-Z]]'
        | 'b_[any char NOT in [A-Z]]'
        | 'c_[any char NOT in [A-Z]]'
        | '#_[any char NOT in [A-Z]]'
      ]
    >
  >,

  /** AnyChar, Char, non-char, ditig, non-digit*/
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'._\\w_\\W_\\d_\\D'>>['results'],
      [
        | `[any char]_[any word char]_[any non-char]_${number}_[any non-digit]`
        | '[any char]_[any word char]_[any non-char]_[any digit]_[any non-digit]'
      ]
    >
  >,

  /** Optional (Greedy) */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'(fo?o-(?<g1>bar-)?)baz'>>['results'],
      | ['fo-baz', 'fo-', 'bar-']
      | ['foo-baz', 'foo-', 'bar-']
      | ['fo-bar-baz', 'fo-bar-', 'bar-']
      | ['foo-bar-baz', 'foo-bar-', 'bar-']
      | ['fo-baz', 'fo-', undefined]
      | ['foo-baz', 'foo-', undefined]
      | ['fo-bar-baz', 'fo-bar-', undefined]
      | ['foo-bar-baz', 'foo-bar-', undefined]
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'(fo?o-(?<g1>bar-)?)baz'>>['namedCapture'],
      ['g1', 'bar-'] | ['g1', undefined]
    >
  >,

  /** Optional (Lazy) */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'(fo??o-(?<g1>bar-)??)baz'>>['results'],
      ['fo-baz', 'fo-', undefined]
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'(fo??o-(?<g1>bar-)??)baz'>>['namedCapture'],
      ['g1', undefined]
    >
  >,

  /** ZeroOrMore (Greedy) */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'1(?<g1>foo)*'>>['results'],
      | ['1' | '1foo' | `1foo${string}foo` | '1[ zero or more of `foo` ]', 'foo']
      | ['1' | '1foo' | `1foo${string}foo` | '1[ zero or more of `foo` ]', undefined]
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'1(?<g1>foo)*'>>['namedCapture'],
      ['g1', 'foo'] | ['g1', undefined]
    >
  >,

  /** ZeroOrMore (Lazy) */
  Expect<Equal<ResolvePermutation<ParseRegexp<'1(?<g1>foo)*?'>>['results'], ['1', undefined]>>,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'1(?<g1>foo)*?2'>>['results'],
      | ['12' | '1foo2' | `1foo${string}foo2` | '1[ zero or more of `foo` ]2', 'foo']
      | ['12' | '1foo2' | `1foo${string}foo2` | '1[ zero or more of `foo` ]2', undefined]
    >
  >,
  Expect<
    Equal<ResolvePermutation<ParseRegexp<'1(?<g1>foo)*?'>>['namedCapture'], ['g1', undefined]>
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'1(?<g1>foo)*?2'>>['namedCapture'],
      ['g1', 'foo'] | ['g1', undefined]
    >
  >,

  /** oneOrMore (Greedy) */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'1(?<g1>foo)+'>>['results'],
      ['1foo' | `1foo${string}foo` | '1[ one or more of `foo` ]', 'foo']
    >
  >,
  Expect<Equal<ResolvePermutation<ParseRegexp<'1(?<g1>foo)+'>>['namedCapture'], ['g1', 'foo']>>,

  /** oneOrMore (lazy) */
  Expect<Equal<ResolvePermutation<ParseRegexp<'1(?<g1>foo)+?'>>['results'], ['1foo', 'foo']>>,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'1(?<g1>foo)+?2'>>['results'],
      ['1foo2' | `1foo${string}foo2` | '1[ one or more of `foo` ]2', 'foo']
    >
  >,
  Expect<Equal<ResolvePermutation<ParseRegexp<'1(?<g1>foo)+?2'>>['namedCapture'], ['g1', 'foo']>>,

  /** StartOf / EndOf matching string */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'^foo-(bar)'>>['results'],
      ['foo-bar' | 'Start with [foo-bar]', 'bar']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(bar)$'>>['results'],
      ['foo-bar' | 'End with [foo-bar]', 'bar']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'^foo-(bar)$'>>['results'],
      ['foo-bar' | 'Start with [End with [foo-bar]]', 'bar']
    >
  >,
  Expect<Equal<ResolvePermutation<ParseRegexp<'^foo-(?<g1>bar)$'>>['namedCapture'], ['g1', 'bar']>>,

  /** Lookahead (positive/negative) */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo(?=(?<g1>bar))'>>['results'],
      ['foo' | 'foo[following pattern contain: [bar] ]']
    >
  >,
  Expect<
    Equal<ResolvePermutation<ParseRegexp<'foo(?=(?<g1>bar))'>>['namedCapture'], ['g1', 'bar']>
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo(?!(?<g1>bar))'>>['results'],
      ['foo' | 'foo[following pattern not contain: [bar] ]']
    >
  >,

  /** Lookbehind (positive/negative) */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo(?<=(?<g1>bar))'>>['results'],
      ['foo' | 'foo[previous pattern contain: [bar] ]']
    >
  >,
  Expect<
    Equal<ResolvePermutation<ParseRegexp<'foo(?=(?<g1>bar))'>>['namedCapture'], ['g1', 'bar']>
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo(?<!(?<g1>bar))'>>['results'],
      ['foo' | 'foo[previous pattern not contain: [bar] ]']
    >
  >,

  /** Or */
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|baz)-fao'>>['results'],
      ['foo-bar-fao', 'bar'] | ['foo-baz-fao', 'baz']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|baz)-fao'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'baz']
    >
  >,

  /** Repeat exactly n times (Greedy)*/
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2}-baz'>>['results'],
      | ['foo-barbar-baz', 'bar']
      | ['foo-barqux-baz', 'qux']
      | ['foo-quxbar-baz', 'bar']
      | ['foo-quxqux-baz', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2}-baz'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,

  /** Repeat exactly n times (Lazy)*/
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2}?'>>['results'],
      ['foo-barbar', 'bar'] | ['foo-barqux', 'qux'] | ['foo-quxbar', 'bar'] | ['foo-quxqux', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2}?'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2}?-baz'>>['results'],
      | ['foo-barbar-baz', 'bar']
      | ['foo-barqux-baz', 'qux']
      | ['foo-quxbar-baz', 'bar']
      | ['foo-quxqux-baz', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2}?-baz'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,

  /** Repeat n or more times (Greedy)*/
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,}-baz'>>['results'],
      | [
          (
            | 'foo-bar-baz'
            | 'foo-barbar-baz'
            | `foo-barbar${string}bar-baz`
            | 'foo-[ repeat `bar` unlimited times ]-baz'
          ),
          'bar'
        ]
      | [
          (
            | 'foo-bar-baz'
            | 'foo-barqux-baz'
            | `foo-barqux${string}qux-baz`
            | 'foo-[ repeat `qux` unlimited times ]-baz'
          ),
          'bar'
        ]
      | [
          (
            | 'foo-bar-baz'
            | 'foo-barqux-baz'
            | `foo-barqux${string}qux-baz`
            | 'foo-[ repeat `qux` unlimited times ]-baz'
          ),
          'qux'
        ]
      | [
          (
            | 'foo-qux-baz'
            | 'foo-quxqux-baz'
            | `foo-quxqux${string}qux-baz`
            | 'foo-[ repeat `qux` unlimited times ]-baz'
          ),
          'qux'
        ]
      | [
          (
            | 'foo-qux-baz'
            | 'foo-quxbar-baz'
            | `foo-quxbar${string}bar-baz`
            | 'foo-[ repeat `bar` unlimited times ]-baz'
          ),
          'bar'
        ]
      | [
          (
            | 'foo-qux-baz'
            | 'foo-quxbar-baz'
            | `foo-quxbar${string}bar-baz`
            | 'foo-[ repeat `bar` unlimited times ]-baz'
          ),
          'qux'
        ]
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,}-baz'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,

  /** Repeat n or more times (Lazy)*/
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2,}?'>>['results'],
      ['foo-barbar', 'bar'] | ['foo-barqux', 'qux'] | ['foo-quxbar', 'bar'] | ['foo-quxqux', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2,}?'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2,}?-baz'>>['results'],
      | ['foo-quxqux-baz', 'qux']
      | ['foo-quxbar-baz', 'bar']
      | ['foo-barqux-baz', 'qux']
      | ['foo-barbar-baz', 'bar']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){2,}?-baz'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,

  /** Repeat n to m times (Greedy)*/
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,2}-baz'>>['results'],
      | ['foo-bar-baz' | 'foo-barbar-baz' | 'foo-barqux-baz', 'bar']
      | ['foo-bar-baz' | 'foo-barbar-baz' | 'foo-barqux-baz', 'qux']
      | ['foo-qux-baz' | 'foo-quxbar-baz' | 'foo-quxqux-baz', 'bar']
      | ['foo-qux-baz' | 'foo-quxbar-baz' | 'foo-quxqux-baz', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,2}-baz'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,

  /** Repeat n to m times (Lazy)*/
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,2}?'>>['results'],
      ['foo-qux', 'qux'] | ['foo-bar', 'bar']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,2}?'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,2}?-baz'>>['results'],
      ['foo-qux-baz', 'qux'] | ['foo-bar-baz', 'bar']
    >
  >,
  Expect<
    Equal<
      ResolvePermutation<ParseRegexp<'foo-(?<g1>bar|qux){1,2}?-baz'>>['namedCapture'],
      ['g1', 'bar'] | ['g1', 'qux']
    >
  >
]

type matchers = ParseRegexp<'foo-(?<g1>bar|qux){1,2}?'>
type testResult = ResolvePermutation<matchers>['results']
//    ^?
type testNamedCapture = ResolvePermutation<matchers>['namedCapture']
//    ^?

// const test: testzsdf[1] = ''
// //     ^?

//TODO: add more complex/edge cases:
// type RegexAST = ParseRegexp<'1(2)a(b(c)?d(e)*f)gh(?:i){1,3}jk'>
// type RegexAST = ParseRegexp<'1a(b(?<g1>3|6|9)[^di](?<g2>x|y))\\k<g1>e\\k<g2>f'>
// type RegexAST = ParseRegexp<'1(?:(?:(x)|y))*2'>
// type RegexAST = ParseRegexp<'1(?<g1>foo)+?'>
//    ^?
