import type {
  CharSetMap,
  CollectCaptureNames,
  ConcatParialMatched,
  ConcatToFirstElement,
  CountNumOfCaptureGroupsAs,
  ExpandOneOrMore,
  ExpandRepeat,
  IndexOf,
  LastCharOfOr,
  MatchedResult,
  Matcher,
  NameCaptureValue,
  NamedCapturesTuple,
  NullResult,
  ResolveNamedCaptureUnion,
  ResolveOrCaptureTuple,
  SliceMatchers,
  StepMatch,
  TupleItemExtendsType,
} from './utils'

export type ExhaustiveMatch<
  InputString extends string,
  Matchers extends Matcher[],
  SkipedString extends string = '',
  StartOf extends boolean = false,
  EndOf extends boolean = false
> = EnumerateMatchers<
  InputString,
  Matchers,
  SkipedString,
  [],
  [''],
  never,
  StartOf,
  EndOf
> extends infer Result
  ? Result extends MatchedResult<any, any, any>
    ? Result & { SkipedString: SkipedString }
    : Result extends NullResult<infer PartialMatched extends string, any, infer Abort>
    ? Abort extends true
      ? Result
      : PartialMatched extends ''
      ? InputString extends `${infer FirstChar}${infer Rest}`
        ? Rest extends ''
          ? Result & { SkipedString: SkipedString }
          : ExhaustiveMatch<Rest, Matchers, `${SkipedString}${FirstChar}`>
        : Result
      : InputString extends `${infer Prefix}${PartialMatched}${infer NextSection}`
      ? ExhaustiveMatch<NextSection, Matchers, `${SkipedString}${Prefix}${PartialMatched}`>
      : never
    : never
  : never

export type EnumerateMatchers<
  InputString extends string,
  Matchers extends Matcher[],
  SkipedString extends string,
  OutMostRestMatchers extends Matcher[] = [],
  MatchResultArray extends (string | undefined)[] = [''],
  NamedCaptures extends NamedCapturesTuple = never,
  StartOf extends boolean = false,
  EndOf extends boolean = false,
  MatchEmpty extends boolean = true,
  Count extends any[] = [],
  CurrentMatcher extends Matcher = Matchers[Count['length']],
  ResolvedNamedCaptures extends NamedCapturesTuple = CurrentMatcher extends {
    type: 'captureLast'
    value: infer CaptureLastMatchers extends Matcher[]
  }
    ? Exclude<NamedCaptures, [CollectCaptureNames<CaptureLastMatchers>, any]>
    : NamedCaptures
> = Count['length'] extends Matchers['length']
  ? [endOf: EndOf, remainString: InputString] extends [false, any] | [any, '']
    ? MatchedResult<MatchResultArray, InputString, NamedCaptures>
    : MatchEmpty extends true
    ? MatchedResult<[''], InputString, NamedCaptures>
    : NullResult<MatchResultArray[0]>
  : CurrentMatcher extends {
      type: infer Type extends 'endOf' | 'startOf'
      value: infer StartOrEndMatchers extends Matcher[]
    }
  ? EnumerateMatchers<
      InputString,
      StartOrEndMatchers,
      SkipedString,
      OutMostRestMatchers,
      MatchResultArray,
      NamedCaptures,
      Type extends 'startOf' ? true : StartOf,
      Type extends 'endOf' ? true : EndOf,
      MatchEmpty
    >
  : Match<
      CurrentMatcher['type'] extends 'boundary'
        ? `${LastCharOfOr<MatchResultArray[0], ' '>}${InputString}`
        : InputString,
      NonNullable<MatchResultArray[0]>,
      SkipedString,
      Matchers,
      OutMostRestMatchers,
      ResolvedNamedCaptures,
      StartOf,
      EndOf,
      Count
    > extends infer Result
  ? Result extends MatchedResult<
      [infer CurrentMatched extends string, ...infer CurrentMatchedRestArray extends any[]],
      infer RestInputString,
      infer NestNamedCaptures
    >
    ? EnumerateMatchers<
        RestInputString,
        Matchers,
        SkipedString,
        OutMostRestMatchers,
        [
          // ? matchedString and previous capture groups
          ...([CurrentMatcher['type'], CurrentMatched extends '' ? false : true] extends [
            'captureLast',
            true
          ]
            ? [`${MatchResultArray[0]}${CurrentMatched}`]
            : ConcatToFirstElement<MatchResultArray, CurrentMatched>),
          // ? new capture groups
          ...(CurrentMatcher['type'] extends 'capture' | 'namedCapture' ? [CurrentMatched] : []), // ? if capturing
          // ? nested capture groups
          ...([CurrentMatcher['type'], CurrentMatched] extends ['captureLast', '']
            ? []
            : CurrentMatchedRestArray)
        ],
        // ? new named capture

        | (CurrentMatcher extends {
            type: 'namedCapture'
            name: infer CaptureName extends string
          }
            ? [CaptureName, CurrentMatched]
            : never)
        // ? only keep last repeating named capture
        | ([CurrentMatcher['type'], CurrentMatched] extends ['captureLast', '']
            ? NamedCaptures
            : ResolvedNamedCaptures | NestNamedCaptures),
        true, // ? Allway set startOf to `true` for following matchs
        EndOf,
        false, // ? MatchEmpty should be dynmaic?
        [...Count, '']
      >
    : NullResult<
        ConcatParialMatched<MatchResultArray[0], Result>,
        Result extends NullResult<any, any> ? Result['debugObj'] : unknown,
        StartOf
      >
  : never

type Match<
  InputString extends string,
  SkipedString extends string,
  PrevMatchedString extends string,
  Matchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean,
  EndOf extends boolean,
  Count extends any[] = [],
  PrefixType extends string = StartOf extends true ? '' : string,
  CurrentMatcher extends Matcher = Matchers[Count['length']],
  RestMatchers extends Matcher[] = SliceMatchers<
    Matchers,
    [...Count, '']
  > extends infer RM extends Matcher[]
    ? RM
    : never
> = CurrentMatcher extends {
  type: 'any'
}
  ? InputString extends `${infer AnyChar}${infer Rest}`
    ? MatchedResult<[AnyChar], Rest>
    : NullResult<InputString>
  : CurrentMatcher extends {
      type: infer Type extends 'string' | 'backreference'
      value: infer StringOrName extends string
    }
  ? ['backreference', undefined] extends [Type, NameCaptureValue<NamedCaptures, StringOrName>]
    ? MatchedResult<[''], InputString>
    : InputString extends `${PrefixType}${Type extends 'string'
        ? StringOrName
        : NameCaptureValue<NamedCaptures, StringOrName>}${infer Rest}`
    ? MatchedResult<
        [Type extends 'string' ? StringOrName : NameCaptureValue<NamedCaptures, StringOrName>],
        Rest
      >
    : NullResult<''>
  : CurrentMatcher extends {
      type: infer Type extends keyof CharSetMap
      value?: infer CharSet extends string
    }
  ? StepMatch<InputString, CharSetMap<CharSet>[Type], StartOf, Type>
  : CurrentMatcher extends {
      type: infer Type extends 'optional' | 'zeroOrMore'
      value: infer OptionalOrMoreMatchers extends Matcher[]
      greedy: infer Greedy extends boolean
      repeat?: infer Repeat extends [from: any[], to: string]
    }
  ? MatchOptionalOrMoreMatcher<
      InputString,
      SkipedString,
      Matchers,
      OutMostRestMatchers,
      OptionalOrMoreMatchers,
      Greedy,
      [never, string] extends Repeat
        ? Type extends 'zeroOrMore'
          ? [[], 'infinite']
          : [[], '1']
        : Repeat,
      NamedCaptures,
      StartOf,
      EndOf,
      Count
    >
  : CurrentMatcher extends {
      type: 'oneOrMore'
      value: infer OneOrMoreMatchers extends Matcher[]
      greedy: infer Greedy extends boolean
    }
  ? EnumerateMatchers<
      InputString,
      ExpandOneOrMore<OneOrMoreMatchers, Greedy>,
      SkipedString,
      [...RestMatchers, ...OutMostRestMatchers],
      [''],
      NamedCaptures,
      StartOf
    >
  : CurrentMatcher extends {
      type: 'capture' | 'namedCapture' | 'captureLast'
      value: infer GroupMatchers extends Matcher[]
    }
  ? EnumerateMatchers<
      InputString,
      GroupMatchers,
      SkipedString,
      [...RestMatchers, ...OutMostRestMatchers],
      [''],
      NamedCaptures,
      StartOf
    >
  : CurrentMatcher extends {
      type: 'or'
      value: infer OrMatchersArray extends Matcher[][]
    }
  ? MatchOrMatchers<
      InputString,
      SkipedString,
      OrMatchersArray,
      [...RestMatchers, ...OutMostRestMatchers],
      NamedCaptures,
      StartOf
    >
  : CurrentMatcher extends {
      type: 'repeat'
      value: infer RepeatMatchers extends Matcher[]
      from: infer From extends `${number}`
      to: infer To extends `${number}` | '' | string
      greedy: infer Greedy extends boolean
    }
  ? EnumerateMatchers<
      InputString,
      ExpandRepeat<RepeatMatchers, From, To, Greedy>,
      SkipedString,
      [...RestMatchers, ...OutMostRestMatchers],
      [''],
      NamedCaptures,
      StartOf
    >
  : CurrentMatcher extends {
      type: 'lookahead'
      value: infer LookaheadMatchers extends Matcher[]
      positive: infer Positive extends boolean
    }
  ? EnumerateMatchers<
      InputString,
      LookaheadMatchers,
      SkipedString,
      [],
      [''],
      NamedCaptures,
      true
    > extends MatchedResult<[any, ...infer Captures extends any[]], any, infer NestNamedCaptures>
    ? Positive extends true
      ? MatchedResult<['', ...Captures], InputString, NestNamedCaptures>
      : NullResult<''>
    : Positive extends true
    ? NullResult<''>
    : MatchedResult<
        ['', ...CountNumOfCaptureGroupsAs<LookaheadMatchers>],
        InputString,
        ResolveNamedCaptureUnion<[LookaheadMatchers], never>
      >
  : CurrentMatcher extends {
      type: 'lookbehind'
      value: infer LookbehindMatchers extends Matcher[]
      positive: infer Positive extends boolean
    }
  ? ExhaustiveMatch<
      `${SkipedString}${PrevMatchedString}`,
      LookbehindMatchers,
      SkipedString,
      false,
      true
    > extends MatchedResult<[any, ...infer Captures extends any[]], any, infer NestNamedCaptures>
    ? Positive extends true
      ? MatchedResult<['', ...Captures], InputString, NestNamedCaptures>
      : NullResult<''>
    : Positive extends true
    ? NullResult<''>
    : MatchedResult<
        ['', ...CountNumOfCaptureGroupsAs<LookbehindMatchers>],
        InputString,
        ResolveNamedCaptureUnion<[LookbehindMatchers], never>
      >
  : never

type MatchOrMatchers<
  InputString extends string,
  SkipedString extends string,
  OrMatchersArray extends Matcher[][],
  OutMostRestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean = false,
  Count extends any[] = [],
  BestMatchedWithPrefix extends [
    prefix: string | undefined,
    matchedResult: MatchedResult<any, any, any> | NullResult<any, any>
  ] = [undefined, NullResult<''>],
  CurrentOrMatchers extends Matcher[] = OrMatchersArray[Count['length']]
> = Count['length'] extends OrMatchersArray['length']
  ? BestMatchedWithPrefix[1]
  : EnumerateMatchers<
      InputString,
      CurrentOrMatchers,
      SkipedString,
      OutMostRestMatchers,
      [''],
      NamedCaptures,
      StartOf
    > extends MatchedResult<
      [infer OrMatch extends string, ...infer OrCaptures extends any[]],
      infer RestInputString,
      infer NestNamedCaptures
    >
  ? MatchOrMatchers<
      InputString,
      SkipedString,
      OrMatchersArray,
      OutMostRestMatchers,
      ResolveNamedCaptureUnion<OrMatchersArray, NamedCaptures>,
      StartOf,
      [...Count, ''],
      InputString extends `${infer Prefix}${OrMatch}${string}`
        ? BestMatchedWithPrefix[0] extends Prefix
          ? BestMatchedWithPrefix
          : BestMatchedWithPrefix[0] extends undefined | `${string}${Prefix}${string}`
          ? [
              Prefix,
              MatchedResult<
                [
                  OrMatch,
                  ...ResolveOrCaptureTuple<
                    OrMatchersArray,
                    OrCaptures,
                    IndexOf<OrMatchersArray, CurrentOrMatchers>
                  >
                ],
                RestInputString,
                ResolveNamedCaptureUnion<OrMatchersArray, NestNamedCaptures>
              >
            ]
          : BestMatchedWithPrefix
        : never
    >
  : MatchOrMatchers<
      InputString,
      SkipedString,
      OrMatchersArray,
      OutMostRestMatchers,
      ResolveNamedCaptureUnion<[CurrentOrMatchers], NamedCaptures>,
      StartOf,
      [...Count, ''],
      BestMatchedWithPrefix
    >

type BacktrackMatch<
  MatchedResultsTuple extends {
    matched: string
    captures: (string | undefined)[]
    namedCaputres: NamedCapturesTuple
  }[],
  SkipedString extends string,
  CurrentNestedMatchers extends Matcher[],
  RestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  EndOf extends boolean,
  CurrentMatcherIndex extends any[] = [],
  Count extends any[] = ['']
> = Count['length'] extends MatchedResultsTuple['length']
  ? NullResult<''>
  : MatchedResultsTuple[0]['matched'] extends `${MatchedResultsTuple[Count['length']]['matched']}${infer LastMatchSeg}`
  ? EnumerateMatchers<
      LastMatchSeg,
      RestMatchers,
      SkipedString,
      [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
      [''],
      NamedCaptures,
      true,
      EndOf,
      false,
      [...CurrentMatcherIndex, '']
    > extends MatchedResult<[infer Matched extends string, ...any[]], any, any>
    ? LastMatchSeg extends `${infer Prefix}${Matched}${string}` // ? check if zeroOrMore/optional is matching dynamic length ex: {1,3}
      ? Prefix extends ''
        ? MatchedResult<
            [
              MatchedResultsTuple[Count['length']]['matched'],
              ...MatchedResultsTuple[Count['length']]['captures']
            ],
            LastMatchSeg,
            ResolveNamedCaptureUnion<
              [CurrentNestedMatchers],
              MatchedResultsTuple[Count['length']]['namedCaputres']
            >
          >
        : // ? update capture groups if zeroOrMore/optional is matching dynamic length
        EnumerateMatchers<
            Prefix,
            CurrentNestedMatchers,
            SkipedString,
            [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
            [''],
            NamedCaptures,
            true
          > extends MatchedResult<
            [any, ...infer LastCaptures extends any[]],
            any,
            infer LastNamedCaptures
          >
        ? MatchedResult<
            [`${MatchedResultsTuple[Count['length']]['matched']}${Prefix}`, ...LastCaptures],
            LastMatchSeg extends `${Prefix}${infer Rest}` ? Rest : never,
            ResolveNamedCaptureUnion<[CurrentNestedMatchers], LastNamedCaptures>
          >
        : never
      : never
    : BacktrackMatch<
        MatchedResultsTuple,
        SkipedString,
        CurrentNestedMatchers,
        RestMatchers,
        NamedCaptures,
        EndOf,
        CurrentMatcherIndex,
        [...Count, '']
      >
  : never

type MatchOptionalOrMoreMatcher<
  InputString extends string,
  SkipedString extends string,
  Matchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  CurrentNestedMatchers extends Matcher[],
  Greedy extends boolean,
  Repeat extends [from: any[], to: string],
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean,
  EndOf extends boolean,
  CurrentMatcherIndex extends any[] = [],
  MatchedResultsTuple extends {
    matched: string
    captures: (string | undefined)[]
    namedCaputres: NamedCapturesTuple
  }[] = [
    {
      matched: ''
      captures: CountNumOfCaptureGroupsAs<CurrentNestedMatchers>
      namedCaputres: ResolveNamedCaptureUnion<[CurrentNestedMatchers], never>
    }
  ],
  MatchNextMater extends boolean = Greedy extends true ? false : true,
  MatchedCount extends any[] = [
    ...(MatchedResultsTuple extends [any, ...infer OneLess] ? OneLess : []),
    ...Repeat[0]
  ],
  MaxRepeatReached extends boolean = `${MatchedCount['length']}` extends Repeat[1] ? true : false
> = Greedy extends true
  ? // ? greedy matching
    [
      MaxRepeatReached,
      EnumerateMatchers<
        InputString,
        CurrentNestedMatchers,
        SkipedString,
        [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures,
        StartOf
      >
    ] extends [
      false,
      MatchedResult<
        [infer CurrentMatched extends string, ...infer CurrentMatchedRestArray extends any[]],
        infer CurrentRestInputString,
        infer CurrentNamedCaptures
      >
    ]
    ? //? match one more time
      MatchOptionalOrMoreMatcher<
        CurrentRestInputString,
        SkipedString,
        Matchers,
        OutMostRestMatchers,
        CurrentNestedMatchers,
        Greedy,
        Repeat,
        NamedCaptures,
        StartOf,
        EndOf,
        CurrentMatcherIndex,
        [
          {
            matched: `${MatchedResultsTuple[0]['matched']}${CurrentMatched}`
            captures: CurrentMatchedRestArray
            namedCaputres: CurrentNamedCaptures
          },
          ...MatchedResultsTuple
        ]
      >
    : TupleItemExtendsType<
        [...Matchers, ...OutMostRestMatchers],
        [...CurrentMatcherIndex, ''],
        Matcher
      > extends true
    ? EnumerateMatchers<
        InputString,
        [...Matchers, ...OutMostRestMatchers],
        SkipedString,
        [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures,
        true,
        EndOf,
        false,
        [...CurrentMatcherIndex, '']
      > extends NullResult<any, any>
      ? // ? backtrak matches to match rest matchers
        BacktrackMatch<
          [
            {
              matched: `${MatchedResultsTuple[0]['matched']}${InputString}`
              captures: []
              namedCaputres: never
            },
            ...MatchedResultsTuple
          ],
          SkipedString,
          CurrentNestedMatchers,
          [...Matchers, ...OutMostRestMatchers],
          NamedCaptures,
          EndOf,
          CurrentMatcherIndex
        >
      : MatchedResult<
          [MatchedResultsTuple[0]['matched'], ...MatchedResultsTuple[0]['captures']],
          InputString,
          ResolveNamedCaptureUnion<[CurrentNestedMatchers], MatchedResultsTuple[0]['namedCaputres']>
        >
    : MatchedResult<
        [MatchedResultsTuple[0]['matched'], ...MatchedResultsTuple[0]['captures']],
        InputString,
        ResolveNamedCaptureUnion<[CurrentNestedMatchers], MatchedResultsTuple[0]['namedCaputres']>
      >
  : // ? lazy matching
  TupleItemExtendsType<
      [...Matchers, ...OutMostRestMatchers],
      [...CurrentMatcherIndex, ''],
      Matcher
    > extends true
  ? true extends MatchNextMater
    ? EnumerateMatchers<
        InputString,
        [...Matchers, ...OutMostRestMatchers],
        SkipedString,
        [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures, // ? pass in zeroOrMore/optional match named capture?
        true,
        EndOf,
        false,
        [...CurrentMatcherIndex, '']
      > extends MatchedResult<any, any, any>
      ? MatchedResult<
          [MatchedResultsTuple[0]['matched'], ...MatchedResultsTuple[0]['captures']],
          InputString,
          ResolveNamedCaptureUnion<[CurrentNestedMatchers], MatchedResultsTuple[0]['namedCaputres']>
        >
      : MaxRepeatReached extends true
      ? NullResult<''>
      : MatchOptionalOrMoreMatcher<
          InputString,
          SkipedString,
          Matchers,
          OutMostRestMatchers,
          CurrentNestedMatchers,
          Greedy,
          Repeat,
          NamedCaptures,
          StartOf,
          EndOf,
          CurrentMatcherIndex,
          MatchedResultsTuple,
          false
        >
    : EnumerateMatchers<
        InputString,
        CurrentNestedMatchers,
        SkipedString,
        [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures,
        StartOf
      > extends MatchedResult<
        [infer CurrentMatched extends string, ...infer CurrentMatchedRestArray extends any[]],
        infer CurrentRestInputString,
        infer CurrentNamedCaptures
      >
    ? MatchOptionalOrMoreMatcher<
        CurrentRestInputString,
        SkipedString,
        Matchers,
        OutMostRestMatchers,
        CurrentNestedMatchers,
        Greedy,
        Repeat,
        NamedCaptures,
        StartOf,
        EndOf,
        CurrentMatcherIndex,
        [
          {
            matched: `${MatchedResultsTuple[0]['matched']}${CurrentMatched}`
            captures: CurrentMatchedRestArray
            namedCaputres: CurrentNamedCaptures
          },
          ...MatchedResultsTuple
        ],
        true
      >
    : NullResult<''>
  : MatchedResult<
      ['', ...CountNumOfCaptureGroupsAs<CurrentNestedMatchers>],
      InputString,
      ResolveNamedCaptureUnion<[CurrentNestedMatchers], never>
    >
