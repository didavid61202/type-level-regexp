/* eslint-disable @typescript-eslint/no-unused-vars */

import { it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'
import { createRegExp, spreadRegExpIterator } from '../src/regexp'
import { RegExpMatchResult } from '../src'
import { Equal, Expect } from './helper'
import { ParseRegExp } from '../src/parse'
import { ExhaustiveMatch } from '../src/match'
import { MatchedResult, NullResult } from '../src/utils'

type Tests = [
  /** Exact string */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-foo-bar-baz-qux', ParseRegExp<'bar'>, never>,
      MatchedResult<['bar'], '-foo-bar-baz-qux', never>
    >
  >,

  /** Exact string not matching */
  Expect<
    Equal<ExhaustiveMatch<'bar-foo-bar-baz-qux', ParseRegExp<'barrr'>, never>, NullResult<''>>
  >,

  /** Non-Capture */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-foo-bar-baz-qux', ParseRegExp<'(?:foo)-(?:bar-(?:baz))'>, never>,
      MatchedResult<['foo-bar-baz'], '-qux', never>
    >
  >,

  /** Capture */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-foo-bar-baz-qux-foo', ParseRegExp<'(bar-(baz))-(qux)'>, never>,
      MatchedResult<['bar-baz-qux', 'bar-baz', 'baz', 'qux'], '-foo', never>
    >
  >,

  /** Named Capture */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
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
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)-\\k<g2>-\\k<g3>'>,
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
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)-\\k<g1>'>,
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
        ParseRegExp<'(?<g1>[Α-ω]a[a-z][!-@](?<g2>[abcde]az))-(?<g3>qu[^A-Z0-9])'>,
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
  Expect<Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegExp<'b[A-Z]r'>, never>, NullResult<''>>>,
  Expect<
    Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegExp<'b[abc][^r-z]'>, never>, NullResult<''>>
  >,

  /** AnyChar, Char, non-char, ditig, non-digit, boundary*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-123-foo',
        ParseRegExp<'(?<g1>ba.\\b-\\b(?<g2>\\waz))\\W(?<g3>q\\Dx)-\\b\\d.(?<g4>\\d)'>,
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
  Expect<Equal<ExhaustiveMatch<'bar', ParseRegExp<'....'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar', ParseRegExp<'\\wbar'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegExp<'ba\\W'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar', ParseRegExp<'ba\\d'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar-123', ParseRegExp<'bar-\\D'>, never>, NullResult<''>>>,
  Expect<Equal<ExhaustiveMatch<'foo-bar-baz-qux', ParseRegExp<'ba\\br'>, never>, NullResult<''>>>,

  /** Optional (Greedy) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar--qx-foo',
        ParseRegExp<'(?<g1>ba?r-(?<g2>baz)?)-(?<g3>qu?x)?-(?<g4>qux)?'>,
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
        ParseRegExp<'(?<g1>bar-(?<g2>baz)??)-(?<g3>qu??x)??'>,
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
        ParseRegExp<'bar-(?<g1>qu(?<g2>[a-z]-))*(?<g3>ba[r-z])'>,
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
        ParseRegExp<'bar-(?<g1>qu(?<g2>[a-z]-))*(?<g3>ba[r-z])'>,
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
        ParseRegExp<'bar-(?<g1>qu(?<g2>[a-z]-))*?baw-(?<g3>ba[r-z]-)*?'>,
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
        ParseRegExp<'bar-(?<g1>qu(?<g2>[a-z]-))+(?<g3>ba[r-z])'>,
        never
      >,
      NullResult<''>
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-qut-baz-qux',
        ParseRegExp<'bar-(?<g1>qu(?<g2>[a-z]-))+(?<g3>ba[r-z])'>,
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
        ParseRegExp<'bar-(?<g1>qu(?<g2>[a-z]-))+(?<g3>ba[r-z])'>,
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
        ParseRegExp<'bar-(?<g1>qu(?<g2>[a-z]-))+?baw-(?<g3>ba[r-z]-)+?'>,
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
      ExhaustiveMatch<'bar-baz-qux-foo', ParseRegExp<'^(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>, never>,
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
        ParseRegExp<'^(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      NullResult<'bar-', unknown, true>
    >
  >,

  /** EndOf matching string */
  Expect<
    Equal<
      ExhaustiveMatch<'bar-baz-qux', ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)$'>, never>,
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
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)$'>,
        never
      >,
      NullResult<'bar-baz-qux', { msg: 'not matching at the end of input string.' }, true>
    >
  >,

  /** Lookahead (positive) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?=\\W(?<g4>f.[a-z]))'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux', 'foo'],
        '-foo',
        ['g2', 'baz'] | ['g1', 'bar-baz'] | ['g3', 'qux'] | ['g4', 'foo']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?=-bar)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?=.*(?<g4>baz))(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', 'baz', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', 'baz']
      >
    >
  >,

  /** Lookahead (negative) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?!-(?<g4>bar))'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux', undefined],
        '-foo',
        ['g2', 'baz'] | ['g1', 'bar-baz'] | ['g3', 'qux'] | ['g4', undefined]
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?!-foo)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?!.*baz)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,

  /** Lookbehind (positive) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<=(?<g4>f.[a-z])\\W)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', 'foo', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', 'foo']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<=bar-)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?<=(?<g4>b\\w[^a-y])-.{3})'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux', 'baz'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', 'baz']
      >
    >
  >,

  /** Lookbehind (negative) */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<!(?<g4>bar)-)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', undefined, 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', undefined]
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<!foo-)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?<!-foo.{6})'>,
        never
      >,
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
        ParseRegExp<'(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?<!-foo.{12})'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,

  /** Or */
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g0>bar)-foo-qux|(?<g1>ba(?:r|z)-(?:b+az|(?<g2>foo)))-(?<g3>[a-f]oo|qur|qu[x-z])'>,
        never
      >,
      MatchedResult<
        ['bar-baz-qux', undefined, 'bar-baz', undefined, 'qux'],
        '-foo',
        ['g0', undefined] | ['g1', 'bar-baz'] | ['g2', undefined] | ['g3', 'qux']
      >
    >
  >,

  /** Repeat exactly n times (Greedy)*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baiz-bluz-brez-quuuuuxxxx-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2}z-){3})(?<g3>qu{5}\\w{4})'>,
        never
      >,
      MatchedResult<
        ['bar-baiz-bluz-brez-quuuuuxxxx', 'bar-baiz-bluz-brez-', 'brez-', 'quuuuuxxxx'],
        '-foo',
        ['g1', 'bar-baiz-bluz-brez-'] | ['g2', 'brez-'] | ['g3', 'quuuuuxxxx']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2}z-))(?<g3>qu{5})'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,

  /** Repeat exactly n times (Lazy)*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baiz-bluz-brez-quuuuuxxxx-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2}?z-){3}?)(?<g3>qu{5}?\\w{4}?)'>,
        never
      >,
      MatchedResult<
        ['bar-baiz-bluz-brez-quuuuuxxxx', 'bar-baiz-bluz-brez-', 'brez-', 'quuuuuxxxx'],
        '-foo',
        ['g1', 'bar-baiz-bluz-brez-'] | ['g2', 'brez-'] | ['g3', 'quuuuuxxxx']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2}?z-))(?<g3>qu{5}?x)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,

  /** Repeat n or more times (Greedy)*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,}z-){3,})(?<g3>qu{5,}\\w{4,})'>,
        never
      >,
      MatchedResult<
        [
          'bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx',
          'bar-baiez-bluraz-bremuiz-buildz-',
          'buildz-',
          'quuuuuuxxxxxx'
        ],
        '-foo',
        ['g1', 'bar-baiez-bluraz-bremuiz-buildz-'] | ['g2', 'buildz-'] | ['g3', 'quuuuuuxxxxxx']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-qux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,}z-))(?<g3>qu{5,}x)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,

  /** Repeat n or more times (Lazy)*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,}?z-){3,}?)(?<g3>qu{5,}?\\w{4,}?)'>,
        never
      >,
      MatchedResult<
        [
          'bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxx',
          'bar-baiez-bluraz-bremuiz-buildz-',
          'buildz-',
          'quuuuuuxxx'
        ],
        'xxx-foo',
        ['g1', 'bar-baiez-bluraz-bremuiz-buildz-'] | ['g2', 'buildz-'] | ['g3', 'quuuuuuxxx']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-quuuuux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,}?z-))(?<g3>qu{5,}?x)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,

  /** Repeat n to m times (Greedy)*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,5}z-){1,5})(?<g3>qu{1,5}\\w{2,4})'>,
        never
      >,
      MatchedResult<
        [
          'bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxx',
          'bar-baiez-bluraz-bremuiz-buildz-',
          'buildz-',
          'quuuuuuxxx'
        ],
        'xxx-foo',
        ['g1', 'bar-baiez-bluraz-bremuiz-buildz-'] | ['g2', 'buildz-'] | ['g3', 'quuuuuuxxx']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-quuux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,3}z-))(?<g3>qu{2,5}x)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >,

  /** Repeat n to m times (Lazy)*/
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,5}?z-){1,5}?)(?<g3>qu{1,5}?\\w{2,4}?)'>,
        never
      >,
      MatchedResult<
        [
          'bar-baiez-bluraz-bremuiz-buildz-quuu',
          'bar-baiez-bluraz-bremuiz-buildz-',
          'buildz-',
          'quuu'
        ],
        'uuuxxxxxx-foo',
        ['g1', 'bar-baiez-bluraz-bremuiz-buildz-'] | ['g2', 'buildz-'] | ['g3', 'quuu']
      >
    >
  >,
  Expect<
    Equal<
      ExhaustiveMatch<
        'bar-foo-bar-baz-quuux-foo',
        ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,3}?z-))(?<g3>qu{2,5}?x?)'>,
        never
      >,
      NullResult<'', unknown, false>
    >
  >
]

type parsed = ParseRegExp<'(?=.*[a-z])(?=.*[A-Z])(?=.*[!-.])(?=.*[0-9]).{8,24}$'>

type testMatch = ExhaustiveMatch<
  'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
  ParseRegExp<'(?<g1>bar-(?<g2>b[a-z]{2,5}?z-){1,5}?)(?<g3>qu{1,5}?\\w{2,4}?)'>,
  never
>

// type matchPassword = ExhaustiveMatch<
//   //     ^?
//   'b5ar#fooDbarb5ar#foo',
//   ParseRegexp<'^(?=.*[a-z])(?=.*[A-Z])(?=.*[!-.])(?=.*\\d).{8,}$'>,
//   never
// >

// const matchAll = `12av3B8cdWY-B8Cd4599xYxAq3b8CDyZ-b8cD89`.matchAll(
//   //     ^?
//   // createRegExp('([w-z]{2})', ['i', 'g'])
//   createRegExp('a[^e-g]3(?<g1>b8cD)([w-z]{2})-\\k<g1>', ['i', 'g'])
// )

// const [
//   first,
//   //^?
//   second,
//   //^?
// ] = spreadRegExpIterator(matchAll)

// describe('string.match', () => {
//   it('return typed array and catpure groups', () => {
//     const RE = createRegExp('123')
//     const result = '123'.match(RE)

//     expectTypeOf(result).toEqualTypeOf<
//       RegExpMatchResult<{
//         matched: ['123']
//         namedCaptures: never
//         input: '123'
//         restInput: ''
//       }>
//     >()
//   })
// })
