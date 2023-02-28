import { ConcatToFirstElement, Matcher, NameCaptureValue, NamedCapturesTuple } from './utils'

export type PermutationResult<
  MatchArray extends string[],
  NamedCaptures extends NamedCapturesTuple
> = {
  results: MatchArray
  namedCapture: NamedCaptures
}

export type ResolvePermutation<
  Matchers extends Matcher[],
  MatchResultArray extends string[] = [''],
  NamedCaptures extends NamedCapturesTuple = never,
  CurrentIndex extends any[] = [],
  CurrentMatcher extends Matcher = Matchers[CurrentIndex['length']]
> = CurrentMatcher extends {
  type: infer Type extends 'string' | 'backreference'
  value: infer StringValue extends string
}
  ? ResolvePermutation<
      Matchers,
      ConcatToFirstElement<
        MatchResultArray,
        Type extends 'backreference' ? NameCaptureValue<NamedCaptures, StringValue> : StringValue
      >,
      NamedCaptures,
      [...CurrentIndex, '']
    >
  : CurrentMatcher extends {
      type: infer Type extends 'capture' | 'namedCapture'
      value: infer GroupMatchers extends Matcher[]
      name?: infer GroupName extends string
    }
  ? ResolvePermutation<GroupMatchers> extends infer Result
    ? Result extends PermutationResult<
        [infer ResultString extends string, ...infer Captures extends any[]],
        infer NextedNamedCapture
      >
      ? ResultString extends ResultString
        ? ResolvePermutation<
            Matchers,
            [
              ...ConcatToFirstElement<MatchResultArray, ResultString>,
              ...[ResultString],
              ...Captures
            ],
            | NamedCaptures
            | NextedNamedCapture
            | (Type extends 'namedCapture' ? [GroupName, ResultString] : never),
            [...CurrentIndex, '']
          >
        : never
      : never
    : never
  : CurrentMatcher extends {
      type: 'optional'
      value: infer OptionalMatchers extends Matcher[]
    }
  ? ResolvePermutation<OptionalMatchers> extends PermutationResult<
      infer OptionalResult extends string[],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        ConcatToFirstElement<MatchResultArray, OptionalResult[0] | ''>,
        NamedCaptures | NextedNamedCapture,
        [...CurrentIndex, '']
      >
    : never
  : CurrentMatcher extends {
      type: 'or'
      value: infer OrMatchersArray extends Matcher[][]
    }
  ? OrMatchersArray[number] extends infer OrMatchers extends Matcher[]
    ? ResolvePermutation<OrMatchers> extends PermutationResult<
        infer OrResult extends string[],
        infer NextedNamedCapture
      >
      ? ResolvePermutation<
          Matchers,
          ConcatToFirstElement<MatchResultArray, OrResult[0]>,
          NamedCaptures | NextedNamedCapture,
          [...CurrentIndex, '']
        >
      : never
    : never
  : CurrentMatcher extends {
      type: infer Type extends 'zeroOrMore' | 'oneOrMore'
      value: infer Matchers extends Matcher[]
    }
  ? ResolvePermutation<Matchers> extends PermutationResult<
      infer ZeroOrMoreResult extends string[],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        | ConcatToFirstElement<
            MatchResultArray,
            | (Type extends 'zeroOrMore' ? '' : never)
            | ZeroOrMoreResult[0]
            | `${ZeroOrMoreResult[0]}${string}${ZeroOrMoreResult[0]}`
          >
        | ConcatToFirstElement<
            MatchResultArray,
            `[${Type extends 'zeroOrMore' ? 'zero' : 'one'} or more of \`${ZeroOrMoreResult[0]}\`]`
          >,
        NamedCaptures | NextedNamedCapture,
        [...CurrentIndex, '']
      >
    : never
  : PermutationResult<MatchResultArray, NamedCaptures>
