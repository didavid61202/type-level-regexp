export type ArrayToFixReadonlyTupple<
  DynArray extends any[],
  OutOfIndexAs = undefined,
  IndexKeys extends keyof DynArray = Extract<keyof DynArray, `${number}`>,
  RestKeys extends keyof DynArray = Exclude<keyof DynArray, `${number}` | number>
> = {
  readonly [K in IndexKeys | number | RestKeys]: K extends IndexKeys
    ? DynArray[K]
    : K extends RestKeys
    ? DynArray[K]
    : OutOfIndexAs
}

type UppercaseLetterN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
type LowercaseLetterN = 'abcdefghijklmnopqrstuvwxyz'
type Digit = '0123456789'
type AlphanumericN = `_${Digit}${UppercaseLetterN}${LowercaseLetterN}`

type CommonChar =
  `!"#$%&'()*+,-./${Digit}:;<=>?@${UppercaseLetterN}[\\]^_\`${LowercaseLetterN}{|}~ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ΢ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψω`

export interface CharSetMap<
  CharSet extends string = string,
  ResolvedCharSet extends string = ResolveCharSet<CharSet>
> {
  char: AlphanumericN
  nonChar: AlphanumericN
  digit: Digit
  nonDigit: Digit
  charSet: ResolvedCharSet
  notCharSet: ResolvedCharSet
  boundary: string
}

type ResolveCharSet<
  CharSet extends string,
  Result extends string = ''
> = CharSet extends `${infer Before}-${infer To}${infer Rest}`
  ? LastCharOfOr<Before, ''> extends infer From extends string
    ? Before extends `${infer Set}${From}`
      ? ResolveCharSet<Rest, `${Result}${Set}${ResolveRangeSet<From, To>}`>
      : never
    : never
  : `${Result}${CharSet}`

type ResolveRangeSet<
  From extends string,
  To extends string
> = CommonChar extends `${string}${From}${infer Between}${To}${string}`
  ? `${From}${Between}${To}`
  : 'invalid range'

export type Matcher =
  | {
      type: 'string' | 'charSet' | 'notCharSet' | 'backreference'
      value: string
    }
  | {
      type: 'any' | Exclude<keyof CharSetMap, 'charSet' | 'notCharSet'> | 'debug'
    }
  | {
      type: 'capture' | 'startOf' | 'endOf' | 'captureLast'
      value: Matcher[]
    }
  | {
      type: 'optional'
      value: Matcher[]
      greedy: boolean
      repeat?: [from: any[], to: string]
    }
  | {
      type: 'zeroOrMore' | 'oneOrMore' //! can optimize matching logic when combining with `any` matcher
      value: Matcher[]
      greedy: boolean
    }
  | {
      type: 'namedCapture'
      value: Matcher[]
      name: string
    }
  | {
      type: 'lookahead' | 'lookbehind'
      value: Matcher[]
      positive: boolean
    }
  | {
      type: 'repeat'
      value: Matcher[]
      from: `${number}`
      to: `${number}` | '' | string
      greedy: boolean
    }
  | {
      type: 'or'
      value: Matcher[][]
    }

export type NamedCapturesTuple = [any, string | undefined]

export type MatchContext =
  | ['startOf', boolean]
  | ['endOf', boolean]
  | ['matchEmpty', boolean]
  | ['namedCaptures', NamedCapturesTuple]

export type UpdateContext<
  ContextUnion extends MatchContext,
  KeyValues extends MatchContext[],
  NewUnion = Exclude<ContextUnion, [KeyValues[number][0], any]> | KeyValues[number]
> = NewUnion

export type ContextValue<
  ContextUnion extends MatchContext,
  Key extends MatchContext[0],
  Value = Extract<ContextUnion, [Key, any]>[1]
> = Value

export interface MatchedResult<
  MatchArray extends (string | undefined)[],
  RestInputString extends string,
  NamedCaptures extends NamedCapturesTuple = never
> {
  matched: true
  results: MatchArray
  namedCaptures: NamedCaptures
  restInputString: RestInputString
}

export interface NullResult<
  PartialMatched extends string | undefined = undefined,
  DebugObj = unknown,
  Abort extends boolean = false
> {
  matched: false
  results: null
  partialMatched: PartialMatched
  abort: Abort
  debugObj: DebugObj
}

export type ConcatParialMatched<
  PartialMatched extends string | undefined,
  NestedNullResult,
  NestedPartialMatched extends string = NestedNullResult extends NullResult<
    infer Partial extends string
  >
    ? Partial
    : never
> = `${PartialMatched}${NestedPartialMatched}`

export type ConcatToFirstElement<
  Arr extends (string | undefined)[],
  AppendingString extends string
> = Arr extends [infer First extends string, ...infer Rest]
  ? [`${First}${AppendingString}`, ...Rest]
  : []

export type IndexOf<Array extends any[], Item, Count extends any[] = []> = Array extends [
  infer First,
  ...infer Rest
]
  ? Item extends First
    ? Count
    : IndexOf<Rest, Item, [...Count, '']>
  : never

export type LastCharOfOr<
  InputString,
  Or extends string = ' '
> = InputString extends `${infer First}${infer Rest}`
  ? Rest extends ''
    ? First
    : LastCharOfOr<Rest>
  : Or

export type SliceMatchers<
  Matchers extends Matcher[],
  Start extends any[],
  Result extends Matcher[] = []
> = Start['length'] extends Matchers['length']
  ? Result
  : SliceMatchers<Matchers, [...Start, ''], [...Result, Matchers[Start['length']]]>

export type TupleItemExtendsType<
  Tuple extends any[],
  Index extends any[],
  TargetType
> = Tuple[Index['length']] extends TargetType ? true : false

type Flatten<Source extends any[], Result extends any[] = []> = Source extends [infer X, ...infer Y]
  ? X extends any[]
    ? Flatten<[...X, ...Y], Result>
    : Flatten<[...Y], [...Result, X]>
  : Result

export type CountNumOfCaptureGroupsAs<
  Matchers extends Matcher[],
  As = undefined,
  Count extends any[] = []
> = Matchers extends []
  ? Count
  : Matchers extends [infer CurrentMatcher, ...infer RestMatchers extends Matcher[]]
  ? CurrentMatcher extends { type: infer Type; value: infer NestedMatchers extends Matcher[] }
    ? CountNumOfCaptureGroupsAs<
        RestMatchers,
        As,
        [
          ...Count,
          ...CountNumOfCaptureGroupsAs<NestedMatchers>,
          ...(Type extends 'capture' | 'namedCapture' ? [As] : [])
        ]
      >
    : CurrentMatcher extends {
        type: infer Type
        value: infer ArrayOfNestedMatchers extends Matcher[][]
      }
    ? CountNumOfCaptureGroupsAs<
        RestMatchers,
        As,
        [
          ...Count,
          ...CountNumOfCaptureGroupsAs<Flatten<ArrayOfNestedMatchers>>,
          ...(Type extends 'capture' | 'namedCapture' ? [As] : [])
        ]
      >
    : CountNumOfCaptureGroupsAs<RestMatchers, As, Count>
  : never

export type ResolveOrCaptureTuple<
  AllPossibleMatchers extends Matcher[][],
  CapturedResults extends any[],
  CapturedIndex extends any[],
  Index extends any[] = [],
  ResultTuple extends any[] = []
> = AllPossibleMatchers extends []
  ? ResultTuple
  : AllPossibleMatchers extends [
      infer CurrentMatchers extends Matcher[],
      ...infer RestPossibleMatchers extends Matcher[][]
    ]
  ? Index['length'] extends CapturedIndex['length']
    ? ResolveOrCaptureTuple<
        RestPossibleMatchers,
        CapturedResults,
        CapturedIndex,
        [...Index, ''],
        [...ResultTuple, ...CapturedResults]
      >
    : ResolveOrCaptureTuple<
        RestPossibleMatchers,
        CapturedResults,
        CapturedIndex,
        [...Index, ''],
        [...ResultTuple, ...CountNumOfCaptureGroupsAs<CurrentMatchers>]
      >
  : never

export type CollectCaptureNames<
  Matchers extends Matcher[],
  Names extends string = never
> = Matchers extends []
  ? Names
  : Matchers extends [infer CurrentMatcher, ...infer RestMatchers extends Matcher[]]
  ? CurrentMatcher extends {
      value: infer NestedMatchers extends Matcher[]
    }
    ? CollectCaptureNames<
        RestMatchers,
        Names | CurrentMatcher extends {
          type: 'namedCapture'
          name: infer CurrentName extends string
        }
          ? CurrentName | CollectCaptureNames<NestedMatchers>
          : never | CollectCaptureNames<NestedMatchers>
      >
    : CurrentMatcher extends { value: infer NestedMatchersArray extends Matcher[][] }
    ? CollectCaptureNames<
        RestMatchers,
        Names | ResolveNamedCaptureUnion<NestedMatchersArray, never>[0]
      >
    : CollectCaptureNames<RestMatchers, Names>
  : never

export type ResolveNamedCaptureUnion<
  AllPossibleMatchers extends Matcher[][],
  PreviousNamedCaptures extends NamedCapturesTuple,
  CollectedNames extends string = never
> = AllPossibleMatchers extends []
  ? [CollectedNames] extends [never]
    ? PreviousNamedCaptures
    : Exclude<CollectedNames, PreviousNamedCaptures[0]> extends infer UndefinedCaptureNames
    ? PreviousNamedCaptures | Exclude<[UndefinedCaptureNames, undefined], [never, undefined]>
    : never
  : AllPossibleMatchers extends [
      infer CurrentMatchers extends Matcher[],
      ...infer RestPossibleMatchers extends Matcher[][]
    ]
  ? ResolveNamedCaptureUnion<
      RestPossibleMatchers,
      PreviousNamedCaptures,
      CollectedNames | CollectCaptureNames<CurrentMatchers>
    >
  : never

export type StepMatch<
  InputString extends string,
  MatchingString extends string,
  StartOf extends boolean,
  MatchingType extends keyof CharSetMap
> = MatchingType extends 'string'
  ? InputString extends `${infer Matched extends MatchingString}${infer Rest}`
    ? MatchedResult<[Matched], Rest> // [matched: Matched, rest: Rest]
    : StartOf extends true
    ? NullResult<''> // null
    : InputString extends `${string}${infer Rest}`
    ? StepMatch<Rest, MatchingString, StartOf, MatchingType>
    : NullResult<''>
  : MatchingType extends 'boundary'
  ? InputString extends `${infer First}${infer Second}${infer Rest}`
    ? {
        o: NullResult<''>
        r: NullResult<''>
      } extends {
        o: StepMatch<First | Second, CharSetMap['char'], true, 'char'>
        r: StepMatch<Second | First, CharSetMap['nonChar'], true, 'nonChar'>
      }
      ? MatchedResult<[''], `${Second}${Rest}`> // [matched: '', rest: `${Second}${Rest}`]
      : StartOf extends true
      ? NullResult<''>
      : StepMatch<`${Second}${Rest}`, MatchingString, StartOf, MatchingType>
    : NullResult<''>
  : InputString extends `${infer FirstChar}${infer Rest}`
  ? MatchingString extends `${string}${FirstChar}${string}`
    ? MatchingType extends 'notCharSet' | 'nonChar' | 'nonDigit'
      ? StartOf extends true
        ? NullResult<''>
        : StepMatch<Rest, MatchingString, StartOf, MatchingType>
      : MatchedResult<[FirstChar], Rest> // [matched: FirstChar, rest: Rest]
    : MatchingType extends 'notCharSet' | 'nonChar' | 'nonDigit'
    ? MatchedResult<[FirstChar], Rest> // [matched: FirstChar, rest: Rest]
    : StartOf extends true
    ? NullResult<''>
    : StepMatch<Rest, MatchingString, StartOf, MatchingType>
  : NullResult<''>

export type NameCaptureValue<
  NameCpatureUnion extends NamedCapturesTuple,
  Key extends string,
  Value = Extract<NameCpatureUnion, [Key, any]>[1]
> = Value

export type ExpandOneOrMore<Matchers extends Matcher[], Greedy extends boolean> = [
  {
    type: 'captureLast'
    value: Matchers
  },
  {
    type: 'captureLast'
    value: [
      {
        type: 'zeroOrMore'
        greedy: Greedy
        value: Matchers
      }
    ]
  }
]

export type ExpandRepeat<
  Matchers extends Matcher[],
  From extends `${number}`,
  To extends `${number}` | '' | string,
  Greedy extends boolean,
  LargerThanFrom extends boolean = false,
  Count extends any[] = [],
  ExpandedMatchers extends Matcher[] = []
> = Count['length'] extends 201
  ? []
  : To extends `${Count['length']}`
  ? ExpandedMatchers
  : From extends `${Count['length']}`
  ? string extends To // ?ex: {2}
    ? ExpandedMatchers
    : To extends ''
    ? [
        ...ExpandedMatchers,
        {
          type: 'captureLast'
          value: [
            {
              type: 'zeroOrMore'
              greedy: Greedy
              value: Matchers
            }
          ]
        }
      ]
    : ExpandRepeat<
        Matchers,
        From,
        To,
        Greedy,
        true,
        [...Count, ''],
        [
          ...ExpandedMatchers,
          {
            type: 'captureLast'
            value: [
              {
                type: 'optional'
                greedy: Greedy
                value: Matchers
                repeat: [Count, To]
              }
            ]
          }
        ]
      >
  : LargerThanFrom extends true
  ? ExpandedMatchers
  : ExpandRepeat<
      Matchers,
      From,
      To,
      Greedy,
      LargerThanFrom,
      [...Count, ''],
      [...ExpandedMatchers, { type: 'captureLast'; value: Matchers }]
    >
