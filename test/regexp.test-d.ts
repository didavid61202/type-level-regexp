/* eslint-disable @typescript-eslint/no-unused-vars */
import { createRegExp, spreadRegExpIterator } from '../src/index'
import type {
  RegExpMatchResult,
  TypedRegExp,
  MatchRegExp,
  MatchAllRegExp,
  Matcher,
} from '../src/regexp'

describe('`String.match` and Generic type `MatchRegExp`', () => {
  it('return `RegExpMatchResult` without global `g` flag', () => {
    expectTypeOf('foo bar fao'.match(createRegExp('f\\wo'))).toEqualTypeOf<
      RegExpMatchResult<{
        matched: ['foo']
        namedCaptures: never
        input: 'foo bar fao'
        restInput: ' bar fao'
      }>
    >()
  })

  it('return `null` if no match', () => {
    expectTypeOf('foo bar fao'.match(createRegExp('cat'))).toEqualTypeOf<null>()
  })

  it('infer as `RegExpMatchArray | null` when passing generic `Matcher[]` as `ParsedRegExpAST`', () => {
    expectTypeOf<MatchRegExp<'foobar', Matcher[], never>>().toEqualTypeOf<RegExpMatchArray | null>()
  })
})

describe('`String.matchAll` and Generic type `MatchAllRegExp`', () => {
  it('return iterableIterator of `RegExpMatchResult` if matched, can be spread using `spreadRegExpIterator` helper function', () => {
    expectTypeOf(
      spreadRegExpIterator('foo bar fao'.matchAll(createRegExp('f\\wo', ['g'])))
    ).toEqualTypeOf<
      [
        RegExpMatchResult<{
          matched: ['foo']
          namedCaptures: never
          input: 'foo bar fao'
          restInput: ' bar fao'
        }>,
        RegExpMatchResult<{
          matched: ['fao']
          namedCaptures: never
          input: 'foo bar fao'
          restInput: ''
        }>
      ]
    >()
  })

  it('return `null` if no match', () => {
    expectTypeOf('foo bar fao'.matchAll(createRegExp('cat', ['g']))).toEqualTypeOf<null>()
  })

  it('infer as `RegExpMatchArray[]` when passing generic `Matcher[]` as `ParsedRegExpAST`', () => {
    expectTypeOf<MatchAllRegExp<'foobar', Matcher[], never>>().toEqualTypeOf<RegExpMatchArray[]>()
  })
})

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

  it('Should throw `RegExpSyntaxError` for missing brackets', () => {
    // @ts-expect-error `createRegExp` should throw RegExpSyntaxError<"Invalid regular expression, missing closing `)`">
    expect(() => createRegExp('foo(bar')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /foo(bar/: Unterminated group"'
    )

    // @ts-expect-error `createRegExp` should throw RegExpSyntaxError<"Invalid regular expression, missing closing `]`">
    expect(() => createRegExp('foo[a-zbar')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /foo[a-zbar/: Unterminated character class"'
    )
  })

  it('Should throw `RegExpSyntaxError` for invalid named group syntax', () => {
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, invalid capture group name for capturing `bar`, possibly due to a missing opening '<' and group name">
    expect(() => createRegExp('foo(?>bar)')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /foo(?>bar)/: Invalid group"'
    )
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, capture group name can not be empty for capturing `bar`">
    expect(() => createRegExp('foo(?<>bar)')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /foo(?<>bar)/: Invalid capture group name"'
    )
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, invalid capture group name of `groupNamebar`, possibly due to a missing closing '>' for group name">
    expect(() => createRegExp('foo(?<groupNamebar)')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /foo(?<groupNamebar)/: Invalid capture group name"'
    )
  })

  it('Should throw `RegExpSyntaxError` for repeating non-quantifiable pattern', () => {
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, the preceding token to + is not quantifiable">
    expect(() => createRegExp('(foo)?+')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /(foo)?+/: Nothing to repeat"'
    )
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, the preceding token to * is not quantifiable">
    expect(() => createRegExp('(foo)+*')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /(foo)+*/: Nothing to repeat"'
    )
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, the preceding token to {2} is not quantifiable">
    expect(() => createRegExp('(foo)*{2}')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /(foo)*{2}/: Nothing to repeat"'
    )
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, the preceding token to {3,} is not quantifiable">
    expect(() => createRegExp('(foo)*{3,}')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /(foo)*{3,}/: Nothing to repeat"'
    )
    // @ts-expect-error `createRegExp` should throw
    // RegExpSyntaxError<"Invalid regular expression, the preceding token to {1,4} is not quantifiable">
    expect(() => createRegExp('(foo)*{1,4}')).toThrowErrorMatchingInlineSnapshot(
      '"Invalid regular expression: /(foo)*{1,4}/: Nothing to repeat"'
    )
  })

  it('`.match()` on invalid RegExp should infer as `never`', () => {
    try {
      const InvalidSyntaxMatchResult = 'foobar'.match(
        // @ts-expect-error `createRegExp` should throw RegExpSyntaxError<"Invalid regular expression, missing closing `)`">
        createRegExp('foo(bar')
      )
      expectTypeOf(InvalidSyntaxMatchResult).toEqualTypeOf<never>()
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        '[SyntaxError: Invalid regular expression: /foo(bar/: Unterminated group]'
      )
    }
  })
})
