import type {
  ConcatToFirstElement,
  CountNumOfCaptureGroupsAs,
  ExpandRepeat,
  IndexOf,
  Matcher,
  NameCaptureValue,
  NamedCapturesTuple,
  ResolveCharSet,
  ResolveNamedCaptureUnion,
  ResolveOrCaptureTuple,
  SliceMatchers,
  StringToUnion,
  TupleItemExtendsType,
} from './utils'

export type PermutationResult<
  MatchArray extends (string | undefined)[],
  NamedCaptures extends NamedCapturesTuple
> = {
  results: MatchArray
  namedCapture: NamedCaptures
}

export type PrependAndUnionToAll<
  Arr extends (string | undefined)[],
  PrependingString extends string | undefined,
  Union,
  ResultArr extends any[] = [],
  Length extends number = Arr['length']
> = ResultArr['length'] extends Length
  ? ResultArr
  : Arr extends [
      infer First extends string | undefined,
      ...infer Rest extends (string | undefined)[]
    ]
  ? PrependAndUnionToAll<
      Rest,
      PrependingString,
      Union,
      [...ResultArr, First extends undefined ? undefined : `${PrependingString}${First}` | Union],
      Length
    >
  : []

type RepeatStringFromTo<
  RepeatingString extends string,
  From extends any[],
  To extends string,
  RepeatResult extends string = ''
> = `${From['length']}` extends To
  ? RepeatResult
  : RepeatStringFromTo<RepeatingString, [...From, ''], To, `${RepeatResult}${RepeatingString}`>

interface LiteralCharSetMap<
  CharSet extends string = string,
  ResolvedCharSet extends string = ResolveCharSet<CharSet>
> {
  whitespace: ' '
  nonWhitespace: '[non-whitespace]'
  any: '[any char]'
  char: '[any word char]'
  nonChar: '[any non-char]'
  digit: `${number}` | '[any digit]'
  nonDigit: '[non-digit]'
  charSet: StringToUnion<ResolvedCharSet>
  notCharSet: `[any char NOT in [${CharSet}]]`
  boundary: '[boundary]'
  nonBoundary: '[non-boundary]'
}

type ConcateRestMatchers<
  CurrentMatchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  CurrentIndex extends any[]
> = [
  ...(SliceMatchers<CurrentMatchers, [...CurrentIndex, '']> extends infer RM extends Matcher[]
    ? RM
    : never),
  ...OutMostRestMatchers
]

export type ResolvePermutation<
  Matchers extends Matcher[],
  OutMostRestMatchers extends Matcher[] = [],
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
      OutMostRestMatchers,
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
      OutMostRestMatchers,
      ConcatToFirstElement<MatchResultArray, LiteralCharSetMap<CharSet>[Type]>,
      NamedCaptures,
      [...CurrentIndex, '']
    >
  : CurrentMatcher extends {
      type: infer Type extends 'startOf' | 'endOf'
      value: infer StartEndMatchers extends Matcher[]
    }
  ? ResolvePermutation<StartEndMatchers> extends PermutationResult<
      [infer ResultString extends string, ...infer Captures extends any[]],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        OutMostRestMatchers,
        [
          ...ConcatToFirstElement<
            MatchResultArray,
            | Exclude<ResultString, `End with${string}`>
            | (Extract<
                `${Type extends 'startOf' ? 'Start' : 'End'} with [${ResultString}]`,
                `Start with [End with${string}`
              > extends never
                ? `${Type extends 'startOf' ? 'Start' : 'End'} with [${ResultString}]`
                : Extract<
                    `${Type extends 'startOf' ? 'Start' : 'End'} with [${ResultString}]`,
                    `Start with [End with${string}`
                  >)
          >,
          ...Captures
        ],
        NamedCaptures | NextedNamedCapture,
        [...CurrentIndex, '']
      >
    : never
  : CurrentMatcher extends {
      type: infer Type extends 'lookahead' | 'lookbehind'
      positive: infer Positive extends boolean
      value: infer LookaroundMatchers extends Matcher[]
    }
  ? ResolvePermutation<
      LookaroundMatchers,
      ConcateRestMatchers<Matchers, OutMostRestMatchers, CurrentIndex>,
      [''],
      NamedCaptures
    > extends PermutationResult<
      [infer ResultString extends string, ...infer Captures extends any[]],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        OutMostRestMatchers,
        [
          ...ConcatToFirstElement<
            MatchResultArray,
            | `[${Type extends 'lookahead'
                ? 'following'
                : 'previous'} pattern${Positive extends true
                ? ''
                : ' not'} contain: [${ResultString}] ]`
            | ''
          >,
          ...(Positive extends true ? Captures : CountNumOfCaptureGroupsAs<LookaroundMatchers>)
        ],
        | NamedCaptures
        | (Positive extends true
            ? NextedNamedCapture
            : ResolveNamedCaptureUnion<[LookaroundMatchers], NamedCaptures>),
        [...CurrentIndex, '']
      >
    : never
  : CurrentMatcher extends {
      type: infer Type extends 'capture' | 'namedCapture'
      value: infer GroupMatchers extends Matcher[]
      name?: infer GroupName extends string
    }
  ? ResolvePermutation<
      GroupMatchers,
      ConcateRestMatchers<Matchers, OutMostRestMatchers, CurrentIndex>,
      [''],
      NamedCaptures
    > extends infer Result
    ? Result extends PermutationResult<
        [infer ResultString extends string, ...infer Captures extends any[]],
        infer NextedNamedCapture
      >
      ? ResultString extends ResultString
        ? ResolvePermutation<
            Matchers,
            OutMostRestMatchers,
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
      type: 'captureLast'
      value: infer GroupMatchers extends Matcher[]
    }
  ? ResolvePermutation<GroupMatchers, OutMostRestMatchers, [''], NamedCaptures> extends infer Result
    ? Result extends PermutationResult<
        [infer ResultString extends string, ...infer Captures extends any[]],
        infer NextedNamedCapture
      >
      ? Captures extends Captures
        ? ResolvePermutation<
            Matchers,
            OutMostRestMatchers,
            [
              ...(Captures[number] extends undefined
                ? ConcatToFirstElement<MatchResultArray, ResultString>
                : [`${MatchResultArray[0]}${ResultString}`]),
              ...(MatchResultArray['length'] extends 1
                ? Captures
                : Captures[number] extends undefined
                ? []
                : Captures)
            ],
            | NamedCaptures
            | Exclude<NextedNamedCapture, [Extract<NamedCaptures, [string, string]>[0], undefined]>,
            [...CurrentIndex, '']
          >
        : never
      : never
    : never
  : CurrentMatcher extends {
      type: 'optional'
      value: infer OptionalMatchers extends Matcher[]
      greedy: infer Greedy extends boolean
      repeat?: infer Repeat extends [from: any[], to: string]
    }
  ? ResolvePermutation<
      OptionalMatchers,
      ConcateRestMatchers<Matchers, OutMostRestMatchers, CurrentIndex>,
      [''],
      NamedCaptures
    > extends PermutationResult<
      [infer ResultString extends string, ...infer Captures extends any[]],
      infer NextedNamedCapture
    >
    ? ResolvePermutation<
        Matchers,
        OutMostRestMatchers,
        [
          ...ConcatToFirstElement<
            MatchResultArray,
            Greedy extends true
              ? [never, string] extends Repeat
                ? ResultString | ''
                : RepeatStringFromTo<ResultString | '', Repeat[0], Repeat[1]>
              : TupleItemExtendsType<
                  [...Matchers, ...OutMostRestMatchers],
                  [...CurrentIndex, ''],
                  Matcher
                > extends true
              ? [never, string] extends Repeat
                ? ResultString | ''
                : RepeatStringFromTo<ResultString | '', Repeat[0], Repeat[1]>
              : ''
          >,
          ...(Greedy extends true
            ? Captures | CountNumOfCaptureGroupsAs<OptionalMatchers>
            : TupleItemExtendsType<
                [...Matchers, ...OutMostRestMatchers],
                [...CurrentIndex, ''],
                Matcher
              > extends true
            ? Captures
            : CountNumOfCaptureGroupsAs<OptionalMatchers>)
        ],
        | NamedCaptures
        | (Greedy extends true
            ? NextedNamedCapture | ResolveNamedCaptureUnion<[OptionalMatchers], never>
            : TupleItemExtendsType<
                [...Matchers, ...OutMostRestMatchers],
                [...CurrentIndex, ''],
                Matcher
              > extends true
            ? NextedNamedCapture
            : ResolveNamedCaptureUnion<[OptionalMatchers], NamedCaptures>),
        [...CurrentIndex, '']
      >
    : never
  : CurrentMatcher extends {
      type: 'or'
      value: infer OrMatchersArray extends Matcher[][]
    }
  ? OrMatchersArray[number] extends infer OrMatchers extends Matcher[]
    ? OrMatchers extends OrMatchers
      ? ResolvePermutation<
          OrMatchers,
          ConcateRestMatchers<Matchers, OutMostRestMatchers, CurrentIndex>,
          [''],
          NamedCaptures
        > extends PermutationResult<
          [infer ResultString extends string, ...infer Captures extends any[]],
          infer NextedNamedCapture
        >
        ? ResolvePermutation<
            Matchers,
            OutMostRestMatchers,
            [
              ...ConcatToFirstElement<MatchResultArray, ResultString>,
              ...ResolveOrCaptureTuple<
                OrMatchersArray,
                Captures,
                IndexOf<OrMatchersArray, OrMatchers>
              >
            ],
            NamedCaptures | ResolveNamedCaptureUnion<OrMatchersArray, NextedNamedCapture>,
            [...CurrentIndex, '']
          >
        : never
      : never
    : never
  : CurrentMatcher extends {
      type: infer Type extends 'zeroOrMore' | 'oneOrMore'
      value: infer AnyOrMoreMatchers extends Matcher[]
      greedy: infer Greedy extends boolean
    }
  ? ResolvePermutation<
      AnyOrMoreMatchers,
      ConcateRestMatchers<Matchers, OutMostRestMatchers, CurrentIndex>,
      [''],
      NamedCaptures
    > extends infer Result
    ? Result extends PermutationResult<
        [infer ResultString extends string, ...infer Captures extends any[]],
        infer NextedNamedCapture
      >
      ? ResultString extends ResultString
        ? ResolvePermutation<
            Matchers,
            OutMostRestMatchers,
            [
              ...ConcatToFirstElement<
                MatchResultArray,
                true extends
                  | Greedy
                  | TupleItemExtendsType<
                      [...Matchers, ...OutMostRestMatchers],
                      [...CurrentIndex, ''],
                      Matcher
                    >
                  ?
                      | (Type extends 'zeroOrMore' ? '' : never)
                      | ResultString
                      | `${ResultString}${string}${ResultString}`
                      | `[ ${Type extends 'zeroOrMore'
                          ? 'zero'
                          : 'one'} or more of \`${ResultString}\` ]`
                  : Type extends 'zeroOrMore'
                  ? ''
                  : ResultString
              >,
              ...(true extends
                | Greedy
                | TupleItemExtendsType<
                    [...Matchers, ...OutMostRestMatchers],
                    [...CurrentIndex, ''],
                    Matcher
                  >
                ? Type extends 'zeroOrMore'
                  ? CountNumOfCaptureGroupsAs<AnyOrMoreMatchers> | Captures
                  : Captures
                : Type extends 'zeroOrMore'
                ? CountNumOfCaptureGroupsAs<AnyOrMoreMatchers>
                : Captures)
            ],
            | NamedCaptures
            | (true extends
                | Greedy
                | TupleItemExtendsType<
                    [...Matchers, ...OutMostRestMatchers],
                    [...CurrentIndex, ''],
                    Matcher
                  >
                ? Type extends 'zeroOrMore'
                  ? ResolveNamedCaptureUnion<[AnyOrMoreMatchers], never> | NextedNamedCapture
                  : NextedNamedCapture
                : Type extends 'zeroOrMore'
                ? ResolveNamedCaptureUnion<[AnyOrMoreMatchers], never>
                : NextedNamedCapture),
            [...CurrentIndex, '']
          >
        : never
      : never
    : never
  : CurrentMatcher extends {
      type: 'repeat'
      value: infer RepeatMatchers extends Matcher[]
      from: infer From extends `${number}`
      to: infer To extends `${number}` | '' | string
      greedy: infer Greedy extends boolean
    }
  ? ResolvePermutation<
      ExpandRepeat<RepeatMatchers, From, To, Greedy>,
      ConcateRestMatchers<Matchers, OutMostRestMatchers, CurrentIndex>,
      [''],
      NamedCaptures
    > extends infer Result
    ? Result extends PermutationResult<
        [infer ResultString extends string, ...infer Captures extends any[]],
        infer NextedNamedCapture
      >
      ? ResolvePermutation<
          Matchers,
          OutMostRestMatchers,
          [
            ...ConcatToFirstElement<
              MatchResultArray,
              true extends
                | Greedy
                | TupleItemExtendsType<
                    [...Matchers, ...OutMostRestMatchers],
                    [...CurrentIndex, ''],
                    Matcher
                  >
                ? ResultString extends `${string}zero${string}\`${infer RepeatString}\`${string}`
                  ? `[ repeat \`${RepeatString}\` ${From} to unlimited times ]`
                  : ResultString
                : [From, To] extends ['0', '']
                ? ''
                :
                    | ResultString
                    | (string extends To ? `[ repeat \`${ResultString}\` ${From} times ]` : never)
            >,
            ...(true extends
              | Greedy
              | TupleItemExtendsType<
                  [...Matchers, ...OutMostRestMatchers],
                  [...CurrentIndex, ''],
                  Matcher
                >
              ? Captures
              : From extends '0'
              ? CountNumOfCaptureGroupsAs<RepeatMatchers>
              : Captures)
          ],
          NamedCaptures | NextedNamedCapture,
          [...CurrentIndex, '']
        >
      : never
    : never
  : PermutationResult<MatchResultArray, NamedCaptures>
