import {
  ConcatToFirstElement,
  IndexOf,
  Matcher,
  NameCaptureValue,
  NamedCapturesTuple,
  ResolveCharSet,
  ResolveOrCaptureTuple,
  StrintToUnion,
} from './utils'

export type PermutationResult<
  MatchArray extends (string | undefined)[],
  NamedCaptures extends NamedCapturesTuple
> = {
  results: MatchArray
  namedCapture: NamedCaptures
}

interface LiteralCharSetMap<
  CharSet extends string = string,
  ResolvedCharSet extends string = ResolveCharSet<CharSet>
> {
  any: '[any char]'
  char: '[any word char]'
  nonChar: '[any non-char]'
  digit: `${number}` | '[any digit]'
  nonDigit: '[any non-digit]'
  charSet: StrintToUnion<ResolvedCharSet>
  notCharSet: `[any char NOT in [${CharSet}]]`
  boundary: '[boundary]'
}

export type ResolvePermutation<
  Matchers extends Matcher[],
  MatchResultArray extends (string | undefined)[] = [''],
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
      type: infer Type extends keyof LiteralCharSetMap
      value?: infer CharSet extends string
    }
  ? ResolvePermutation<
      Matchers,
      ConcatToFirstElement<MatchResultArray, LiteralCharSetMap<CharSet>[Type]>,
      NamedCaptures,
      [...CurrentIndex, '']
    >
  : CurrentMatcher extends {
      type: infer Type extends 'startOf' | 'endOf'
      value: infer StartEndMatchers extends Matcher[]
    }
  ? ResolvePermutation<StartEndMatchers> extends PermutationResult<
      infer StartEndResult extends string[],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        ConcatToFirstElement<
          MatchResultArray,
          | Exclude<StartEndResult[0], `End with${string}`>
          | (Extract<
              `${Type extends 'startOf' ? 'Start' : 'End'} with [${StartEndResult[0]}]`,
              `Start with [End with${string}`
            > extends never
              ? `${Type extends 'startOf' ? 'Start' : 'End'} with [${StartEndResult[0]}]`
              : Extract<
                  `${Type extends 'startOf' ? 'Start' : 'End'} with [${StartEndResult[0]}]`,
                  `Start with [End with${string}`
                >)
        >,
        NamedCaptures | NextedNamedCapture,
        [...CurrentIndex, '']
      >
    : never
  : CurrentMatcher extends {
      type: infer Type extends 'lookahead' | 'lookbehind'
      positive: infer Positive extends boolean
      value: infer LookaroundMatchers extends Matcher[]
    }
  ? ResolvePermutation<LookaroundMatchers> extends PermutationResult<
      infer LookaroundResult extends string[],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        ConcatToFirstElement<
          MatchResultArray,
          | `[${Type extends 'lookahead' ? 'following' : 'previous'} pattern${Positive extends true
              ? ''
              : ' not'} contain: [${LookaroundResult[0]}] ]`
          | ''
        >,
        NamedCaptures | NextedNamedCapture,
        [...CurrentIndex, '']
      >
    : never
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
      [infer ResultString extends string, ...infer Captures extends any[]],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        [...ConcatToFirstElement<MatchResultArray, ResultString | ''>, ...Captures],
        NamedCaptures | NextedNamedCapture,
        [...CurrentIndex, '']
      >
    : never
  : CurrentMatcher extends {
      type: 'or'
      value: infer OrMatchersArray extends Matcher[][]
    }
  ? OrMatchersArray[number] extends infer OrMatchers extends Matcher[]
    ? OrMatchers extends OrMatchers
      ? ResolvePermutation<OrMatchers> extends PermutationResult<
          [infer ResultString extends string, ...infer Captures extends any[]],
          infer NextedNamedCapture
        >
        ? ResolvePermutation<
            Matchers,
            [
              ...ConcatToFirstElement<MatchResultArray, ResultString>,
              ...ResolveOrCaptureTuple<
                OrMatchersArray,
                Captures,
                IndexOf<OrMatchersArray, OrMatchers>
              >
            ],
            NamedCaptures | NextedNamedCapture,
            [...CurrentIndex, '']
          >
        : never
      : never
    : never
  : CurrentMatcher extends {
      type: infer Type extends 'zeroOrMore' | 'oneOrMore'
      value: infer AnyOrMoreMatchers extends Matcher[]
    }
  ? ResolvePermutation<AnyOrMoreMatchers> extends PermutationResult<
      [infer ResultString extends string, ...infer Captures extends any[]],
      infer NextedNamedCapture
    >
    ? ResultString extends ResultString
      ? ResolvePermutation<
          Matchers,
          [
            ...(
              | ConcatToFirstElement<
                  MatchResultArray,
                  | (Type extends 'zeroOrMore' ? '' : never)
                  | ResultString
                  | `${ResultString}${string}${ResultString}`
                >
              | ConcatToFirstElement<
                  MatchResultArray,
                  `[ ${Type extends 'zeroOrMore' ? 'zero' : 'one'} or more of \`${ResultString}\` ]`
                >
            ),
            ...Captures
          ],
          NamedCaptures | NextedNamedCapture,
          [...CurrentIndex, '']
        >
      : never
    : never
  : PermutationResult<MatchResultArray, NamedCaptures>
