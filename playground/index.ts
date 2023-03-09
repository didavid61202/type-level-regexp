/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createRegExp,
  spreadRegExpIterator,
  MatchRegExp,
  ReplaceWithRegExp,
  ParseRegExp,
} from 'type-level-regexp'

/**
 *
 * Note:
 * Recommend to install vscode extension `vscode-twoslash-queries` for better DX,
 * the extenstion will show inline type hints right after a special comment `// ^?`
 *
 */

type MatchResult = MatchRegExp<
  'MypA$3W0rd',
  '^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$',
  never
>

type Match = [
  MatchResult['2'],
  //           ^?
  MatchResult['index'],
  //             ^?
  MatchResult['length'],
  //             ^?
  MatchResult['groups']
  //             ^?
]

type ReplaceReulst = ReplaceWithRegExp<
  //    ^?
  'foo-bar-baz',
  '(?<=f[a-z]O\\W)b(?<g1>[A|B])r',
  'qux-$&-$`d$<g1>o',
  'i'
>

const RE = createRegExp(
  '(?<=Nuxt )(?<type>.{4,}?) site at (?<protocal>https?)(:\\/\\/)(?:www.)?(?<secondDomain>[a-zA-Z0-9@:%._+~#=]{2,40})\\.(?<topDomain>[a-z]{2,6})(?<path>\\/[a-zA-Z0-9@:%._+~#=]{2,20})*'
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

const result = [
  chainedResult[4],
  //            ^?
  chainedResult.index,
  //             ^?
  chainedResult.length,
  //             ^?
  chainedResult.input,
  //             ^?
]

type Parsed = ParseRegExp<'(?<g1>foo)_(?<g2>bar_(?<g3>baz))'>
//     ^?

const matchAllResult = `12av3B8cdWY-B8Cd4599xYxAq3b8CDyZ-b8cD89`.matchAll(
  //     ^?
  createRegExp('a[^e-g]3(?<g1>b8cD)([w-z]{2})-\\k<g1>', ['i', 'g'])
)

const [
  firstMatch,
  //^?
  secondMatch,
  //^?
] = spreadRegExpIterator(matchAllResult)

const result2 = [
  firstMatch.index,
  //           ^?
  firstMatch[2],
  //         ^?
  firstMatch.length,
  //           ^?
  secondMatch.groups.g1,
  //                ^?
  secondMatch.index,
  //           ^?
]
