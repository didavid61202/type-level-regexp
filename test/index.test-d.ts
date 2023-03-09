import { RegExpMatchResult } from '../src'
import { createRegExp } from '../src/regexp'


describe('Pass some common / complex examples', () => {
  it('match password RegExp', () => {
    const match = 'ad@3od9Msq'.match(
      createRegExp(
        '^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$'
      )
    )
    expect(match).toMatchInlineSnapshot(`
      [
        "ad@3od9Msq",
        "q",
        "M",
        "9",
        "@",
      ]
    `)
    expectTypeOf(match).toEqualTypeOf<
      RegExpMatchResult<{
        matched: ['ad@3od9Msq', 'q', 'M', '9', '@']
        namedCaptures: ['lower', 'q'] | ['upper', 'M'] | ['digit', '9'] | ['special', '@']
        input: 'ad@3od9Msq'
        restInput: ''
      }>
    >()
    expect(match[3]).toMatchInlineSnapshot('"9"')
    expectTypeOf(match[3]).toEqualTypeOf<'9'>()

    // @ts-expect-error out of range index can't be used to index `RegExpMatchResult`
    expect(match[10]).toMatchInlineSnapshot('undefined')

    expect(match.length).toMatchInlineSnapshot('5')
    expectTypeOf(match.length).toEqualTypeOf<5>()

    expect(match.index).toMatchInlineSnapshot('0')
    expectTypeOf(match.index).toEqualTypeOf<0>()

    expect(match.groups).toMatchInlineSnapshot(`
      {
        "digit": "9",
        "lower": "q",
        "special": "@",
        "upper": "M",
      }
    `)
    expectTypeOf(match.groups).toEqualTypeOf<{
      digit: '9'
      lower: 'q'
      special: '@'
      upper: 'M'
    }>()
  })
})

describe('<literal-string>.match() show exact same literal value for RegExp matched array, index and group as runtime', () => {
  it('match RegExp with common tokens and quantifiers', () => {
    const match = 'start_faoo_bar_.#_barbar_9453_endddd'.match(
      createRegExp(
        '^start_(?<g1>f[a-z]?o{2}_(?=.*\\d)(?<g2>ba+(?:r|z)))_\\b[!-.]{1,}\\b_\\k<g2>{1,3}_(?<g3>\\d{4,})_end{2,6}?$'
      )
    )
    expect(match).toMatchInlineSnapshot(`
      [
        "start_faoo_bar_.#_barbar_9453_endddd",
        "faoo_bar",
        "bar",
        "9453",
      ]
    `)
    expectTypeOf(match).toEqualTypeOf<
      RegExpMatchResult<{
        matched: ['start_faoo_bar_.#_barbar_9453_endddd', 'faoo_bar', 'bar', '9453']
        namedCaptures: ['g1', 'faoo_bar'] | ['g2', 'bar'] | ['g3', '9453']
        input: 'start_faoo_bar_.#_barbar_9453_endddd'
        restInput: ''
      }>
    >()

    expect(match[3]).toMatchInlineSnapshot('"9453"')
    expectTypeOf(match[3]).toEqualTypeOf<'9453'>()

    // @ts-expect-error out of range index can't be used to index `RegExpMatchResult`
    expect(match[10]).toMatchInlineSnapshot('undefined')

    expect(match.length).toMatchInlineSnapshot('4')
    expectTypeOf(match.length).toEqualTypeOf<4>()

    expect(match.index).toMatchInlineSnapshot('0')
    expectTypeOf(match.index).toEqualTypeOf<0>()

    expect(match.groups).toMatchInlineSnapshot(`
      {
        "g1": "faoo_bar",
        "g2": "bar",
        "g3": "9453",
      }
    `)
    expectTypeOf(match.groups).toEqualTypeOf<{
      g1: 'faoo_bar'
      g2: 'bar'
      g3: '9453'
    }>()
  })

  it('support global `g` flag', () => {
    const matchGlobal = 'foo_bar_baz_qux_ber_foo_boir_boz'.match(
      createRegExp('b[a-z]{1,4}r', ['g'])
    )
    expect(matchGlobal).toMatchInlineSnapshot(`
      [
        "bar",
        "ber",
        "boir",
      ]
    `)
    expectTypeOf(matchGlobal).toEqualTypeOf<['bar', 'ber', 'boir']>()
  })

  it('support case insensitive `i` flag', () => {
    const matchCaseInsensitive = 'bAn-bAR-fOo-baR-baz-quX-BAr-duck-BAaER-For-bEH-baz-qtX-Beh'.match(
      createRegExp(
        '(?<g1>B[a-z]{1,3}r)\\W\\b(?<g2>Fo[G-Y])(?<=fo[g-y])-(?<g3>Beh|bA(?<g4>r|k))-BAZ(?=-(?<g5>Q[O-Z]x-\\k<g3>))',
        ['i']
      )
    )
    expect(matchCaseInsensitive).toMatchInlineSnapshot(`
      [
        "bAR-fOo-baR-baz",
        "bAR",
        "fOo",
        "baR",
        "R",
        "quX-BAr",
      ]
    `)
    expectTypeOf(matchCaseInsensitive).toEqualTypeOf<
      RegExpMatchResult<{
        matched: ['bAR-fOo-baR-baz', 'bAR', 'fOo', 'baR', 'R', 'quX-BAr']
        namedCaptures:
          | ['g1', 'bAR']
          | ['g2', 'fOo']
          | ['g3', 'baR']
          | ['g4', 'R']
          | ['g5', 'quX-BAr']
        input: 'bAn-bAR-fOo-baR-baz-quX-BAr-duck-BAaER-For-bEH-baz-qtX-Beh'
        restInput: '-quX-BAr-duck-BAaER-For-bEH-baz-qtX-Beh'
      }>
    >()

    expect(matchCaseInsensitive[3]).toMatchInlineSnapshot('"baR"')
    expectTypeOf(matchCaseInsensitive[3]).toEqualTypeOf<'baR'>()

    // @ts-expect-error out of range index can't be used to index `RegExpMatchResult`
    expect(matchCaseInsensitive[10]).toMatchInlineSnapshot('undefined')

    expect(matchCaseInsensitive.length).toMatchInlineSnapshot('6')
    expectTypeOf(matchCaseInsensitive.length).toEqualTypeOf<6>()

    expect(matchCaseInsensitive.index).toMatchInlineSnapshot('4')
    expectTypeOf(matchCaseInsensitive.index).toEqualTypeOf<4>()

    expect(matchCaseInsensitive.groups).toMatchInlineSnapshot(`
      {
        "g1": "bAR",
        "g2": "fOo",
        "g3": "baR",
        "g4": "R",
        "g5": "quX-BAr",
      }
    `)
    expectTypeOf(matchCaseInsensitive.groups).toEqualTypeOf<{
      g1: 'bAR'
      g2: 'fOo'
      g3: 'baR'
      g4: 'R'
      g5: 'quX-BAr'
    }>()

    const matchGlobalCaseInsensitive =
      'bAn-bAR-fOo-baR-baz-quX-BAr-duck-BAaER-For-bEH-baz-qtX-Beh'.match(
        createRegExp(
          '(?<g1>B[a-z]{1,3}r)\\W\\b(?<g2>Fo[G-Y])(?<=fo[g-y])-(?<g3>Beh|bA(?<g4>r|k))-BAZ(?=-(?<g5>Q[O-Z]x-\\k<g3>))',
          ['i', 'g']
        )
      )

    expect(matchGlobalCaseInsensitive).toMatchInlineSnapshot(`
      [
        "bAR-fOo-baR-baz",
        "BAaER-For-bEH-baz",
      ]
    `)
    expectTypeOf(matchGlobalCaseInsensitive).toEqualTypeOf<
      ['bAR-fOo-baR-baz', 'BAaER-For-bEH-baz']
    >()
  })
})
