type UppercaseLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
type LowercaseLetter = 'abcdefghijklmnopqrstuvwxyz'
type Digit = '0123456789'
type Alphanumeric = `_${Digit}${UppercaseLetter}${LowercaseLetter}`
type Whitespace = ` \f\n\r\t\v\u00a0\u1680\u2000\u200a\u2028\u2029\u202f\u205f\u3000\ufeff`

type CommonChar =
  `!"#$%&'()*+,-./${Digit}:;<=>?@${UppercaseLetter}[\\]^_\`${LowercaseLetter}{|}~ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ΢ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψω`

type CaseMap = {
  a: 'A'
  b: 'B'
  c: 'C'
  d: 'D'
  e: 'E'
  f: 'F'
  g: 'G'
  h: 'H'
  i: 'I'
  j: 'J'
  k: 'K'
  l: 'L'
  m: 'M'
  n: 'N'
  o: 'O'
  p: 'P'
  q: 'Q'
  r: 'R'
  s: 'S'
  t: 'T'
  u: 'U'
  v: 'V'
  w: 'W'
  x: 'X'
  y: 'Y'
  z: 'Z'
  A: 'a'
  B: 'b'
  C: 'c'
  D: 'd'
  E: 'e'
  F: 'f'
  G: 'g'
  H: 'h'
  I: 'i'
  J: 'j'
  K: 'k'
  L: 'l'
  M: 'm'
  N: 'n'
  O: 'o'
  P: 'p'
  Q: 'q'
  R: 'r'
  S: 's'
  T: 't'
  U: 'u'
  V: 'v'
  W: 'w'
  X: 'x'
  Y: 'y'
  Z: 'z'
}

export interface CharSetMap<
  CharSet extends string = string,
  ResolvedCharSet extends string = ResolveCharSet<CharSet>
> {
  step: CharSet
  whitespace: Whitespace
  nonWhitespace: Whitespace
  char: Alphanumeric
  nonChar: Alphanumeric
  digit: Digit
  nonDigit: Digit
  charSet: ResolvedCharSet
  notCharSet: ResolvedCharSet
  boundary: string
  nonBoundary: string
}

export type InvertCharSetMap = {
  any: 'any'
  whitespace: 'nonWhitespace'
  nonWhitespace: 'whitespace'
  char: 'nonChar'
  nonChar: 'char'
  digit: 'nonDigit'
  nonDigit: 'digit'
  charSet: 'notCharSet'
  notCharSet: 'charSet'
}

export type ResolveCharSet<
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
      type: 'any' | Exclude<keyof CharSetMap, 'charSet' | 'notCharSet'> | 'endMark' | 'debug'
    }
  | {
      type: 'capture' | 'startOf' | 'endOf' | 'captureLast' | 'not'
      value: Matcher[]
    }
  | {
      type: 'optional'
      value: Matcher[]
      greedy: boolean
      repeat?: [from: any[], to: string]
    }
  | {
      type: 'zeroOrMore' | 'oneOrMore'
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
  MatchedArray extends (string | undefined)[],
  RestInputString extends string,
  NamedCaptures extends NamedCapturesTuple = never
> {
  matched: true
  results: MatchedArray
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

export type LengthOfString<
  String extends string,
  Count extends any[] = [],
  Length extends number = Count['length']
> = Length extends 990
  ? number
  : String extends `${string}${infer R}`
  ? LengthOfString<R, [...Count, '']>
  : Length

export type ConcatParialMatched<
  PartialMatched extends string | undefined,
  NestedNullResult,
  NestedPartialMatched extends string = NestedNullResult extends NullResult<
    infer Partial extends string,
    any,
    any
  >
    ? Partial
    : never
> = `${PartialMatched}${NestedPartialMatched}`

export type ConcatToFirstElement<
  Arr extends (string | undefined)[],
  AppendingString extends string | undefined
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

export type StringToUnion<
  S extends string,
  Original extends string = S,
  Union extends string = never,
  Count extends any[] = []
> = Count['length'] extends 13
  ? `[ any char in [${Original}] ]`
  : S extends `${infer Char}${infer Rest}`
  ? StringToUnion<Rest, Original, Union | Char, [...Count, '']>
  : Union

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

export type DeepMatchersIncludeType<
  Matchers extends Matcher[],
  Type extends Matcher['type'],
  Count extends any[] = [],
  CurrentMatcher extends Matcher = Matchers[Count['length']]
> = Count['length'] extends Matchers['length']
  ? false
  : CurrentMatcher extends { type: Type }
  ? true
  : CurrentMatcher extends { value: infer NestMatchers extends Matcher[] }
  ? DeepMatchersIncludeType<NestMatchers, Type>
  : CurrentMatcher extends { value: infer NestOrMatchers extends Matcher[][] }
  ? Extract<DeepMatchersIncludeType<NestOrMatchers[number], Type>, true> extends never
    ? false
    : true
  : false

export type StepMatch<
  InputString extends string,
  MatchingString extends string,
  StartOf extends boolean,
  MatchingType extends keyof CharSetMap,
  CaseInsensitive extends boolean = false,
  AccMatchedString extends string = ''
> = MatchingType extends 'step'
  ? InputString extends `${infer FirstChar}${infer Rest}`
    ? MatchingString extends `${infer FirstMatchingChar}${infer MatchingRest}`
      ? FirstChar extends
          | FirstMatchingChar
          | (CaseInsensitive extends true
              ? FirstMatchingChar extends keyof CaseMap
                ? CaseMap[FirstMatchingChar]
                : never
              : never)
        ? StepMatch<
            Rest,
            MatchingRest,
            StartOf,
            MatchingType,
            CaseInsensitive,
            `${AccMatchedString}${FirstChar}`
          >
        : StartOf extends true
        ? NullResult<''>
        : InputString extends `${string}${infer Rest}`
        ? StepMatch<
            Rest,
            `${AccMatchedString}${MatchingString}`,
            StartOf,
            MatchingType,
            CaseInsensitive
          >
        : NullResult<''>
      : AccMatchedString extends ''
      ? NullResult<''>
      : MatchedResult<[AccMatchedString], InputString>
    : AccMatchedString extends ''
    ? NullResult<''>
    : MatchedResult<[AccMatchedString], ''>
  : MatchingType extends 'string'
  ? InputString extends `${infer Matched extends MatchingString}${infer Rest}`
    ? MatchedResult<[Matched], Rest>
    : StartOf extends true
    ? NullResult<''>
    : InputString extends `${string}${infer Rest}`
    ? StepMatch<Rest, MatchingString, StartOf, MatchingType, CaseInsensitive>
    : NullResult<''>
  : MatchingType extends 'boundary' | 'nonBoundary'
  ? InputString extends `${infer First}${infer Second}${infer Rest}`
    ? {
        o: NullResult<''>
        r: NullResult<''>
      } extends {
        o: StepMatch<First | Second, CharSetMap['char'], true, 'char', CaseInsensitive>
        r: StepMatch<Second | First, CharSetMap['nonChar'], true, 'nonChar', CaseInsensitive>
      }
      ? MatchedResult<[''], `${Second}${Rest}`>
      : MatchingType extends 'nonBoundary'
      ? MatchedResult<[''], `${Second}${Rest}`>
      : StartOf extends true
      ? NullResult<''>
      : StepMatch<`${Second}${Rest}`, MatchingString, StartOf, MatchingType, CaseInsensitive>
    : NullResult<''>
  : InputString extends `${infer FirstChar}${infer Rest}`
  ? MatchingString extends `${string}${
      | FirstChar
      | (CaseInsensitive extends true
          ? FirstChar extends keyof CaseMap
            ? CaseMap[FirstChar]
            : never
          : never)}${string}`
    ? MatchingType extends 'notCharSet' | 'nonChar' | 'nonDigit' | 'nonWhitespace'
      ? StartOf extends true
        ? NullResult<''>
        : StepMatch<Rest, MatchingString, StartOf, MatchingType, CaseInsensitive>
      : MatchedResult<[FirstChar], Rest>
    : MatchingType extends 'notCharSet' | 'nonChar' | 'nonDigit' | 'nonWhitespace'
    ? MatchedResult<[FirstChar], Rest>
    : StartOf extends true
    ? NullResult<''>
    : StepMatch<Rest, MatchingString, StartOf, MatchingType, CaseInsensitive>
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

export type RestMatchersBeforeBackReference<
  Matchers extends Matcher[],
  Index extends any[],
  ResultMatchers extends Matcher[] = []
> = Index['length'] extends Matchers['length']
  ? ResultMatchers extends infer R extends Matcher[]
    ? R
    : never
  : DeepMatchersIncludeType<[Matchers[Index['length']]], 'backreference'> extends true
  ? ResultMatchers extends infer R extends Matcher[]
    ? R
    : never
  : RestMatchersBeforeBackReference<
      Matchers,
      [...Index, ''],
      [...ResultMatchers, Matchers[Index['length']]]
    >

export type FlattenLookahead<
  Matchers extends Matcher[],
  ReduceOrMoreMatcher extends boolean = true,
  FlattenMatchers extends Matcher[] = [],
  Count extends any[] = [],
  CurrentMatcer extends Matcher = Matchers[Count['length']]
> = Count['length'] extends Matchers['length']
  ? FlattenMatchers
  : CurrentMatcer extends {
      type: 'or'
      value: infer NestedArrMatchers extends Matcher[][]
    }
  ? FlattenLookahead<
      Matchers,
      ReduceOrMoreMatcher,
      [
        ...FlattenMatchers,
        {
          type: 'or'
          value: {
            [K in keyof NestedArrMatchers]: FlattenLookahead<
              NestedArrMatchers[K],
              ReduceOrMoreMatcher
            >
          }
        }
      ],
      [...Count, '']
    >
  : CurrentMatcer extends {
      type: 'lookahead'
      value: infer NestedMatchers extends Matcher[]
      positive: infer Positive extends boolean
    }
  ? FlattenLookahead<
      NestedMatchers,
      ReduceOrMoreMatcher
    > extends infer FlattenNestedMatchers extends Matcher[]
    ? Positive extends false
      ? FlattenLookahead<
          Matchers,
          ReduceOrMoreMatcher,
          [...FlattenMatchers, { type: 'not'; value: FlattenNestedMatchers }],
          [...Count, '']
        >
      : FlattenLookahead<
          Matchers,
          ReduceOrMoreMatcher,
          [...FlattenMatchers, ...FlattenNestedMatchers],
          [...Count, '']
        >
    : never
  : CurrentMatcer extends { type: 'capture'; value: infer NestedMatchers extends Matcher[] }
  ? FlattenLookahead<
      NestedMatchers,
      ReduceOrMoreMatcher
    > extends infer FlattenNestedMatchers extends Matcher[]
    ? FlattenLookahead<
        Matchers,
        ReduceOrMoreMatcher,
        [...FlattenMatchers, ...FlattenNestedMatchers],
        [...Count, '']
      >
    : never
  : [ReduceOrMoreMatcher, CurrentMatcer] extends [
      true,
      {
        type: infer Type extends 'zeroOrMore' | 'oneOrMore'
        value: infer NestedMatchers extends [
          {
            type: keyof InvertCharSetMap
            value?: string
          }
        ]
      }
    ]
  ? NestedMatchers extends Matcher[]
    ? FlattenLookahead<
        Matchers,
        ReduceOrMoreMatcher,
        [
          ...FlattenMatchers,

          ...(Type extends 'zeroOrMore'
            ? [
                {
                  type: 'optional'
                  greedy: true
                  value: NestedMatchers
                }
              ]
            : NestedMatchers)
        ],
        [...Count, '']
      >
    : never
  : FlattenLookahead<Matchers, false, [...FlattenMatchers, CurrentMatcer], [...Count, '']>
