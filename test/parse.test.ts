/* eslint-disable @typescript-eslint/no-unused-vars */
import { MatchRegExp } from '../src'
import { ParseRegExp } from '../src/parse'
import { createRegExp } from '../src/regexp'

const matchedResult =
  //     ^?
  `Checkout https://nuxt.com/docs, it's the best docs with clear and concise explaining, and excellent examples`.match(
    '/(?<protocal>https?):\\/\\/(?:www.)?(?<second-domain>[a-zA-Z0-9@:%._+~#=]{2,20})\\.(?<top-domain>[a-z]{2,6})(?<path>\\/[a-zA-Z0-9@:%._+~#=]{2,20})*/'
  )

const matchedArray = matchedResult.groups
//     ^?
const index = matchedResult.index
//      ^?

// const passswword = `aBd${'dsd'}3!fEhe2`.match(
//   //    ^?
//   '1a(b(?<g1>3|6|9)d(?<g2>x|y))\\k<g1>e\\k<g2>f'
// )

const password = `aBd5!fE#he2`.match(
  //    ^?
  createRegExp(
    '^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$'
  )
)
// const estawet = password['index']
//    ^?

// type password = MatchRegexp<
//   //    ^?
//   'aBd3!fEhe2',
//   '^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$'
// >

// type email = MatchRegexp<
//   //    ^?
//   'didavid61202@gmail.com', //'adc1', //'pfooa	b13t123qcesdlol2',
//   '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' //'a(b|d)c(?<g1>.)|.1(?<g2>2)3' //'(?<=foo)(?<first>a)\tb(?:1(?<g1>2)?3.){2,4}c(?:d|(e)|f)'
// >
