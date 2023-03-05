import { it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'
import { createRegExp, spreadRegExpIterator } from '../src/regexp'
import { RegExpMatchResult } from '../src'
import { Equal, Expect } from './helper'
import { ParseRegexp } from '../src/parse'
import { ExhaustiveMatch } from '../src/match'
import { MatchedResult, NullResult } from '../src/utils'

type Tests = [
  /** Exact string */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-foo-bar-baz-qux', ParseRegexp<'bar'>, never>,
      MatchedResult<['bar'], '-foo-bar-baz-qux', never>
    >
  >,

  /** Exact string not matching */
  Expect<
    Equal<ExhaustiveMatch<'bar-foo-bar-baz-qux', ParseRegexp<'barrr'>, never>, NullResult<''>>
  >,

  /** Non-Capture */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-foo-bar-baz-qux', ParseRegexp<'(?:foo)-(?:bar-(?:baz))'>, never>,
      MatchedResult<['foo-bar-baz'], '-qux', never>
    >
  >,

  /** Capture */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-foo-bar-baz-qux-foo', ParseRegexp<'(bar-(baz))-(qux)'>, never>,
      MatchedResult<['bar-baz-qux', 'bar-baz', 'baz', 'qux'], '-foo', never>
    >
  >,

  /** Named Capture */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegexp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >
  >,

  /** Backreference */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-baz-qux-foo',
        ParseRegexp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)-\\k<g2>-\\k<g3>'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux-baz-qux', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >
  >,

  /** Backreference not matching */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-baz-qux-foo',
        ParseRegexp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)-\\k<g1>'>,
        never
      >,
      NullResult<''>
    >
  >,

  /** CharSet, not-charSet */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-βar-baz-qux-baz-qux-foo',
        ParseRegexp<'(?<g1>[Α-ω]a[a-z][!-@](?<g2>[abcde]az))-(?<g3>qu[^A-Z0-9])'>,
        never
      >,
      MatchedResult<
        ['βar-baz-qux', 'βar-baz', 'baz', 'qux'],
        '-baz-qux-foo',
        ['g1', 'βar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >
  >,

  /** CharSet, not-charSet not matcing */
  Expect<Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegexp<'b[A-Z]r'>, never>, NullResult<''>>>,
  Expect<
    Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegexp<'b[abc][^r-z]'>, never>, NullResult<''>>
  >,

  /** AnyChar, Char, non-char, ditig, non-digit, boundary*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-123-foo',
        ParseRegexp<'(?<g1>ba.\\b-\\b(?<g2>\\waz))\\W(?<g3>q\\Dx)-\\b\\d.(?<g4>\\d)'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux-123', 'bar-baz', 'baz', 'qux', '3'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', '3']
      >
    >
  >,

  /** AnyChar, Char, non-char, ditig, non-digit, boundary not matching */
  Expect<Equal<ExhaustiveMatch<'bar', ParseRegexp<'....'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar', ParseRegexp<'\\wbar'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegexp<'ba\\W'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar', ParseRegexp<'ba\\d'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar-123', ParseRegexp<'bar-\\D'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegexp<'ba\\br'>, never>, NullResult<''>>>,

  /** Optional (Greedy) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar--qx-foo',
        ParseRegexp<'(?<g1>ba?r-(?<g2>baz)?)-(?<g3>qu?x)?-(?<g4>qux)?'>,
        never
      >,
      MatchedResult<
        ['bar--qx-', 'bar-', undefined, 'qx', undefined],
        'foo',
        ['g1', 'bar-'] | ['g2', undefined] | ['g3', 'qx'] | ['g4', undefined]
      >
    >
  >,

  /** Optional (Lazy) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegexp<'(?<g1>bar-(?<g2>baz)??)-(?<g3>qu??x)??'>,
        never
      >,
      MatchedResult<
        ['bar-baz-', 'bar-baz', 'baz', undefined],
        'qux-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', undefined]
      >
    >
  >,

  /** ZeroOrMore (Greedy) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux',
        ParseRegexp<'bar-(?<g1>qu(?<g2>[a-z]-))*(?<g3>ba[r-z])'>,
        never
      >,
      MatchedResult<
        ['bar-baz', undefined, undefined, 'baz'],
        '-qux',
        ['g1' | 'g2', undefined] | ['g3', 'baz']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-qub-qux-quc-quf-baw-qux',
        ParseRegexp<'bar-(?<g1>qu(?<g2>[a-z]-))*(?<g3>ba[r-z])'>,
        never
      >,
      MatchedResult<
        ['bar-qub-qux-quc-quf-baw', 'quf-', 'f-', 'baw'],
        '-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', 'baw']
      >
    >
  >,

  /** ZeroOrMore (Lazy) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-qub-qux-quc-quf-baw-baz-bas-qux',
        ParseRegexp<'bar-(?<g1>qu(?<g2>[a-z]-))*?baw-(?<g3>ba[r-z]-)*?'>,
        never
      >,
      MatchedResult<
        ['bar-qub-qux-quc-quf-baw-', 'quf-', 'f-', undefined],
        'baz-bas-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', undefined]
      >
    >
  >,

  /** OneOrMore (Greedy) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux',
        ParseRegexp<'bar-(?<g1>qu(?<g2>[a-z]-))+(?<g3>ba[r-z])'>,
        never
      >,
      NullResult<''>
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-qut-baz-qux',
        ParseRegexp<'bar-(?<g1>qu(?<g2>[a-z]-))+(?<g3>ba[r-z])'>,
        never
      >,
      MatchedResult<
        ['bar-qut-baz', 'qut-', 't-', 'baz'],
        '-qux',
        ['g3', 'baz'] | ['g2', 't-'] | ['g1', 'qut-']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-qub-qux-quc-quf-baw-qux',
        ParseRegexp<'bar-(?<g1>qu(?<g2>[a-z]-))+(?<g3>ba[r-z])'>,
        never
      >,
      MatchedResult<
        ['bar-qub-qux-quc-quf-baw', 'quf-', 'f-', 'baw'],
        '-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', 'baw']
      >
    >
  >,

  /** OneOrMore (Lazy) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-qub-qux-quc-quf-baw-baz-bas-qux',
        ParseRegexp<'bar-(?<g1>qu(?<g2>[a-z]-))+?baw-(?<g3>ba[r-z]-)+?'>,
        never
      >,
      MatchedResult<
        ['bar-qub-qux-quc-quf-baw-baz-', 'quf-', 'f-', 'baz-'],
        'bas-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', 'baz-']
      >
    >
  >,

  /** StartOf matching string */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-baz-qux-foo', ParseRegexp<'^(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>, never>,
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegexp<'^(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      NullResult<'bar-', unknown, true>
    >
  >,

  /** EndOf matching string */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-baz-qux', ParseRegexp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)$'>, never>,
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux'],
        '',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegexp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)$'>,
        never
      >,
      NullResult<'bar-baz-qux', undefined, true>
    >
  >
]

type parsed = ParseRegexp<'(bar-(baz))$'>

type testMatch = ExhaustiveMatch<
  //    ^?
  'bar-foo-bar-baz-qux-foo',
  ParseRegexp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)$'>,
  never
>
const matchAll = `12av3B8cdWY-B8Cd4599xYxAq3b8CDyZ-b8cD89`.matchAll(
  //     ^?
  // createRegExp('([w-z]{2})', ['i', 'g'])
  createRegExp('a[^e-g]3(?<g1>b8cD)([w-z]{2})-\\k<g1>', ['i', 'g'])
)

const [
  first,
  //^?
  second,
  //^?
] = spreadRegExpIterator(matchAll)

describe('string.match', () => {
  it('return typed array and catpure groups', () => {
    const RE = createRegExp('123')
    const result = '123'.match(RE)

    expectTypeOf(result).toEqualTypeOf<
      RegExpMatchResult<{
        matched: ['123']
        namedCaptures: never
        input: '123'
        restInput: ''
      }>
    >()
  })
})
