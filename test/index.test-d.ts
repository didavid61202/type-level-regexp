import { RegExpMatchResult } from '../src'
import { createRegExp } from '../src/regexp'


describe('Common, complex examples', () => {
  it('Remain type-safe after chain of replace and match', () => {
    const RE = createRegExp(
      '(?<=Nuxt\\s)(?<type>.{4,}?) site at (?<protocal>https?)(:\\/\\/)(?:www.)?(?<secondDomain>[a-zA-Z0-9@:%._+~#=]{2,40})\\.(?<topDomain>[a-z]{2,6})(?<path>\\/[a-zA-Z0-9@:%._+~#=]{2,20})*'
    )

    const chainedResult =
      //     ^?
      `Check out the Nuxt documentation 📖 site at https://nuxt.com/docs 👉 it's the best resource for clear and concise explanations, with excellent examples that make web development a breeze! ❤️`
        .replace(RE, 'starter templates site at $<protocal>$3$<secondDomain>.new')
        .replace(
          createRegExp("it's the BeSt resource f[A-Z]r (.{10,20})explanations", ['i']),
          "it's the best place to start a new awesome website of any kind ❤️, and it has some $1starter templates 🚀"
        )
        .replace(createRegExp('❤️|👉', ['g']), '💚')
        .match(RE)

    expect(chainedResult).toMatchInlineSnapshot(`
      [
        "starter templates site at https://nuxt.new",
        "starter templates",
        "https",
        "://",
        "nuxt",
        "new",
        undefined,
      ]
    `)
    expectTypeOf(chainedResult).toEqualTypeOf<
      RegExpMatchResult<{
        matched: [
          'starter templates site at https://nuxt.new',
          'starter templates',
          'https',
          '://',
          'nuxt',
          'new',
          undefined
        ]
        namedCaptures:
          | ['type', 'starter templates']
          | ['protocal', 'https']
          | ['secondDomain', 'nuxt']
          | ['topDomain', 'new']
          | ['path', undefined]
        input: "Check out the Nuxt starter templates site at https://nuxt.new 💚 it's the best place to start a new awesome website of any kind 💚, and it has some clear and concise starter templates 🚀, with excellent examples that make web development a breeze! 💚"
        restInput: " 💚 it's the best place to start a new awesome website of any kind 💚, and it has some clear and concise starter templates 🚀, with excellent examples that make web development a breeze! 💚"
      }>
    >()

    expect(chainedResult.input).toMatchInlineSnapshot(
      '"Check out the Nuxt starter templates site at https://nuxt.new 💚 it\'s the best place to start a new awesome website of any kind 💚, and it has some clear and concise starter templates 🚀, with excellent examples that make web development a breeze! 💚"'
    )
    expectTypeOf(
      chainedResult.input
    ).toEqualTypeOf<"Check out the Nuxt starter templates site at https://nuxt.new 💚 it's the best place to start a new awesome website of any kind 💚, and it has some clear and concise starter templates 🚀, with excellent examples that make web development a breeze! 💚">()

    expect(chainedResult[4]).toMatchInlineSnapshot('"nuxt"')
    expectTypeOf(chainedResult[4]).toEqualTypeOf<'nuxt'>()

    // @ts-expect-error out of range index can't be used to index `RegExpMatchResult`
    expect(chainedResult[10]).toMatchInlineSnapshot('undefined')

    expect(chainedResult.length).toMatchInlineSnapshot('7')
    expectTypeOf(chainedResult.length).toEqualTypeOf<7>()

    expect(chainedResult.index).toMatchInlineSnapshot('19')
    expectTypeOf(chainedResult.index).toEqualTypeOf<19>()

    expect(chainedResult.groups).toMatchInlineSnapshot(`
      {
        "path": undefined,
        "protocal": "https",
        "secondDomain": "nuxt",
        "topDomain": "new",
        "type": "starter templates",
      }
    `)

    expectTypeOf(chainedResult.groups).toEqualTypeOf<{
      path: undefined
      protocal: 'https'
      secondDomain: 'nuxt'
      topDomain: 'new'
      type: 'starter templates'
    }>()
  })

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

  it('string.replace with special replacement patterns', () => {
    const replaced = '"The day 1991-09-15 is a Sunday"'.replace(
      createRegExp('(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})'),
      "$&$', is in ISO 8601 standard date format. Which we can also format it as common date format: $`$<day>/$2/$<year>"
    )
    expect(replaced).toMatchInlineSnapshot(
      '"\\"The day 1991-09-15 is a Sunday\\", is in ISO 8601 standard date format. Which we can also format it as common date format: \\"The day 15/09/1991 is a Sunday\\""'
    )
    expectTypeOf(
      replaced
    ).toEqualTypeOf<'"The day 1991-09-15 is a Sunday", is in ISO 8601 standard date format. Which we can also format it as common date format: "The day 15/09/1991 is a Sunday"'>()
  })

  it('string.replace with function', () => {
    const replaced = 'Note: "The day 1991-09-15 is a Sunday"'.replace(
      createRegExp(
        '(?<=Note: )(?<prefix>.*?)(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})(?<suffix>.*)$'
      ),
      (match, prefix, year, month, day, suffix, offeset, inputString, groups) =>
        `In [${inputString}], the text ${match} at index:${offeset} uses ISO 8601 standard date format. Which we can also format it as common date format: ${prefix}${groups.day}/${month}/${groups.year}${suffix}, with the day [${day}] at first place and the year [${year}] at the end`
    )

    expect(replaced).toMatchInlineSnapshot(
      '"Note: In [Note: \\"The day 1991-09-15 is a Sunday\\"], the text \\"The day 1991-09-15 is a Sunday\\" at index:6 uses ISO 8601 standard date format. Which we can also format it as common date format: \\"The day 15/09/1991 is a Sunday\\", with the day [15] at first place and the year [1991] at the end"'
    )
    expectTypeOf(
      replaced
    ).toEqualTypeOf<'Note: In [Note: "The day 1991-09-15 is a Sunday"], the text "The day 1991-09-15 is a Sunday" at index:6 uses ISO 8601 standard date format. Which we can also format it as common date format: "The day 15/09/1991 is a Sunday", with the day [15] at first place and the year [1991] at the end'>()
  })

  it('string.replace with global (g) flag', () => {
    const globalReplace =
      'Here are the contacts for our agents: John Doe (123) 456-7890, jane Smith (555) 5275-5275, Alex Johnson (999) 123-4567, Sara Lee (234) 567-8901, and Mike Davis (111) 242-3683.'.replace(
        createRegExp('\\((?<area>\\d{3})\\)\\s(?<exchange>\\d{3,4})-(?<subscriber>\\d{4})', ['g']),
        ', tel: (xxx)-$2-$<subscriber>'
      )

    expect(globalReplace).toMatchInlineSnapshot(
      '"Here are the contacts for our agents: John Doe , tel: (xxx)-456-7890, jane Smith , tel: (xxx)-5275-5275, Alex Johnson , tel: (xxx)-123-4567, Sara Lee , tel: (xxx)-567-8901, and Mike Davis , tel: (xxx)-242-3683."'
    )
    expectTypeOf(
      globalReplace
    ).toEqualTypeOf<'Here are the contacts for our agents: John Doe , tel: (xxx)-456-7890, jane Smith , tel: (xxx)-5275-5275, Alex Johnson , tel: (xxx)-123-4567, Sara Lee , tel: (xxx)-567-8901, and Mike Davis , tel: (xxx)-242-3683.'>()
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

describe('<dynamic-string>.match() show permutation of all possible matching string in RegExp matched array and groups', () => {
  it('all possible matching website', () => {
    // eslint-disable-next-line prefer-const
    let dynamicString = 'https://nuxt.com/'

    const possibleMatchResult = dynamicString.match(
      createRegExp(
        '(?<protocol>https?://)(?<subdomain>(?<g1>n)(?:uxt|itro))\\.(?<domain>\\k<g1>ew|com)(?<path>/.*)?'
      )
    )
    expect(possibleMatchResult).toMatchInlineSnapshot(`
      [
        "https://nuxt.com/",
        "https://",
        "nuxt",
        "n",
        "com",
        "/",
      ]
    `)

    expectTypeOf(possibleMatchResult?.index).toEqualTypeOf<number | undefined>()

    expect(possibleMatchResult?.length).toMatchInlineSnapshot('6')
    expectTypeOf(possibleMatchResult?.length).toEqualTypeOf<6 | undefined>()

    expect(possibleMatchResult?.[2]).toMatchInlineSnapshot('"nuxt"')
    expectTypeOf(possibleMatchResult?.[2]).toEqualTypeOf<'nitro' | 'nuxt' | undefined>()

    expect(possibleMatchResult?.[4]).toMatchInlineSnapshot('"com"')
    expectTypeOf(possibleMatchResult?.[4]).toEqualTypeOf<'com' | 'new' | undefined>()

    expect(possibleMatchResult?.groups).toMatchInlineSnapshot(`
      {
        "domain": "com",
        "g1": "n",
        "path": "/",
        "protocol": "https://",
        "subdomain": "nuxt",
      }
    `)
    expectTypeOf(possibleMatchResult?.groups).toEqualTypeOf<
      | {
          domain: 'com' | 'new'
          g1: 'n'
          path:
            | '/'
            | '/[any char]'
            | `/[any char]${string}[any char]`
            | '/[ zero or more of `[any char]` ]'
            | undefined
          protocol: 'http://' | 'https://'
          subdomain: 'nitro' | 'nuxt'
        }
      | undefined
    >()
  })
})
