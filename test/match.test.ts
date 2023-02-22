import { it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'

describe('string.match', () => {
  it('return typed array and catpure groups', () => {
    const RE = '123'
    const result = '123'.match(RE)

    expectTypeOf(result).toEqualTypeOf<['123'] | null>()
  })
})
