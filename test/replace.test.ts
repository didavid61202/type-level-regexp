import { createRegExp, spreadRegExpIterator } from '../src/regexp'

/* eslint-disable @typescript-eslint/no-unused-vars */
const replacePrecedes = 'abC1d2eyyxyec1oopopc2d2ere'.replace(
  //     ^?
  createRegExp('c(?<g1>(?<inner>1|2)d)2', ['g', 'i']),
  '[$<inner>]'
)

const RE = createRegExp(
  '(?<protocal>https?)(:\\/\\/)(?:www.)?(?<secondDomain>[a-zA-Z0-9@:%._+~#=]{2,40})\\.(?<topDomain>[a-z]{2,6})(?<path>\\/[a-zA-Z0-9@:%._+~#=]{2,20})*'
)

const replaceURL =
  //     ^?
  `Checkout https://nuxt.com/docs, it's the best docs with clear and concise explaining, and excellent examples!`
    .replace(RE, '$<protocal>$2$<secondDomain>.new')
    .replace(createRegExp("it's the (.{2,10}) docs"), 'it has the $1 starter templates, all')
    .match(RE)

replaceURL.index
//          ^?
replaceURL.length
//          ^?
replaceURL.groups
//          ^?
replaceURL[4]
//         ^?
const outOfIndex = replaceURL['8']
//          ^?
