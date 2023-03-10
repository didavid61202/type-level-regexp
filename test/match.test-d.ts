import { ParseRegExp } from '../src/parse'
import { ExhaustiveMatch } from '../src/match'
import { MatchedResult, NullResult } from '../src/utils'
import { Flag } from '../src/regexp'

type MRE<
  MatchingString extends string,
  RE extends string,
  Flags extends Flag = never
> = ExhaustiveMatch<MatchingString, ParseRegExp<RE>, Flags>

describe('Generic type `ExhaustiveMatch` can accept flags', () => {
  it('Flag `i`, case insensitive', () => {
    expectTypeOf<
      MRE<
        'bAR-fOo-baR-baz-quX-BAr',
        '(?<g1>B[a-z]r)\\W\\b(?<g2>Fo[G-Y])(?<=foO)-(?<g3>Beh|bA(?<g4>r|k))-BAZ(?=-(?<g5>Q[O-Z]x-\\k<g3>))',
        'i'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['bAR-fOo-baR-baz', 'bAR', 'fOo', 'baR', 'R', 'quX-BAr'],
        '-quX-BAr',
        ['g1', 'bAR'] | ['g2', 'fOo'] | ['g3', 'baR'] | ['g4', 'R'] | ['g5', 'quX-BAr']
      >
    >()
  })
})

describe('Generic type `ExhaustiveMatch` can match input string with parsed RegExp to RegExp result array and groups', () => {
  it('Exact string', () => {
    expectTypeOf<MRE<'bar-foo-bar-baz-qux', 'bar'>>().toEqualTypeOf<
      MatchedResult<['bar'], '-foo-bar-baz-qux', never>
    >()
    expectTypeOf<MRE<'bar-foo-bar-baz-qux', 'ba#$r'>>().toEqualTypeOf<
      NullResult<'', unknown, true>
    >()
  })
  it('Non-Capture', () => {
    expectTypeOf<MRE<'bar-foo-bar-baz-qux', '(?:foo)-(?:bar-(?:baz))'>>().toEqualTypeOf<
      MatchedResult<['foo-bar-baz'], '-qux', never>
    >()
  })
  it('Capture', () => {
    expectTypeOf<MRE<'bar-foo-bar-baz-qux-foo', '(bar-(baz))-(qux)'>>().toEqualTypeOf<
      MatchedResult<['bar-baz-qux', 'bar-baz', 'baz', 'qux'], '-foo', never>
    >()
  })
  it('Named Capture', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >()
  })
  it('Backreference', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)-\\k<g2>-\\k<g3>'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux-baz-qux', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >()
    expectTypeOf<MRE<'foo-baaar-baaar-qux', '(?<g2>ba*r)-\\k<g2>'>>().toEqualTypeOf<
      MatchedResult<['baaar-baaar', 'baaar'], '-qux', ['g2', 'baaar']>
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)-\\k<g1>'>
    >().toEqualTypeOf<NullResult<''>>()
  })
  it('CharSet, not-charSet', () => {
    expectTypeOf<
      MRE<
        'bar-foo-βar-baz-qux-baz-qux-foo',
        '(?<g1>[Α-ω]a[a-z][!-@](?<g2>[abcde]az))-(?<g3>qu[^A-Z0-9])'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['βar-baz-qux', 'βar-baz', 'baz', 'qux'],
        '-baz-qux-foo',
        ['g1', 'βar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >()
    expectTypeOf<MRE<'foo-bar-baz-qux', 'b[A-Z]r'>>().toEqualTypeOf<NullResult<''>>()
    expectTypeOf<MRE<'foo-bar-baz-qux', 'b[abc][^r-z]'>>().toEqualTypeOf<NullResult<''>>()
  })
  it('Whitespace, non-whitespace', () => {
    expectTypeOf<
      MRE<
        'foo- \f\n\r\t\v    \u2028\u2029  　﻿-bar-qux',
        '\\s\\s\\s\\s\\s\\s\\s\\s\\s\\s\\s\\s\\s\\s\\s\\s\\Sbar\\S'
      >
    >().toEqualTypeOf<MatchedResult<[' \f\n\r\t\v    \u2028\u2029  　﻿-bar-'], 'qux', never>>()
    expectTypeOf<MRE<'bar', 'b\\sr'>>().toEqualTypeOf<NullResult<''>>()
    expectTypeOf<MRE<'bar baz', 'bar\\Sbaz'>>().toEqualTypeOf<NullResult<''>>()
  })
  it('AnyChar, char, non-char, ditig, non-digit, boundary, non-boundary', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baz-qux--123-foo',
        '(?<g1>ba.\\b-\\b(?<g2>b\\wz))\\W(?<g3>q\\Dx)\\b-\\B.\\d.(?<g4>\\d)'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux--123', 'bar-baz', 'baz', 'qux', '3'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', '3']
      >
    >()
    expectTypeOf<MRE<'bar', '....'>>().toEqualTypeOf<NullResult<''>>()
    expectTypeOf<MRE<'foo-bar', '\\wbar'>>().toEqualTypeOf<NullResult<''>>()
    expectTypeOf<MRE<'foo-bar-baz-qux', 'ba\\W'>>().toEqualTypeOf<NullResult<''>>()
    expectTypeOf<MRE<'foo-bar', 'ba\\d'>>().toEqualTypeOf<NullResult<''>>()
    expectTypeOf<MRE<'foo-bar-123', 'bar-\\D'>>().toEqualTypeOf<NullResult<''>>()
    expectTypeOf<MRE<'foo-bar-baz-qux', 'ba\\b'>>().toEqualTypeOf<NullResult<''>>()
  })
  it('Optional (Greedy)', () => {
    expectTypeOf<
      MRE<'bar-foo-bar--qx-foo', '(?<g1>ba?r-(?<g2>baz)?)-(?<g3>qu?x)?-(?<g4>qux)?'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar--qx-', 'bar-', undefined, 'qx', undefined],
        'foo',
        ['g1', 'bar-'] | ['g2', undefined] | ['g3', 'qx'] | ['g4', undefined]
      >
    >()
  })
  it('Optional (Lazy)', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz)??)-(?<g3>qu??x)??'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-', 'bar-baz', 'baz', undefined],
        'qux-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', undefined]
      >
    >()
  })
  it('ZeroOrMore (Greedy)', () => {
    expectTypeOf<
      MRE<'baaar-foo-bar-baz-bat-qux', 'ba*r-(?<g1>qu(?<g2>[a-z]-))*(?<g3>ba[r-z]-)*'>
    >().toEqualTypeOf<
      MatchedResult<
        ['baaar-', undefined, undefined, undefined],
        'foo-bar-baz-bat-qux',
        ['g1' | 'g2', undefined] | ['g3', undefined]
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baaaaw-baz-qux', 'bar-(?<g1>qu(?<g2>[a-z]-))*(?<g3>ba*[r-z])'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baaaaw', undefined, undefined, 'baaaaw'],
        '-baz-qux',
        ['g1' | 'g2', undefined] | ['g3', 'baaaaw']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-quuub-qx-quuuuuc-quf-baw-qux', 'bar-(?<g1>qu*(?<g2>[a-z]-))*(?<g3>ba[r-z])'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-quuub-qx-quuuuuc-quf-baw', 'quf-', 'f-', 'baw'],
        '-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', 'baw']
      >
    >()
  })
  it('ZeroOrMore (Lazy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-quuub-qx-quuuuuc-quf-baw-baz-bas-qux',
        'bar-(?<g1>qu*(?<g2>[a-z]-))*?baw-(?<g3>ba[r-z]-)*?'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-quuub-qx-quuuuuc-quf-baw-', 'quf-', 'f-', undefined],
        'baz-bas-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', undefined]
      >
    >()
  })
  it('OneOrMore (Greedy)', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-que-baaaaz-baat-qux', 'bar-(?<g1>qu(?<g2>[a-z]-))+(?<g3>ba+[r-z]-)+'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-que-baaaaz-baat-', 'que-', 'e-', 'baat-'],
        'qux',
        ['g1', 'que-'] | ['g2', 'e-'] | ['g3', 'baat-']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-quuub-qux-quuuuuc-quf-baw-qux', 'bar-(?<g1>qu+(?<g2>[a-z]-))+(?<g3>ba[r-z])'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-quuub-qux-quuuuuc-quf-baw', 'quf-', 'f-', 'baw'],
        '-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', 'baw']
      >
    >()
  })
  it('OneOrMore (Lazy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-quuub-qux-quuuuuc-quf-baw-baz-bas-qux',
        'bar-(?<g1>qu+?(?<g2>[a-z]-))+?baw-(?<g3>ba[r-z]-)+?'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-quuub-qux-quuuuuc-quf-baw-baz-', 'quf-', 'f-', 'baz-'],
        'bas-qux',
        ['g1', 'quf-'] | ['g2', 'f-'] | ['g3', 'baz-']
      >
    >()
  })
  it('StartOf matching string', () => {
    expectTypeOf<MRE<'bar-baz-qux-foo', '^(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>>().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '^(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<NullResult<'bar-', unknown, true>>()
  })
  it('EndOf matching string', () => {
    expectTypeOf<MRE<'bar-baz-qux', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)$'>>().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux'],
        '',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)$'>
    >().toEqualTypeOf<
      NullResult<
        'bar-baz-qux',
        {
          msg: 'not matching at the end of input string.'
        },
        true
      >
    >()
  })
  it('Lookahead (Positive)', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?=\\W(?<g4>f.[a-z]))'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux', 'foo'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', 'foo']
      >
    >()
    expectTypeOf<MRE<'bar-baz-qux', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?=-bar)'>>().toEqualTypeOf<
      NullResult<'', unknown, false>
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?=.*(?<g4>[a-c]\\wz))(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'baz', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', 'baz']
      >
    >()
  })
  it('Lookahead (Negative)', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?!-(?<g4>bar))'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux', undefined],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', undefined]
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?!-foo)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?!.*baz)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })

  it('Lookbehind (Positive)', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<=(?<g4>f.[a-z])\\W)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'foo', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', 'foo']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<=bar-)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?<=(?<g4>b\\w[^a-y])-.{3})'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux', 'baz'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', 'baz']
      >
    >()
  })
  it('Lookbehind (Negative)', () => {
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<!(?<g4>bar)-)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', undefined, 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux'] | ['g4', undefined]
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<!foo-)(?<g1>bar-(?<g2>baz))-(?<g3>qux)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?<!-foo.{6})'>
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', 'bar-baz', 'baz', 'qux'],
        '-foo',
        ['g1', 'bar-baz'] | ['g2', 'baz'] | ['g3', 'qux']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>baz))-(?<g3>qux)(?<!-foo.{12})'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })
  it('Or', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baz-qux-foo',
        '(?<g0>bar)-foo-qux|(?<g1>ba(?:r|z)-(?:b+az|(?<g2>foo)))-(?<g3>[a-f]oo|qur|qu[x-z])'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baz-qux', undefined, 'bar-baz', undefined, 'qux'],
        '-foo',
        ['g0', undefined] | ['g1', 'bar-baz'] | ['g2', undefined] | ['g3', 'qux']
      >
    >()
  })
  it('Repeat exactly n times (Greedy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baiz-bluz-brez-quuuuuxxxx-foo',
        '(?<g1>bar-(?<g2>b[a-z]{2}z-){3})(?<g3>qu{5}\\w{4})'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baiz-bluz-brez-quuuuuxxxx', 'bar-baiz-bluz-brez-', 'brez-', 'quuuuuxxxx'],
        '-foo',
        ['g1', 'bar-baiz-bluz-brez-'] | ['g2', 'brez-'] | ['g3', 'quuuuuxxxx']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>b[a-z]{2}z-))(?<g3>qu{5})'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })
  it('Repeat exactly n times (Lazy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baiz-bluz-brez-quuuuuxxxx-foo',
        '(?<g1>bar-(?<g2>b[a-z]{2}?z-){3}?)(?<g3>qu{5}?\\w{4}?)'
      >
    >().toEqualTypeOf<
      MatchedResult<
        ['bar-baiz-bluz-brez-quuuuuxxxx', 'bar-baiz-bluz-brez-', 'brez-', 'quuuuuxxxx'],
        '-foo',
        ['g1', 'bar-baiz-bluz-brez-'] | ['g2', 'brez-'] | ['g3', 'quuuuuxxxx']
      >
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>b[a-z]{2}?z-))(?<g3>qu{5}?x)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })
  it('Repeat n or more times (Greedy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        '(?<g1>bar-(?<g2>b[a-z]{2,}z-){3,})(?<g3>qu{5,}\\w{4,})'
      >
    >().toEqualTypeOf<
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
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-qux-foo', '(?<g1>bar-(?<g2>b[a-z]{2,}z-))(?<g3>qu{5,}x)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })
  it('Repeat n or more times (Lazy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        '(?<g1>bar-(?<g2>b[a-z]{2,}?z-){3,}?)(?<g3>qu{5,}?\\w{4,}?)'
      >
    >().toEqualTypeOf<
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
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-quuuuux-foo', '(?<g1>bar-(?<g2>b[a-z]{2,}?z-))(?<g3>qu{5,}?x)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })
  it('Repeat n to m times (Greedy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        '(?<g1>bar-(?<g2>b[a-z]{2,5}z-){1,5})(?<g3>qu{1,5}\\w{2,4})'
      >
    >().toEqualTypeOf<
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
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-quuux-foo', '(?<g1>bar-(?<g2>b[a-z]{2,3}z-))(?<g3>qu{2,5}x)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })
  it('Repeat n to m times (Lazy)', () => {
    expectTypeOf<
      MRE<
        'bar-foo-bar-baiez-bluraz-bremuiz-buildz-quuuuuuxxxxxx-foo',
        '(?<g1>bar-(?<g2>b[a-z]{2,5}?z-){1,5}?)(?<g3>qu{1,5}?\\w{2,4}?)'
      >
    >().toEqualTypeOf<
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
    >()
    expectTypeOf<
      MRE<'bar-foo-bar-baz-quuux-foo', '(?<g1>bar-(?<g2>b[a-z]{2,3}?z-))(?<g3>qu{2,5}?x?)'>
    >().toEqualTypeOf<NullResult<'', unknown, false>>()
  })
})
