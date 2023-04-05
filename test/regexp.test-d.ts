/* eslint-disable @typescript-eslint/no-unused-vars */
import { createRegExp } from '../src/index'
import type { TypedRegExp } from '../src/regexp'

describe('Function `createRegExp`', () => {
  it('Return `TypedRegExp` with pattern, parsed AST, and flags', () => {
    const RegExp = createRegExp('foo(bar)?')
    expectTypeOf(RegExp).toEqualTypeOf<
      TypedRegExp<
        'foo(bar)?',
        never,
        [
          { type: 'string'; value: 'foo' },
          {
            type: 'optional'
            greedy: true
            value: [{ type: 'capture'; value: [{ type: 'string'; value: 'bar' }] }]
          }
        ]
      >
    >()

    const RegExpFlag = createRegExp('fo+o(?:bar){2}', ['g', 'i'])
    expectTypeOf(RegExpFlag).toEqualTypeOf<
      TypedRegExp<
        'fo+o(?:bar){2}',
        'g' | 'i',
        [
          {
            type: 'string'
            value: 'f'
          },
          {
            type: 'oneOrMore'
            greedy: true
            value: [
              {
                type: 'string'
                value: 'o'
              }
            ]
          },
          {
            type: 'string'
            value: 'o'
          },
          {
            type: 'repeat'
            greedy: true
            from: '2'
            to: string
            value: [
              {
                type: 'string'
                value: 'bar'
              }
            ]
          }
        ]
      >
    >()
  })

  it('Should throw `RegExpSyntaxError`', () => {
    // @ts-expect-error `createRegExp` should throw RegExpSyntaxError<"Invalid regular expression, missing closing `)`">
    const RegExpIncompleteGroup = createRegExp('foo(bar')

    // @ts-expect-error `createRegExp` should throw RegExpSyntaxError<"Invalid regular expression, missing closing `]`">
    const RegExpClosingBracket = createRegExp('foo[a-zbar')
  })

  it('`.match()` on invalid RegExp should infer as `never`', () => {
    const InvalidSyntaxMatchResult = 'foobar'.match(
      // @ts-expect-error `createRegExp` should throw RegExpSyntaxError<"Invalid regular expression, missing closing `)`">
      createRegExp('foo(bar')
    )
    expectTypeOf(InvalidSyntaxMatchResult).toEqualTypeOf<never>()
  })
})
