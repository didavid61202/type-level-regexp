/* eslint-disable @typescript-eslint/no-unused-vars */
const replacePrecedes = 'abc1d2eyyxyec1oopopc2d2ere'.replace(
  //     ^?
  '/c(?<g1>(?<inner>1|2)d)2/g',
  '[$<inner>]'
)

const RE =
  '/(?<protocal>https?)(:\\/\\/)(?:www.)?(?<second-domain>[a-zA-Z0-9@:%._+~#=]{2,40})\\.(?<top-domain>[a-z]{2,6})(?<path>\\/[a-zA-Z0-9@:%._+~#=]{2,20})*/'

const replaceURL =
  //     ^?
  `Checkout https://nuxt.com/docs, it's the best docs with clear and concise explaining, and excellent examples`
    .replace(RE, '$<protocal>$2$<second-domain>.new')
    .replace("/it's the (.{2,10}) docs/", 'it has the $1 starter templates, all')
    .match(RE)

replaceURL.index
//          ^?
replaceURL.length
//          ^?
replaceURL.groups
//          ^?
replaceURL[3]
//         ^?
const outOfIndex = replaceURL['6']
//          ^?

//
