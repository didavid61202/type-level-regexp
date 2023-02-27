import { Matcher } from './utils'

type ShorthandMap = {
  w: 'char'
  W: 'nonChar'
  d: 'digit'
  D: 'nonDigit'
  b: 'boundary'
}

export type ParseRegexp<
  InputString extends string,
  ParsedMatchers extends Matcher[] = [],
  ParseOrAsTupleOnly extends boolean = false,
  AccString extends string = ''
> = InputString extends `${infer FirstChar}${infer Rest}`
  ? FirstChar extends '.'
    ? Rest extends `${'?' | '*' | '+' | '{'}${string}`
      ? ResolveQuantifierForSingleToken<
          [{ type: 'any' }],
          Rest,
          ParsedMatchers,
          AccString,
          ParseOrAsTupleOnly
        >
      : ParseRegexp<
          Rest,
          [
            ...ParsedMatchers,
            ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }]),
            { type: 'any' }
          ],
          ParseOrAsTupleOnly
        >
    : FirstChar extends '^'
    ? ParseRegexp<Rest> extends infer StarOfInnerMatchers
      ? [{ type: 'startOf'; value: StarOfInnerMatchers }]
      : never
    : FirstChar extends '$'
    ? [
        {
          type: 'endOf'
          value: [
            ...ParsedMatchers,
            ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }])
          ]
        }
      ]
    : FirstChar extends '\\'
    ? Rest extends `${infer EscapedChar}${infer RestAfterEscapedChar}`
      ? EscapedChar extends keyof ShorthandMap
        ? RestAfterEscapedChar extends `${'?' | '*' | '+' | '{'}${string}`
          ? ResolveQuantifierForSingleToken<
              [{ type: ShorthandMap[EscapedChar] }],
              RestAfterEscapedChar,
              ParsedMatchers,
              AccString,
              ParseOrAsTupleOnly
            >
          : ParseRegexp<
              RestAfterEscapedChar,
              [
                ...ParsedMatchers,
                ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }]),
                { type: ShorthandMap[EscapedChar] }
              ],
              ParseOrAsTupleOnly
            >
        : ParseRegexp<
            RestAfterEscapedChar,
            ParsedMatchers,
            ParseOrAsTupleOnly,
            `${AccString}${EscapedChar}`
          >
      : never
    : FirstChar extends '|'
    ? ParseOrAsTupleOnly extends true
      ? ParseRegexp<Rest, [], true> extends infer RestOrMatchersTuple
        ? [
            [
              ...ParsedMatchers,
              ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }])
            ],
            ...(RestOrMatchersTuple extends Matcher[][]
              ? RestOrMatchersTuple
              : [RestOrMatchersTuple])
          ]
        : never
      : ParseRegexp<Rest, [], true> extends infer RestOrMatchersTuple
      ? [
          {
            type: 'or'
            value: [
              [
                ...ParsedMatchers,
                ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }])
              ],
              ...(RestOrMatchersTuple extends Matcher[][]
                ? RestOrMatchersTuple
                : [RestOrMatchersTuple])
            ]
          }
        ]
      : never
    : FirstChar extends '['
    ? ParsePair<FirstChar, Rest> extends [
        `${infer SetFirstChar}${infer RestAfterSetFirstChar}`,
        infer Rest extends string
      ]
      ? ParseRegexp<
          Rest,
          [
            ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }]),
            ...ParsedMatchers,
            {
              type: SetFirstChar extends '^' ? 'notCharSet' : 'charSet'
              value: SetFirstChar extends '^'
                ? RestAfterSetFirstChar
                : `${SetFirstChar}${RestAfterSetFirstChar}`
            }
          ],
          ParseOrAsTupleOnly
        >
      : never
    : FirstChar extends '('
    ? ParsePair<FirstChar, Rest> extends [
        InnerResult<
          infer Inner extends string,
          [
            matcherType: infer Type extends Matcher['type'] | 'nonCaputre',
            positiveOrName: infer positiveOrName extends string | boolean | undefined
          ]
        >,
        RestResult<
          infer Rest extends string,
          [
            matcherType: infer Quantifier extends Matcher['type'] | undefined,
            greedy: infer Greedy extends boolean,
            repeat: infer Repeat extends [`${number}`, `${number}` | '' | string] | undefined
          ]
        >
      ]
      ? ParseRegexp<Inner> extends infer ResovledInner extends Matcher[]
        ? ParseRegexp<
            Rest,
            [
              ...ParsedMatchers,
              ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }]),
              ...ResolveQuantifierTypeMatcher<
                Quantifier,
                Greedy,
                Repeat,
                ResolveEncloseTypeMatcher<Type, positiveOrName, ResovledInner>
              >
            ],
            ParseOrAsTupleOnly
          >
        : never
      : never
    : Rest extends `${'?' | '*' | '+' | '{'}${string}`
    ? ResolveQuantifierForSingleToken<
        [{ type: 'string'; value: FirstChar }],
        Rest,
        ParsedMatchers,
        AccString,
        ParseOrAsTupleOnly
      >
    : ParseRegexp<Rest, ParsedMatchers, ParseOrAsTupleOnly, `${AccString}${FirstChar}`>
  : [...ParsedMatchers, { type: 'string'; value: AccString }]

type ResolveQuantifierForSingleToken<
  CurrentTokenResolvedMatchers extends Matcher[],
  Rest extends string,
  ParsedMatchers extends Matcher[],
  AccString extends string,
  ParseOrAsTupleOnly extends boolean
> = Rest extends `${infer Quantifier extends '?' | '*' | '+'}${infer RestAfterQuantifier}`
  ? ParseRegexp<
      RestAfterQuantifier extends `?${infer RestAfterGreedy}`
        ? RestAfterGreedy
        : RestAfterQuantifier,
      [
        ...ParsedMatchers,
        ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }]),
        ...ResolveQuantifierTypeMatcher<
          QuantifierMap[Quantifier],
          RestAfterQuantifier extends `?${string}` ? false : true,
          undefined,
          CurrentTokenResolvedMatchers
        >
      ],
      ParseOrAsTupleOnly
    >
  : Rest extends `{${infer RpeatQuantifierWRest}`
  ? ParsePair<'{', RpeatQuantifierWRest> extends [
      infer RepeatInner extends string,
      infer RestAfterRepeat extends string
    ]
    ? ParseRegexp<
        RestAfterRepeat extends `?${infer RestAfterGreedy}` ? RestAfterGreedy : RestAfterRepeat,
        [
          ...ParsedMatchers,
          ...(AccString extends '' ? [] : [{ type: 'string'; value: AccString }]),
          ...ResolveQuantifierTypeMatcher<
            'repeat',
            RestAfterRepeat extends `?${string}` ? false : true,
            `{${RepeatInner}}` extends `{${infer From}${'' | `,${infer To}`}}`
              ? [Extract<From, `${number}`>, To]
              : undefined,
            CurrentTokenResolvedMatchers
          >
        ],
        ParseOrAsTupleOnly
      >
    : never
  : never

type ResolveQuantifierTypeMatcher<
  Quantifier extends Matcher['type'] | undefined,
  Greedy extends boolean,
  Repeat extends [`${number}`, `${number}` | '' | string] | undefined,
  QuantifyPattern extends Matcher[]
> = Quantifier extends undefined
  ? QuantifyPattern //TODO: should show error msg when wrapping lookaround matcher
  : Quantifier extends 'optional' | 'zeroOrMore' | 'oneOrMore'
  ? [
      {
        type: Quantifier
        greedy: Greedy
        value: QuantifyPattern
      }
    ]
  : [Quantifier, Repeat] extends [
      'repeat',
      [infer From extends `${number}`, infer To extends `${number}` | '' | string]
    ]
  ? [
      {
        type: Quantifier
        greedy: Greedy
        from: From
        to: To
        value: QuantifyPattern
      }
    ]
  : never

type ResolveEncloseTypeMatcher<
  Type extends Matcher['type'] | 'nonCaputre',
  positiveOrName extends string | boolean | undefined,
  ResovledInner extends Matcher[]
> = Type extends 'capture'
  ? [
      {
        type: Type
        value: ResovledInner
      }
    ]
  : Type extends 'namedCapture'
  ? [
      {
        type: Type
        name: positiveOrName extends string ? positiveOrName : never
        value: ResovledInner
      }
    ]
  : Type extends 'lookahead' | 'lookbehind'
  ? [
      {
        type: Type
        positive: positiveOrName extends boolean ? positiveOrName : never
        value: ResovledInner
      }
    ]
  : ResovledInner

type CloseBracketMap = { '(': ')'; '[': ']'; '{': '}' }

type ParsePair<
  OpenBracket extends '(' | '[' | '{',
  InputRest extends string,
  OpenBracketCount extends any[] = [''],
  CloseBracketCount extends any[] = [],
  ResolvedInner extends string = ''
> = InputRest extends `${infer Inner}${OpenBracket | CloseBracketMap[OpenBracket]}${string}`
  ? true extends Extract<Inner extends `${string}${OpenBracket}${string}` ? true : false, true>
    ? InputRest extends `${infer Inner}${OpenBracket}${infer InnerAfterOpenBracket}`
      ? ParsePair<
          OpenBracket,
          InnerAfterOpenBracket,
          [...OpenBracketCount, ''],
          CloseBracketCount,
          `${ResolvedInner}${Inner}${OpenBracket}`
        >
      : never
    : InputRest extends `${infer Inner}${CloseBracketMap[OpenBracket]}${infer InnerAfterCloseBracket}`
    ? Inner extends `${string}\\`
      ? ParsePair<
          OpenBracket,
          InnerAfterCloseBracket,
          OpenBracketCount,
          CloseBracketCount,
          `${ResolvedInner}${Inner}${CloseBracketMap[OpenBracket]}`
        >
      : [...CloseBracketCount, '']['length'] extends OpenBracketCount['length']
      ? OpenBracket extends '[' | '{'
        ? [`${ResolvedInner}${Inner}`, InnerAfterCloseBracket]
        : [ResolveInner<`${ResolvedInner}${Inner}`>, ResolveRest<InnerAfterCloseBracket>]
      : ParsePair<
          OpenBracket,
          InnerAfterCloseBracket,
          OpenBracketCount,
          [...CloseBracketCount, ''],
          `${ResolvedInner}${Inner}${CloseBracketMap[OpenBracket]}`
        >
    : never
  : never

type InnerResult<
  ResolvedInner extends string,
  Type extends [matcherType: Matcher['type'] | 'nonCaputre', positiveOrName: any]
> = {
  resovledInner: ResolvedInner
  type: Type
}

type ResolveInner<Inner extends string> = Inner extends `?<${infer CaptureType extends
  | '='
  | '!'}${infer InnerAferLookBehind}`
  ? InnerResult<InnerAferLookBehind, ['lookbehind', CaptureType extends '=' ? true : false]>
  : Inner extends `?${infer CaptureType extends ':' | '=' | '!'}${infer InnerAferNonCapOrLookahead}`
  ? InnerResult<
      InnerAferNonCapOrLookahead,
      [
        CaptureType extends ':' ? 'nonCaputre' : 'lookahead',
        CaptureType extends ':' ? undefined : CaptureType extends '=' ? true : false
      ]
    >
  : Inner extends `?<${infer GroupName}>${infer InnerAferNamedGroup}`
  ? InnerResult<InnerAferNamedGroup, ['namedCapture', GroupName]>
  : InnerResult<Inner, ['capture', undefined]>

type RestResult<
  ResolvedRest extends string,
  Quantifier extends [
    matcherType: Matcher['type'] | undefined,
    greedy: boolean,
    repeat: [string, string] | undefined
  ]
> = {
  resovledRest: ResolvedRest
  quantifier: Quantifier
}

type QuantifierMap = { '?': 'optional'; '*': 'zeroOrMore'; '+': 'oneOrMore' }

type ResolveRest<Rest extends string> = Rest extends `${infer Quantifier extends
  | '?'
  | '*'
  | '+'}${infer RestAfterQuantifier}`
  ? RestResult<
      RestAfterQuantifier extends `?${infer RestAfterGreedyOp}`
        ? RestAfterGreedyOp
        : RestAfterQuantifier,
      [
        QuantifierMap[Quantifier],
        RestAfterQuantifier extends `?${string}` ? false : true,
        undefined
      ]
    >
  : Rest extends `{${infer RpeatOpWRest}`
  ? ParsePair<'{', RpeatOpWRest> extends [
      infer RepeatInner extends string,
      infer RestAfterRepeat extends string
    ]
    ? RestResult<
        RestAfterRepeat extends `?${infer RestAfterGreedyOp}` ? RestAfterGreedyOp : RestAfterRepeat,
        [
          'repeat',
          RestAfterRepeat extends `?${string}` ? false : true,
          `{${RepeatInner}}` extends `{${infer From}${'' | `,${infer To}`}}`
            ? [Exclude<From, `${string},${string}`>, To]
            : undefined
        ]
      >
    : never
  : RestResult<Rest, [undefined, false, undefined]>