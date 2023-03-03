import { it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'
import { createRegExp, spreadRegExpIterator } from '../src/regexp'
import { RegExpMatchResult } from '../src'

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
