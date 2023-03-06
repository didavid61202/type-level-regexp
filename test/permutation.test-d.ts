import { ParseRegExp } from '../src/parse'
import { PermutationResult, ResolvePermutation } from '../src/permutation'
import { MergeUnion } from './helper'

type PRE<RegExp extends string> = ResolvePermutation<ParseRegExp<RegExp>> extends PermutationResult<
  infer ResultArray,
  infer NamedCaptures
>
  ? {
      resultArray: MergeUnion<ResultArray> //? Merge union of result arrays only for testing to show more concise result.
      namedCapture: NamedCaptures[0] extends infer Names //? Merge union of group tuple only for testing to show more concise result.
        ? Names extends never
          ? never
          : [Names, Extract<NamedCaptures, [Names, any]>[1]]
        : never
    }
  : never

describe('Generic type `ResolvePermutation<[ParsedRegExp]>` can Permutate all possible matches of', () => {
  it('Exact string', () => {
    expectTypeOf<PRE<'foo'>>().toEqualTypeOf<{
      resultArray: ['foo']
      namedCapture: never
    }>()
  })
  it('Non-Capture groups', () => {
    expectTypeOf<PRE<'(?:foo_(?:bar)_baz)'>>().toEqualTypeOf<{
      resultArray: ['foo_bar_baz']
      namedCapture: never
    }>()
  })
  it('Capture groups', () => {
    expectTypeOf<PRE<'(foo_(bar)_(baz))'>>().toEqualTypeOf<{
      resultArray: ['foo_bar_baz', 'foo_bar_baz', 'bar', 'baz']
      namedCapture: never
    }>()
  })
  it('Named capture groups', () => {
    expectTypeOf<PRE<'(?<g1>foo_(?<g2>bar)_(?:baz))'>>().toEqualTypeOf<{
      resultArray: ['foo_bar_baz', 'foo_bar_baz', 'bar']
      namedCapture: ['g1', 'foo_bar_baz'] | ['g2', 'bar']
    }>()
  })
  it('Backreference', () => {
    expectTypeOf<PRE<'(?<g1>foo_(?<g2>bar)_(?:baz))_g2:\\k<g2>_g1:\\k<g1>'>>().toEqualTypeOf<{
      resultArray: ['foo_bar_baz_g2:bar_g1:foo_bar_baz', 'foo_bar_baz', 'bar']
      namedCapture: ['g1', 'foo_bar_baz'] | ['g2', 'bar']
    }>()
  })
  it('CharSet, not-charSet', () => {
    expectTypeOf<PRE<'(?<charSet>[2-4a-c#β-ε])_(?<nonCharSet>[^A-Z])'>>().toEqualTypeOf<{
      resultArray: [
        (
          | '2_[any char NOT in [A-Z]]'
          | '3_[any char NOT in [A-Z]]'
          | '4_[any char NOT in [A-Z]]'
          | 'a_[any char NOT in [A-Z]]'
          | 'b_[any char NOT in [A-Z]]'
          | 'c_[any char NOT in [A-Z]]'
          | '#_[any char NOT in [A-Z]]'
          | 'β_[any char NOT in [A-Z]]'
          | 'γ_[any char NOT in [A-Z]]'
          | 'δ_[any char NOT in [A-Z]]'
          | 'ε_[any char NOT in [A-Z]]'
        ),
        '2' | '3' | '4' | 'a' | 'b' | 'c' | '#' | 'β' | 'γ' | 'δ' | 'ε',
        '[any char NOT in [A-Z]]'
      ]
      namedCapture:
        | ['charSet', 'c' | '2' | '4' | '#' | '3' | 'a' | 'b' | 'ε' | 'β' | 'γ' | 'δ']
        | ['nonCharSet', '[any char NOT in [A-Z]]']
    }>()
  })
  it('AnyChar, Char, non-char, ditig, non-digit, boundary', () => {
    expectTypeOf<
      PRE<'(?<any>.)_(?<char>\\w)_(?<nonChar>\\W)_(?<digit>\\d)_(?<nonDigit>\\D)_(?<boundary>\\b)'>
    >().toEqualTypeOf<{
      resultArray: [
        (
          | `[any char]_[any word char]_[any non-char]_${number}_[any non-digit]_[boundary]`
          | '[any char]_[any word char]_[any non-char]_[any digit]_[any non-digit]_[boundary]'
        ),
        '[any char]',
        '[any word char]',
        '[any non-char]',
        `${number}` | '[any digit]',
        '[any non-digit]',
        '[boundary]'
      ]
      namedCapture:
        | ['any', '[any char]']
        | ['char', '[any word char]']
        | ['nonChar', '[any non-char]']
        | ['digit', '[any digit]' | `${number}`]
        | ['nonDigit', '[any non-digit]']
        | ['boundary', '[boundary]']
    }>()
  })
  it('Optional (Greedy)', () => {
    expectTypeOf<PRE<'(?<g1>fo?o_(?<g2>bar_)?)baz'>>().toEqualTypeOf<{
      resultArray: [
        'fo_baz' | 'foo_baz' | 'fo_bar_baz' | 'foo_bar_baz',
        'fo_' | 'foo_' | 'fo_bar_' | 'foo_bar_',
        'bar_' | undefined
      ]
      namedCapture: ['g1', 'fo_' | 'foo_' | 'fo_bar_' | 'foo_bar_'] | ['g2', 'bar_' | undefined]
    }>()
  })
  it('Optional (Lazy)', () => {
    expectTypeOf<PRE<'(?<g1>fo??o_(?<g2>bar_)??)(?<g3>baz)??'>>().toEqualTypeOf<{
      resultArray: [
        'fo_' | 'foo_' | 'fo_bar_' | 'foo_bar_',
        'fo_' | 'foo_' | 'fo_bar_' | 'foo_bar_',
        'bar_',
        undefined
      ]
      namedCapture:
        | ['g1', 'fo_' | 'foo_' | 'fo_bar_' | 'foo_bar_']
        | ['g2', 'bar_']
        | ['g3', undefined]
    }>()
  })
  it('ZeroOrMore (Greedy)', () => {
    expectTypeOf<PRE<'(?<g1>foo)_(?<g2>bar)*'>>().toEqualTypeOf<{
      resultArray: [
        'foo_' | 'foo_bar' | `foo_bar${string}bar` | 'foo_[ zero or more of `bar` ]',
        'foo',
        'bar' | undefined
      ]
      namedCapture: ['g1', 'foo'] | ['g2', 'bar' | undefined]
    }>()
  })
  it('ZeroOrMore (Lazy)', () => {
    expectTypeOf<PRE<'(?<g1>foo)*?_(?<g2>bar)*?'>>().toEqualTypeOf<{
      resultArray: [
        '_' | 'foo_' | `foo${string}foo_` | '[ zero or more of `foo` ]_',
        'foo' | undefined,
        undefined
      ]
      namedCapture: ['g1', 'foo' | undefined] | ['g2', undefined]
    }>()
  })
  it('OneOrMore (Greedy)', () => {
    expectTypeOf<PRE<'(?<g1>foo)+_(?<g2>bar)+'>>().toEqualTypeOf<{
      resultArray: [
        (
          | 'foo_bar'
          | `foo_bar${string}bar`
          | 'foo_[ one or more of `bar` ]'
          | `foo${string}foo_bar`
          | `foo${string}foo_bar${string}bar`
          | `foo${string}foo_[ one or more of \`bar\` ]`
          | '[ one or more of `foo` ]_bar'
          | `[ one or more of \`foo\` ]_bar${string}bar`
          | '[ one or more of `foo` ]_[ one or more of `bar` ]'
        ),
        'foo',
        'bar'
      ]
      namedCapture: ['g1', 'foo'] | ['g2', 'bar']
    }>()
  })
  it('OneOrMore (lazy)', () => {
    expectTypeOf<PRE<'(?<g1>foo)+?_(?<g2>bar)+?'>>().toEqualTypeOf<{
      resultArray: [
        'foo_bar' | `foo${string}foo_bar` | '[ one or more of `foo` ]_bar',
        'foo',
        'bar'
      ]
      namedCapture: ['g1', 'foo'] | ['g2', 'bar']
    }>()
  })
  it('StartOf/EndOf matching string', () => {
    expectTypeOf<PRE<'^(?<g1>foo)_(?<g2>bar)'>>().toEqualTypeOf<{
      resultArray: ['foo_bar' | 'Start with [foo_bar]', 'foo', 'bar']
      namedCapture: ['g1', 'foo'] | ['g2', 'bar']
    }>()
    expectTypeOf<PRE<'(?<g1>foo)_(?<g2>bar)$'>>().toEqualTypeOf<{
      resultArray: ['foo_bar' | 'End with [foo_bar]', 'foo', 'bar']
      namedCapture: ['g1', 'foo'] | ['g2', 'bar']
    }>()
    expectTypeOf<PRE<'^(?<g1>foo)_(?<g2>bar)$'>>().toEqualTypeOf<{
      resultArray: ['foo_bar' | 'Start with [End with [foo_bar]]', 'foo', 'bar']
      namedCapture: ['g1', 'foo'] | ['g2', 'bar']
    }>()
  })
  it('Lookahead (Positive)', () => {
    expectTypeOf<PRE<'(?<g1>foo)(?=(?<g2>bar))'>>().toEqualTypeOf<{
      resultArray: ['foo' | 'foo[following pattern contain: [bar] ]', 'foo', 'bar']
      namedCapture: ['g1', 'foo'] | ['g2', 'bar']
    }>()
  })
  it('Lookahead (Negative)', () => {
    expectTypeOf<PRE<'(?<g1>foo)(?!(?<g2>bar))'>>().toEqualTypeOf<{
      resultArray: ['foo' | 'foo[following pattern not contain: [bar] ]', 'foo', undefined]
      namedCapture: ['g1', 'foo'] | ['g2', undefined]
    }>()
  })
  it('Lookbehind (Positive)', () => {
    expectTypeOf<PRE<'(?<=(?<g1>foo))(?<g2>bar)'>>().toEqualTypeOf<{
      resultArray: ['bar' | '[previous pattern contain: [foo] ]bar', 'foo', 'bar']
      namedCapture: ['g1', 'foo'] | ['g2', 'bar']
    }>()
  })
  it('Lookbehind (Negative)', () => {
    expectTypeOf<PRE<'(?<!(?<g1>foo))(?<g2>bar)'>>().toEqualTypeOf<{
      resultArray: ['bar' | '[previous pattern not contain: [foo] ]bar', undefined, 'bar']
      namedCapture: ['g1', undefined] | ['g2', 'bar']
    }>()
  })
  it('Or', () => {
    expectTypeOf<PRE<'(?<g1>(?<g2>foo)|(?<g3>bar))_(?<g4>baz|qux)'>>().toEqualTypeOf<{
      resultArray: [
        'foo_qux' | 'foo_baz' | 'bar_qux' | 'bar_baz',
        'foo' | 'bar',
        'foo' | undefined,
        'bar' | undefined,
        'baz' | 'qux'
      ]
      namedCapture:
        | ['g1', 'bar' | 'foo']
        | ['g2', 'foo' | undefined]
        | ['g3', 'bar' | undefined]
        | ['g4', 'qux' | 'baz']
    }>()
  })
  it('Repeat exactly n times (Greedy)', () => {
    expectTypeOf<PRE<'foo_(?<g1>bar|(?<g2>qux)){2}_baz'>>().toEqualTypeOf<{
      resultArray: [
        'foo_quxqux_baz' | 'foo_quxbar_baz' | 'foo_barqux_baz' | 'foo_barbar_baz',
        'bar' | 'qux',
        'qux' | undefined
      ]
      namedCapture: ['g1', 'bar' | 'qux'] | ['g2', 'qux' | undefined]
    }>()
  })
  it('Repeat exactly n times (Lazy)', () => {
    expectTypeOf<PRE<'foo_(?<g1>bar|(?<g2>qux)){2}?_baz'>>().toEqualTypeOf<{
      resultArray: [
        'foo_quxqux_baz' | 'foo_quxbar_baz' | 'foo_barqux_baz' | 'foo_barbar_baz',
        'bar' | 'qux',
        'qux' | undefined
      ]
      namedCapture: ['g1', 'bar' | 'qux'] | ['g2', 'qux' | undefined]
    }>()
  })
  it('Repeat n or more times (Greedy)', () => {
    expectTypeOf<PRE<'(?<g1>foo){2,}_(?<g2>bar){0,}'>>().toEqualTypeOf<{
      resultArray: [
        (
          | 'foofoo_'
          | 'foofoofoo_'
          | `foofoofoo${string}foo_`
          | '[ repeat `foo` 2 to unlimited times ]_'
          | 'foofoo_bar'
          | `foofoo_bar${string}bar`
          | 'foofoo_[ repeat `bar` 0 to unlimited times ]'
          | 'foofoofoo_bar'
          | `foofoofoo_bar${string}bar`
          | 'foofoofoo_[ repeat `bar` 0 to unlimited times ]'
          | `foofoofoo${string}foo_bar`
          | `foofoofoo${string}foo_bar${string}bar`
          | `foofoofoo${string}foo_[ repeat \`bar\` 0 to unlimited times ]`
          | '[ repeat `foo` 2 to unlimited times ]_bar'
          | `[ repeat \`foo\` 2 to unlimited times ]_bar${string}bar`
          | '[ repeat `foo` 2 to unlimited times ]_[ repeat `bar` 0 to unlimited times ]'
        ),
        'foo',
        'bar' | undefined
      ]
      namedCapture: ['g1', 'foo'] | ['g2', 'bar' | undefined]
    }>()
  })
  it('Repeat n or more times (Lazy)', () => {
    expectTypeOf<PRE<'(?<g1>foo){2,}?_(?<g2>bar){0,}?'>>().toEqualTypeOf<{
      resultArray: [
        (
          | 'foofoo_'
          | 'foofoofoo_'
          | `foofoofoo${string}foo_`
          | '[ repeat `foo` 2 to unlimited times ]_'
        ),
        'foo',
        undefined
      ]
      namedCapture: ['g1', 'foo'] | ['g2', undefined]
    }>()
  })
  it('Repeat n to m times (Greedy)', () => {
    expectTypeOf<PRE<'(?<g1>foo){1,3}_(?<g2>bar){0,2}'>>().toEqualTypeOf<{
      resultArray: [
        (
          | 'foo_'
          | 'foofoo_'
          | 'foofoofoo_'
          | 'foo_bar'
          | 'foo_barbar'
          | 'foofoo_bar'
          | 'foofoo_barbar'
          | 'foofoofoo_bar'
          | 'foofoofoo_barbar'
        ),
        'foo',
        'bar' | undefined
      ]
      namedCapture: ['g1', 'foo'] | ['g2', 'bar' | undefined]
    }>()
  })
  it('Repeat n to m times (Lazy)', () => {
    expectTypeOf<PRE<'(?<g1>foo){1,3}?_(?<g2>bar){0,2}?'>>().toEqualTypeOf<{
      resultArray: ['foo_' | 'foofoo_' | 'foofoofoo_', 'foo', undefined]
      namedCapture: ['g1', 'foo'] | ['g2', undefined]
    }>()
  })
})

//TODO: add more complex/edge cases:
// type RegexAST = ParseRegexp<'1(2)a(b(c)?d(e)*f)gh(?:i){1,3}jk'>
// type RegexAST = ParseRegexp<'1a(b(?<g1>3|6|9)[^di](?<g2>x|y))\\k<g1>e\\k<g2>f'>
// type RegexAST = ParseRegexp<'1(?:(?:(x)|y))*2'>
// type RegexAST = ParseRegexp<'1(?<g1>foo)+?'>
//    ^?
