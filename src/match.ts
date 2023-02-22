import type {
  CharSetMap,
  CollectCaptureNames,
  ConcatParialMatched,
  ConcatToFirstElement,
  CountNumOfCaptureGroupsAs,
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

export type MatchRegexp<InputString extends string, Matchers extends Matcher[]> = ExhaustiveMatch<
  InputString,
  Matchers
> extends infer Result
  ? Result extends MatchedResult<infer MatchArray extends any[], any, infer NamedCaptures>
    ? MatchArray & {
        index: number // ? infer?
        input: InputString
        length: number // ? infer?
        groups: { [K in NamedCaptures[0]]: Extract<NamedCaptures, [K, any]>[1] }
      }
    : Result
  : never

type ExhaustiveMatch<
  InputString extends string,
  Matchers extends Matcher[],
  AccPartialMatched extends string[] = []
> = EnumerateMatchers<InputString, Matchers> extends infer Result
  ? Result extends MatchedResult<any, any, any>
    ? Result
    : Result extends NullResult<infer PartialMatched extends string>
    ? PartialMatched extends ''
      ? Result & { AccPartialMatched: AccPartialMatched }
      : InputString extends `${string}${PartialMatched}${infer NextSection}`
      ? ExhaustiveMatch<NextSection, Matchers, [...AccPartialMatched, PartialMatched]>
      : never
    : never
  : never

export type EnumerateMatchers<
  InputString extends string,
  Matchers extends Matcher[],
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
      Matchers,
      OutMostRestMatchers,
      ResolvedNamedCaptures,
      StartOf,
      EndOf,
      MatchEmpty,
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
        [],
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
        Result extends NullResult<any, any> ? Result['debugObj'] : unknown
      >
  : never

type Match<
  InputString extends string,
  Matchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean,
  EndOf extends boolean,
  MatchEmpty extends boolean,
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
      type: 'optional'
      value: infer OptionalMatchers extends Matcher[]
      greedy: infer Greedy extends boolean
      repeat?: infer Repeat extends [from: any[], to: string]
    }
  ? MatchOptionalMatcher<
      InputString,
      Matchers,
      OptionalMatchers,
      [...RestMatchers, ...OutMostRestMatchers],
      Greedy,
      [never, string] extends Repeat ? false : Repeat,
      NamedCaptures,
      StartOf,
      MatchEmpty,
      Count
    >
  : CurrentMatcher extends {
      type: 'capture' | 'namedCapture' | 'captureLast'
      value: infer GroupMatchers extends Matcher[]
    }
  ? EnumerateMatchers<
      InputString,
      GroupMatchers,
      [...RestMatchers, ...OutMostRestMatchers],
      [''],
      NamedCaptures,
      StartOf
    >
  : CurrentMatcher extends {
      type: 'or'
      value: infer OrMatchersArray extends Matcher[][]
    }
  ? MatchOrMatchers<InputString, OrMatchersArray, OutMostRestMatchers, NamedCaptures, StartOf>
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
      [...RestMatchers, ...OutMostRestMatchers],
      [''],
      NamedCaptures,
      StartOf
    >
  : CurrentMatcher extends {
      type: 'zeroOrMore'
      greedy: infer Greedy extends boolean
      value: infer ZeroOrMoreMatchers extends Matcher[]
    }
  ? MatchZeroOrMoreMatcher<
      InputString,
      Matchers,
      OutMostRestMatchers,
      ZeroOrMoreMatchers,
      Greedy,
      NamedCaptures,
      StartOf,
      EndOf,
      Count
    >
  : never

type MatchOrMatchers<
  InputString extends string,
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
  ZeroOrMoreMatchers extends Matcher[],
  RestMatchers extends Matcher[],
  NamedCaptures extends NamedCapturesTuple,
  EndOf extends boolean,
  ZeroOrMoreMatcherIndex extends any[] = [],
  Count extends any[] = ['']
> = Count['length'] extends MatchedResultsTuple['length']
  ? NullResult<MatchedResultsTuple[0]['matched']>
  : MatchedResultsTuple[0]['matched'] extends `${MatchedResultsTuple[Count['length']]['matched']}${infer LastMatchSeg}`
  ? EnumerateMatchers<
      LastMatchSeg,
      RestMatchers,
      [], // ! should we combined and pass donw rest of matchers and OutMostRestMatchers ??
      [''],
      NamedCaptures,
      false,
      EndOf,
      false,
      [...ZeroOrMoreMatcherIndex, '']
    > extends MatchedResult<[infer Matched extends string, ...any[]], any, any>
    ? LastMatchSeg extends `${infer Prefix}${Matched}${string}` // ? check if zeroOrMore is matching dynamic length ex: {1,3}
      ? Prefix extends ''
        ? MatchedResult<
            [
              MatchedResultsTuple[Count['length']]['matched'],
              ...MatchedResultsTuple[Count['length']]['captures']
            ],
            LastMatchSeg,
            ResolveNamedCaptureUnion<
              [ZeroOrMoreMatchers],
              MatchedResultsTuple[Count['length']]['namedCaputres']
            >
          >
        : // ? update capture groups if zeroOrMore is matching dynamic length
        EnumerateMatchers<
            Prefix,
            ZeroOrMoreMatchers,
            [], // ! should we combined and pass donw rest of matchers and OutMostRestMatchers ??
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
            ResolveNamedCaptureUnion<[ZeroOrMoreMatchers], LastNamedCaptures>
          >
        : never
      : never
    : BacktrackMatch<
        MatchedResultsTuple,
        ZeroOrMoreMatchers,
        RestMatchers,
        NamedCaptures,
        EndOf,
        ZeroOrMoreMatcherIndex,
        [...Count, '']
      >
  : never

type MatchZeroOrMoreMatcher<
  InputString extends string,
  Matchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  ZeroOrMoreMatchers extends Matcher[],
  Greedy extends boolean,
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean,
  EndOf extends boolean,
  ZeroOrMoreMatcherIndex extends any[] = [],
  MatchedResultsTuple extends {
    matched: string
    captures: (string | undefined)[]
    namedCaputres: NamedCapturesTuple
  }[] = [],
  MatchNextMater extends boolean = Greedy extends true ? false : true
> = Greedy extends true
  ? // ? greedy matching
    EnumerateMatchers<
      InputString,
      ZeroOrMoreMatchers,
      [], // ! should we combined and pass donw rest of matchers and OutMostRestMatchers ??
      [''],
      NamedCaptures,
      StartOf
    > extends MatchedResult<
      [infer CurrentMatched extends string, ...infer CurrentMatchedRestArray extends any[]],
      infer CurrentRestInputString,
      infer CurrentNamedCaptures
    >
    ? //? match one more time
      MatchZeroOrMoreMatcher<
        CurrentRestInputString,
        Matchers,
        OutMostRestMatchers,
        ZeroOrMoreMatchers,
        Greedy,
        NamedCaptures,
        StartOf,
        EndOf,
        ZeroOrMoreMatcherIndex,
        [
          {
            matched: `${MatchedResultsTuple[0] extends undefined
              ? ''
              : MatchedResultsTuple[0]['matched']}${CurrentMatched}`
            captures: CurrentMatchedRestArray
            namedCaputres: CurrentNamedCaptures
          },
          ...MatchedResultsTuple
        ]
      >
    : MatchedResultsTuple extends [] // ? zero match
    ? MatchedResult<
        ['', ...CountNumOfCaptureGroupsAs<ZeroOrMoreMatchers>],
        InputString,
        ResolveNamedCaptureUnion<[ZeroOrMoreMatchers], never>
      >
    : TupleItemExtendsType<
        [...Matchers, ...OutMostRestMatchers],
        [...ZeroOrMoreMatcherIndex, ''],
        Matcher
      > extends true
    ? EnumerateMatchers<
        InputString,
        [...Matchers, ...OutMostRestMatchers],
        [], // ! should we combined and pass donw rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures,
        true,
        EndOf,
        false,
        [...ZeroOrMoreMatcherIndex, '']
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
          ZeroOrMoreMatchers,
          [...Matchers, ...OutMostRestMatchers],
          NamedCaptures,
          EndOf,
          ZeroOrMoreMatcherIndex
        >
      : MatchedResult<
          [MatchedResultsTuple[0]['matched'], ...MatchedResultsTuple[0]['captures']],
          InputString,
          ResolveNamedCaptureUnion<[ZeroOrMoreMatchers], MatchedResultsTuple[0]['namedCaputres']>
        >
    : MatchedResult<
        [MatchedResultsTuple[0]['matched'], ...MatchedResultsTuple[0]['captures']],
        InputString,
        ResolveNamedCaptureUnion<[ZeroOrMoreMatchers], MatchedResultsTuple[0]['namedCaputres']>
      >
  : // ? lazy matching
  TupleItemExtendsType<
      [...Matchers, ...OutMostRestMatchers],
      [...ZeroOrMoreMatcherIndex, ''],
      Matcher
    > extends true
  ? MatchNextMater extends true
    ? EnumerateMatchers<
        InputString,
        [...Matchers, ...OutMostRestMatchers],
        [], // ! should we combined and pass donw rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures, // ? pass in zeroOrMore match named capture?
        StartOf,
        EndOf,
        false,
        [...ZeroOrMoreMatcherIndex, '']
      > extends MatchedResult<any, any, any>
      ? MatchedResult<
          [
            MatchedResultsTuple[0] extends undefined ? '' : MatchedResultsTuple[0]['matched'],
            ...(MatchedResultsTuple[0] extends undefined
              ? CountNumOfCaptureGroupsAs<ZeroOrMoreMatchers>
              : MatchedResultsTuple[0]['captures'])
          ],
          InputString,
          ResolveNamedCaptureUnion<
            [ZeroOrMoreMatchers],
            MatchedResultsTuple[0] extends undefined
              ? never
              : MatchedResultsTuple[0]['namedCaputres']
          >
        >
      : MatchZeroOrMoreMatcher<
          InputString,
          Matchers,
          OutMostRestMatchers,
          ZeroOrMoreMatchers,
          Greedy,
          NamedCaptures,
          StartOf,
          EndOf,
          ZeroOrMoreMatcherIndex,
          MatchedResultsTuple,
          false
        >
    : EnumerateMatchers<
        InputString,
        ZeroOrMoreMatchers,
        [], // ! should we combined and pass donw rest of matchers and OutMostRestMatchers ??
        [''],
        NamedCaptures,
        StartOf
      > extends MatchedResult<
        [infer CurrentMatched extends string, ...infer CurrentMatchedRestArray extends any[]],
        infer CurrentRestInputString,
        infer CurrentNamedCaptures
      >
    ? MatchZeroOrMoreMatcher<
        CurrentRestInputString,
        Matchers,
        OutMostRestMatchers,
        ZeroOrMoreMatchers,
        Greedy,
        NamedCaptures,
        StartOf,
        EndOf,
        ZeroOrMoreMatcherIndex,
        [
          {
            matched: `${MatchedResultsTuple[0] extends undefined
              ? ''
              : MatchedResultsTuple[0]['matched']}${CurrentMatched}`
            captures: CurrentMatchedRestArray
            namedCaputres: CurrentNamedCaptures
          },
          ...MatchedResultsTuple
        ],
        true
      >
    : NullResult<MatchedResultsTuple[0]['matched']>
  : MatchedResult<
      ['', ...CountNumOfCaptureGroupsAs<ZeroOrMoreMatchers>],
      InputString,
      ResolveNamedCaptureUnion<[ZeroOrMoreMatchers], never>
    >

type MatchOptionalMatcher<
  InputString extends string,
  Matchers extends Matcher[],
  OptionalMatchers extends Matcher[],
  OutMostRestMatchers extends Matcher[],
  Greedy extends boolean,
  Repeat extends [from: any[], to: string] | false,
  NamedCaptures extends NamedCapturesTuple,
  StartOf extends boolean,
  MatchEmpty extends boolean,
  OptionalMatcherIndex extends any[] = [],
  AccMatchedResult extends {
    matched: string
    captures: (string | undefined)[]
    namedCaputres: NamedCapturesTuple
  } = never
> = EnumerateMatchers<
  InputString,
  OptionalMatchers,
  OutMostRestMatchers,
  [''],
  NamedCaptures,
  StartOf
> extends MatchedResult<
  [infer CurrentMatched extends string, ...infer CurrentMatchedRestArray extends any[]],
  infer CurrentRestInputString,
  infer CurrentNamedCaptures
>
  ? [Repeat, Repeat extends [from: any[], to: string] ? Repeat[1] : undefined] extends
      | [false, undefined]
      | [any, Repeat extends [from: any[], to: string] ? `${Repeat[0]['length']}` : undefined]
    ? MatchedResult<
        [false, false] extends [
          (
            | Greedy
            | ([true, false] extends [
                MatchEmpty,
                InputString extends `${CurrentMatched}${string}` ? true : false
              ]
                ? false
                : true)
          ),
          TupleItemExtendsType<
            [...Matchers, ...OutMostRestMatchers],
            [...OptionalMatcherIndex, ''],
            Matcher
          > // ? check if is last matcher
        ] // ? check if not greedy or is not first char in Input
          ? ['', ...CountNumOfCaptureGroupsAs<OptionalMatchers>]
          : AccMatchedResult['matched'] extends never
          ? [CurrentMatched, ...CurrentMatchedRestArray]
          : [AccMatchedResult['matched'], ...AccMatchedResult['captures']], // ? repeating match result
        AccMatchedResult['matched'] extends never ? CurrentRestInputString : InputString,
        [false, false] extends [
          (
            | Greedy
            | ([true, false] extends [
                MatchEmpty,
                InputString extends `${CurrentMatched}${string}` ? true : false
              ]
                ? false
                : true)
          ),
          TupleItemExtendsType<
            [...Matchers, ...OutMostRestMatchers],
            [...OptionalMatcherIndex, ''],
            Matcher // ? check if is last matcher
          > // ? check if not greedy or is not first char in Input
        ]
          ? ResolveNamedCaptureUnion<[OptionalMatchers], NamedCaptures>
          : AccMatchedResult['matched'] extends never
          ? CurrentNamedCaptures
          : AccMatchedResult['namedCaputres'] // ? repeating match result
      > // ? optional matched
    : MatchOptionalMatcher<
        CurrentRestInputString,
        Matchers,
        OptionalMatchers,
        OutMostRestMatchers,
        Greedy,
        Repeat extends [from: any[], to: string] ? [[...Repeat[0], ''], Repeat[1]] : never,
        NamedCaptures,
        true,
        false,
        OptionalMatcherIndex,
        {
          matched: `${AccMatchedResult['matched'] extends never
            ? ''
            : AccMatchedResult['matched']}${CurrentMatched}`
          captures: CurrentMatchedRestArray
          namedCaputres: CurrentNamedCaptures
        }
      >
  : [false, false] extends
      | [
          Greedy,
          TupleItemExtendsType<
            [...Matchers, ...OutMostRestMatchers],
            [...OptionalMatcherIndex, ''],
            Matcher
          >
        ]
      | (AccMatchedResult['matched'] extends never ? [false, false] : [])
  ? MatchedResult<
      ['', ...CountNumOfCaptureGroupsAs<OptionalMatchers>],
      InputString,
      ResolveNamedCaptureUnion<[OptionalMatchers], NamedCaptures>
    > // ? optional mismatched
  : MatchedResult<
      [AccMatchedResult['matched'], ...AccMatchedResult['captures']],
      InputString,
      AccMatchedResult['namedCaputres']
    > // ? repeating optional mismatched

type awer = EnumerateMatchers<'a', [{ type: 'any' }], [], [''], never, true>
