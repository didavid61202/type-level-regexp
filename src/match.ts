import type { Flag } from './regexp'
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
  RestMatchersBeforeBackReference,
  InvertCharSetMap,
  FlattenLookahead,
} from './utils'

export type GlobalMatch<
  InputString extends string,
  Matchers extends Matcher[],
  Flags extends Flag,
  MatchResultArray extends string[] = []
> = ExhaustiveMatch<InputString, Matchers, Flags> extends infer Result
  ? Result extends MatchedResult<
      infer MatchArray extends any[],
      infer RestInputString extends string,
      any
    >
    ? GlobalMatch<RestInputString, Matchers, Flags, [...MatchResultArray, MatchArray[0]]>
    : MatchResultArray extends []
    ? null
    : MatchResultArray
  : never

export type ExhaustiveMatch<
  InputString extends string,
  Matchers extends Matcher[],
  Flags extends Flag,
  SkippedString extends string = '',
  StartOf extends boolean = false
> = Matchers extends Matchers
  ? EnumerateMatchers<
      InputString,
      Matchers,
      Flags,
      SkippedString,
      [],
      [''],
      never,
      StartOf
    > extends infer Result
    ? Result extends MatchedResult<any, any, any>
      ? Result
      : Result extends NullResult<infer PartialMatched extends string, any, infer Abort>
      ? true extends Abort | StartOf
        ? Result
        : PartialMatched extends ''
        ? InputString extends `${infer FirstChar}${infer Rest}`
          ? Rest extends ''
            ? Result
            : ExhaustiveMatch<Rest, Matchers, Flags, `${SkippedString}${FirstChar}`, StartOf>
          : Result
        : InputString extends `${infer Prefix}${PartialMatched}${infer NextSection}`
        ? ExhaustiveMatch<
            NextSection,
            Matchers,
            Flags,
            `${SkippedString}${Prefix}${PartialMatched}`,
            StartOf
          >
        : never
      : never
    : never
  : never

export type MatchLast<
  InputString extends string,
  Matchers extends Matcher[],
  Flags extends Flag,
  NamedCaptures extends NamedCapturesTuple,
  SkippedString extends string = '',
  LastMatched extends MatchedResult<any, any, any> | NullResult<''> = NullResult<''>
> = EnumerateMatchers<
  InputString,
  Matchers,
  Flags,
  SkippedString,
  [],
  [''],
  NamedCaptures,
  false
> extends infer Result
  ? Result extends MatchedResult<any, infer RestInput, any>
    ? MatchLast<RestInput, Matchers, Flags, NamedCaptures, SkippedString, Result>
    : Result extends NullResult<infer PartialMatched extends string, any, any>
    ? PartialMatched extends ''
      ? LastMatched
      : InputString extends `${string}${PartialMatched}${infer NextSeg}`
      ? MatchLast<NextSeg, Matchers, Flags, NamedCaptures, SkippedString, LastMatched>
      : LastMatched
    : never
  : never

export type EnumerateMatchers<
  InputString extends string,
  Matchers extends Matcher[],
  Flags extends Flag,
  SkippedString extends string,
  OutMostRestMatchers extends Matcher[] = [],
  MatchResultArray extends (string | undefined)[] = [''],
  NamedCaptures extends NamedCapturesTuple = never,
  StartOf extends boolean = false,
  Count extends any[] = [],
  CurrentMatcher extends Matcher = Matchers[Count['length']],
  ResolvedNamedCaptures extends NamedCapturesTuple = CurrentMatcher extends {
    type: 'captureLast'
    value: infer CaptureLastMatchers extends Matcher[]
  }
    ? Exclude<NamedCaptures, [CollectCaptureNames<CaptureLastMatchers>, any]>
    : NamedCaptures
> = Count['length'] extends Matchers['length']
  ? MatchedResult<MatchResultArray, InputString, NamedCaptures>
  : CurrentMatcher extends {
      type: infer Type extends 'endOf' | 'startOf'
      value: infer StartOrEndMatchers extends Matcher[]
    }
  ? ExhaustiveMatch<
      InputString,
      Type extends 'endOf' ? [...StartOrEndMatchers, { type: 'endMark' }] : StartOrEndMatchers,
      Flags,
      SkippedString,
      Type extends 'startOf' ? true : StartOf
    > extends infer Result
    ? Result extends MatchedResult<infer MatchArray, infer RestInputString, any>
      ? '' extends (Type extends 'endOf' ? false : '') | RestInputString
        ? Result
        : NullResult<
            MatchArray[0],
            {
              msg: `Not matching at the end of input string, remaining input: \`${RestInputString}\``
            },
            true
          >
      : Result extends NullResult<infer PartialMatched extends string, infer DebugObj, any>
      ? NullResult<PartialMatched, DebugObj, true>
      : never
    : never
  : Match<
      CurrentMatcher['type'] extends 'boundary' | 'nonBoundary'
        ? `${LastCharOfOr<MatchResultArray[0], ' '>}${InputString}`
        : InputString,
      Flags,
      NonNullable<MatchResultArray[0]>,
      SkippedString,
      Matchers,
      OutMostRestMatchers,
      ResolvedNamedCaptures,
      StartOf,
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
        Flags,
        `${InputString extends `${infer FirstSkipString}${CurrentMatched}${string}`
          ? `${SkippedString}${FirstSkipString}`
          : SkippedString}`,
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
        [...Count, '']
      >
    : NullResult<
        ConcatParialMatched<MatchResultArray[0], Result>,
        Result extends NullResult<any, any, any> ? Result['debugObj'] : unknown,
        false
      >
  : never

type Match<
  InputString extends string,
  Flags extends Flag,
  SkippedString extends string,
  PrevMatchedString extends string,
  Matchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean,
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
    : 'i' extends Flags
    ? StepMatch<
        InputString,
        `${Type extends 'string' ? StringOrName : NameCaptureValue<NamedCaptures, StringOrName>}`,
        StartOf,
        'step',
        true
      >
    : InputString extends `${[Type, StringOrName] extends ['string', '']
        ? ''
        : PrefixType}${Type extends 'string'
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
  ? StepMatch<
      InputString,
      CharSetMap<CharSet>[Type],
      StartOf,
      Type,
      'i' extends Flags ? true : false
    >
  : CurrentMatcher extends {
      type: infer Type extends 'optional' | 'zeroOrMore'
      value: infer OptionalOrMoreMatchers extends Matcher[]
      greedy: infer Greedy extends boolean
      repeat?: infer Repeat extends [from: any[], to: string]
    }
  ? //? shortcut zeroOrMore match for single matcher of type any, char, digit...
    [Type, OptionalOrMoreMatchers] extends [
      'zeroOrMore',
      [
        {
          type: infer Type extends keyof InvertCharSetMap
          value?: infer MaybeCharSet extends string
        }
      ]
    ]
    ? [...RestMatchers, ...OutMostRestMatchers] extends [] | [{ type: 'endMark' }]
      ? Greedy extends false
        ? MatchedResult<[''], InputString, never>
        : [
            Type extends 'any' ? false : true,
            Match<
              InputString,
              Flags,
              SkippedString,
              PrevMatchedString,
              Type extends 'charSet' | 'notCharSet'
                ? [{ type: InvertCharSetMap[Type]; value: MaybeCharSet }]
                : [{ type: InvertCharSetMap[Type] }],
              OutMostRestMatchers,
              NamedCaptures,
              false
            >
          ] extends [
            true,
            MatchedResult<
              [infer InvertOpMatch extends string, ...any[]],
              infer RestInputString,
              never
            >
          ]
        ? InputString extends `${infer Match}${InvertOpMatch}${RestInputString}`
          ? MatchedResult<[Match], `${InvertOpMatch}${RestInputString}`, never>
          : never
        : MatchedResult<[InputString], '', never>
      : FlattenLookahead<
          RestMatchersBeforeBackReference<[...RestMatchers, ...OutMostRestMatchers], []>
        > extends infer ResolvedRestMatchers extends Matcher[]
      ? (
          Type extends 'any'
            ? MatchLast<InputString, ResolvedRestMatchers, Flags, NamedCaptures, SkippedString>
            : EnumerateMatchers<InputString, ResolvedRestMatchers, Flags, ''>
        ) extends MatchedResult<
          [infer NextMatch extends string, ...any[]],
          infer RestInputString,
          any
        >
        ? InputString extends `${infer PossibleMatch}${NextMatch}${RestInputString}`
          ? Type extends 'any'
            ? MatchedResult<[PossibleMatch], `${NextMatch}${RestInputString}`, never>
            : Match<
                PossibleMatch,
                Flags,
                SkippedString,
                PrevMatchedString,
                Type extends 'charSet' | 'notCharSet'
                  ? [{ type: InvertCharSetMap[Type]; value: MaybeCharSet }]
                  : [{ type: InvertCharSetMap[Type] }],
                OutMostRestMatchers,
                NamedCaptures,
                false
              > extends NullResult<any>
            ? MatchedResult<[PossibleMatch], `${NextMatch}${RestInputString}`, never>
            : NextMatch extends '' //? if eager match till end of string by `negative lookahead`
            ? Match<
                PossibleMatch,
                Flags,
                SkippedString,
                PrevMatchedString,
                Type extends 'charSet' | 'notCharSet'
                  ? [{ type: InvertCharSetMap[Type]; value: MaybeCharSet }]
                  : [{ type: InvertCharSetMap[Type] }],
                OutMostRestMatchers,
                NamedCaptures,
                false
              > extends MatchedResult<
                [infer InvertOpMatch extends string, ...any[]],
                infer RestInputString,
                never
              >
              ? PossibleMatch extends `${infer Match}${InvertOpMatch}${RestInputString}`
                ? MatchedResult<[Match], `${InvertOpMatch}${RestInputString}`, never>
                : never
              : MatchedResult<[PossibleMatch], '', never>
            : NullResult<''>
          : never
        : NullResult<''>
      : NullResult<''>
    : MatchOptionalOrMoreMatcher<
        InputString,
        Flags,
        SkippedString,
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
      Flags,
      SkippedString,
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
      Flags,
      SkippedString,
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
      Flags,
      SkippedString,
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
      Flags,
      SkippedString,
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
      Flags,
      SkippedString,
      [],
      [''],
      NamedCaptures,
      StartOf
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
  ? MatchLast<
      `${PrevMatchedString}${SkippedString}`,
      LookbehindMatchers,
      Flags,
      NamedCaptures,
      SkippedString
    > extends MatchedResult<
      [any, ...infer Captures extends any[]],
      infer RestInputString,
      infer NestNamedCaptures
    >
    ? RestInputString extends ''
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
    : Positive extends true
    ? NullResult<''>
    : MatchedResult<
        ['', ...CountNumOfCaptureGroupsAs<LookbehindMatchers>],
        InputString,
        ResolveNamedCaptureUnion<[LookbehindMatchers], never>
      >
  : CurrentMatcher extends {
      type: 'not'
      value: infer NotMatchers extends Matcher[]
    }
  ? EnumerateMatchers<
      InputString,
      NotMatchers,
      Flags,
      SkippedString,
      [...RestMatchers, ...OutMostRestMatchers],
      [''],
      NamedCaptures,
      StartOf
    > extends NullResult<any>
    ? MatchedResult<[''], '', never>
    : NullResult<''>
  : CurrentMatcher extends {
      type: 'endMark'
    }
  ? MatchedResult<[''], InputString, never>
  : never

type MatchOrMatchers<
  InputString extends string,
  Flags extends Flag,
  SkippedString extends string,
  OrMatchersArray extends Matcher[][],
  OutMostRestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean = false,
  Count extends any[] = [],
  BestMatchedWithPrefix extends [
    prefix: string | undefined,
    matchedResult: MatchedResult<any, any, any> | NullResult<any, any, any>
  ] = [undefined, NullResult<''>],
  CurrentOrMatchers extends Matcher[] = OrMatchersArray[Count['length']]
> = Count['length'] extends OrMatchersArray['length']
  ? BestMatchedWithPrefix[1]
  : EnumerateMatchers<
      InputString,
      CurrentOrMatchers,
      Flags,
      SkippedString,
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
      Flags,
      SkippedString,
      OrMatchersArray,
      OutMostRestMatchers,
      ResolveNamedCaptureUnion<OrMatchersArray, NamedCaptures>,
      StartOf,
      [...Count, ''],
      [OrMatch, [...Count, '']['length'] extends OrMatchersArray['length'] ? true : false] extends [
        '',
        false
      ]
        ? [
            '',
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
        : InputString extends `${infer Prefix}${OrMatch}${string}`
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
      Flags,
      SkippedString,
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
  Flags extends Flag,
  SkippedString extends string,
  CurrentNestedMatchers extends Matcher[],
  RestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  CurrentMatcherIndex extends any[] = [],
  Count extends any[] = ['']
> = Count['length'] extends MatchedResultsTuple['length']
  ? NullResult<''>
  : MatchedResultsTuple[0]['matched'] extends `${MatchedResultsTuple[Count['length']]['matched']}${infer LastMatchSeg}`
  ? EnumerateMatchers<
      LastMatchSeg,
      RestMatchers,
      Flags,
      SkippedString,
      [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
      [''],
      NamedCaptures,
      true,
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
            Flags,
            SkippedString,
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
        Flags,
        SkippedString,
        CurrentNestedMatchers,
        RestMatchers,
        NamedCaptures,
        CurrentMatcherIndex,
        [...Count, '']
      >
  : never

type MatchOptionalOrMoreMatcher<
  InputString extends string,
  Flags extends Flag,
  SkippedString extends string,
  Matchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  CurrentNestedMatchers extends Matcher[],
  Greedy extends boolean,
  Repeat extends [from: any[], to: string],
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean,
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
> = true extends
  | Greedy
  | TupleItemExtendsType<
      [...Matchers, ...OutMostRestMatchers],
      [...CurrentMatcherIndex, ''],
      { type: 'endMark' }
    >
  ? // ? greedy matching
    [
      MaxRepeatReached,
      EnumerateMatchers<
        InputString,
        CurrentNestedMatchers,
        Flags,
        SkippedString,
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
        Flags,
        SkippedString,
        Matchers,
        OutMostRestMatchers,
        CurrentNestedMatchers,
        Greedy,
        Repeat,
        NamedCaptures,
        StartOf,
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
        RestMatchersBeforeBackReference<
          [...Matchers, ...OutMostRestMatchers],
          [...CurrentMatcherIndex, '']
        >,
        Flags,
        SkippedString,
        [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures,
        true
      > extends NullResult<any, any, any>
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
          Flags,
          SkippedString,
          CurrentNestedMatchers,
          [...Matchers, ...OutMostRestMatchers],
          NamedCaptures,
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
        RestMatchersBeforeBackReference<
          [...Matchers, ...OutMostRestMatchers],
          [...CurrentMatcherIndex, '']
        >,
        Flags,
        SkippedString,
        [], // ! should we combined and pass down rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures, // ? pass in zeroOrMore/optional match named capture?
        true
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
          Flags,
          SkippedString,
          Matchers,
          OutMostRestMatchers,
          CurrentNestedMatchers,
          Greedy,
          Repeat,
          NamedCaptures,
          StartOf,
          CurrentMatcherIndex,
          MatchedResultsTuple,
          false
        >
    : EnumerateMatchers<
        InputString,
        CurrentNestedMatchers,
        Flags,
        SkippedString,
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
        Flags,
        SkippedString,
        Matchers,
        OutMostRestMatchers,
        CurrentNestedMatchers,
        Greedy,
        Repeat,
        NamedCaptures,
        StartOf,
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
