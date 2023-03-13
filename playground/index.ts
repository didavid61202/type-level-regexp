/**
 *
 * Note:
 * Recommend to install vscode extension `vscode-twoslash-queries` for better DX,
 * the extenstion will show inline type hints right after a special comment `// ^?`
 *
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createRegExp,
  spreadRegExpIterator,
  spreadRegExpMatchArray,
  MatchRegExp,
  ReplaceWithRegExp,
  ParseRegExp,
} from 'type-level-regexp'
import { Equal, Expect } from '../test/helper'

/**
 * `MatchRegExp` Generic type can match given input string with RegExp pattern.
 */
type MatchResult = MatchRegExp<
  'MypA$3W0rd',
  '^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$',
  never
>

type MatchTest = [
  Expect<Equal<MatchResult['2'], 'W'>>,
  //                        ^?
  Expect<Equal<MatchResult['index'], 0>>,
  //                        ^?
  Expect<Equal<MatchResult['length'], 5>>,
  //                        ^?
  Expect<
    Equal<
      MatchResult['groups'],
      //            ^?
      {
        digit: '0'
        lower: 'd'
        upper: 'W'
        special: '$'
      }
    >
  >
]

/**
 * `ReplaceWithRegExp` Generic type can match and replace given input string with RegExp pattern
 *  and a replace value (may contain special charaters: $&, &~, $', $n or $<groupName>)
 */
type ReplaceReulst = ReplaceWithRegExp<
  //    ^?
  'foo-bar-baz',
  '(?<=f[a-z]O\\W)b(?<g1>[A|B])r',
  'qux-$&-$`d$<g1>o',
  'i'
>

type ReplaceTest = [
  Expect<Equal<ReplaceReulst, 'foo-qux-bar-foo-dao-baz'>>
  //             ^?
]

/**
 * Example of chaining multiple `replace` and `match`
 */
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

type ChainedResultTest = [
  Expect<Equal<(typeof chainedResult)[4], 'nuxt'>>,
  //                                  ^?
  Expect<Equal<typeof chainedResult.index, 19>>,
  //                                  ^?
  Expect<Equal<typeof chainedResult.length, 7>>,
  //                                  ^?
  Expect<
    Equal<
      typeof chainedResult.input,
      //                    ^?
      "Check out the Nuxt starter templates site at https://nuxt.new 💚 it's the best place to start a new awesome website of any kind 💚, and it has some clear and concise starter templates 🚀, with excellent examples that make web development a breeze! 💚"
    >
  >,
  Expect<
    Equal<
      typeof chainedResult.groups,
      //                    ^?
      {
        type: 'starter templates'
        protocal: 'https'
        secondDomain: 'nuxt'
        topDomain: 'new'
        path: undefined
      }
    >
  >
]

/**
 * string.replace with function as second argument,
 * the arguments of the function can infer matched result of given string and RegExp
 */
const dateString = '"The day 1991-09-15 is a Sunday"'.replace(
  //    ^?
  createRegExp(
    '(?<=\\W)(?<prefix>(?:\\w|\\s)*?)(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})(?<suffix>(?:\\w|\\s)*)\\W'
  ),
  (match, prefix, year, month, day, suffix, offeset, input, groups) =>
    `In [${input}], match ${match} at index: ${offeset} is ISO 8601. can also format as: ${prefix}${groups.day}/${month}/${groups.year}${suffix} (day = ${day} and year = ${year})`
)

type ReplaceWithFunctionTest = Expect<
  Equal<
    typeof dateString,
    '"In ["The day 1991-09-15 is a Sunday"], match The day 1991-09-15 is a Sunday" at index: 1 is ISO 8601. can also format as: The day 15/09/1991 is a Sunday (day = 15 and year = 1991)'
  >
>

/**
 * `ParseRegExp` generic type parse the input raw RegExp string to AST,
 * provide an easily way to work with RegExp at type-level.
 */
type Parsed = ParseRegExp<'(?<g1>foo)_(?<g2>bar_(?<g3>baz))'>
//     ^?

type ParsedTest = [
  Expect<
    Equal<
      Parsed,
      [
        {
          type: 'namedCapture'
          name: 'g1'
          value: [
            {
              type: 'string'
              value: 'foo'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'namedCapture'
          name: 'g2'
          value: [
            {
              type: 'string'
              value: 'bar_'
            },
            {
              type: 'namedCapture'
              name: 'g3'
              value: [
                {
                  type: 'string'
                  value: 'baz'
                }
              ]
            }
          ]
        }
      ]
    >
  >
]

/**
 * string.matchAll now return as type `RegExpIterableIterator`,
 * which can be spread by helper function `spreadRegExpIterator`
 * to get a type-safe tuple if match results
 */
const matchAllResult = `12av3B8cdWY-B8Cd 4599xYxAq3b8CDyZ-b8cD 89`.matchAll(
  //     ^?
  createRegExp('a[^e-g]3(?<g1>b8cD)([w-z]{2})-\\k<g1>\\s', ['i', 'g'])
)

const [
  firstMatch,
  //^?
  secondMatch,
  //^?
] = spreadRegExpIterator(matchAllResult)

type MatchAllRsesultTest = [
  Expect<Equal<(typeof firstMatch)[2], 'WY'>>,
  //                               ^?
  Expect<Equal<typeof firstMatch.index, 2>>,
  //                               ^?
  Expect<Equal<typeof firstMatch.length, 3>>,
  //                               ^?
  Expect<Equal<(typeof secondMatch)[1], 'b8CD'>>,
  //                                ^?
  Expect<Equal<typeof secondMatch.index, 24>>,
  //                               ^?
  Expect<Equal<typeof secondMatch.groups.g1, 'b8CD'>>
  //                                     ^?
]

/**
 * string.matchAll accept union of RegExp pattern and retrun union of `RegExpIterableIterator`,
 * which can be spread with helper function `spreadRegExpIterator` to obtain an array of
 * `RegExpMatchResult`, which can then be spread again with helper function `spreadRegExpMatchArray`.
 */
declare const fileTypes: 'pdf' | 'docx' | 'txt'
declare const prefix: '(?<date>\\d{4}-\\d{2}-\\d{2})' | '(?<id>[A-Z]{2}\\d{6})'

const IterOfMatchedFiles =
  `PO033543-document.txt, 2023-03-12-report.pdf, MO001234-memo.docx, 2020-01-02-notes.doc, 2019-09-21-receipt.pdf,`.matchAll(
    createRegExp(`\\b${prefix}-(?<filename>\\w+)(?<ext>\\.${fileTypes})`, ['g'])
  )

const spreadedMatchedFile = spreadRegExpIterator(IterOfMatchedFiles)

const [firstSpreadedMatched, secondSpreadedMatched] = [
  spreadRegExpMatchArray(spreadedMatchedFile[0]),
  spreadRegExpMatchArray(spreadedMatchedFile[1]),
]

type UnionOfMatchAllRsesultTest = [
  Expect<
    Equal<
      typeof firstSpreadedMatched,
      | ['2023-03-12-report.pdf', '2023-03-12', 'report', '.pdf']
      | ['MO001234-memo.docx', 'MO001234', 'memo', '.docx']
      | ['PO033543-document.txt', 'PO033543', 'document', '.txt']
      | null
    >
  >,
  Expect<
    Equal<
      typeof secondSpreadedMatched,
      ['2019-09-21-receipt.pdf', '2019-09-21', 'receipt', '.pdf'] | null
    >
  >,
  Expect<Equal<NonNullable<(typeof spreadedMatchedFile)[0]>['index'], 0 | 23 | 46>>,
  Expect<Equal<NonNullable<(typeof spreadedMatchedFile)[1]>['index'], 88>>,
  Expect<Equal<NonNullable<(typeof spreadedMatchedFile)[0]>['length'], 4>>,
  Expect<
    Equal<
      NonNullable<(typeof spreadedMatchedFile)[1]>['groups'],
      { date: '2019-09-21'; filename: 'receipt'; ext: '.pdf' }
    >
  >
]
