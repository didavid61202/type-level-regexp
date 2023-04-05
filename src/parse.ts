import type { Matcher } from './utils'

type ShorthandMap = {
  s: 'whitespace'
  S: 'nonWhitespace'
  w: 'char'
  W: 'nonChar'
  d: 'digit'
  D: 'nonDigit'
  b: 'boundary'
  B: 'nonBoundary'
}

type IgnoreEscapedChar = {
  '0': '\0'
  t: '\t'
  v: '\v'
  r: '\r'
  n: '\n'
  f: '\f'
}

export type RegExpSyntaxError<Msg extends string = string> = {
  type: 'RegExpSyntaxError'
  message: Msg
} & SyntaxError

export type ParseRegExp<
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
      : ParseRegExp<
          Rest,
          [...ParsedMatchers, ...ResolvesAccStringMatcher<AccString>, { type: 'any' }],
          ParseOrAsTupleOnly
        >
    : FirstChar extends '^'
    ? ParseRegExp<Rest> extends infer StarOfInnerMatchersOrError
      ? StarOfInnerMatchersOrError extends RegExpSyntaxError
        ? StarOfInnerMatchersOrError
        : [{ type: 'startOf'; value: StarOfInnerMatchersOrError }]
      : never
    : FirstChar extends '$'
    ? [
        {
          type: 'endOf'
          value: [...ParsedMatchers, ...ResolvesAccStringMatcher<AccString>]
        }
      ]
    : FirstChar extends '\\'
    ? Rest extends `k<${infer GroupName}>${infer RestAfterBackreference}`
      ? RestAfterBackreference extends `${'?' | '*' | '+' | '{'}${string}`
        ? ResolveQuantifierForSingleToken<
            [{ type: 'backreference'; value: GroupName }],
            RestAfterBackreference,
            ParsedMatchers,
            AccString,
            ParseOrAsTupleOnly
          >
        : ParseRegExp<
            RestAfterBackreference,
            [
              ...ParsedMatchers,
              ...ResolvesAccStringMatcher<AccString>,
              { type: 'backreference'; value: GroupName }
            ],
            ParseOrAsTupleOnly
          >
      : Rest extends `${infer EscapedChar}${infer RestAfterEscapedChar}`
      ? EscapedChar extends keyof IgnoreEscapedChar
        ? ParseRegExp<
            RestAfterEscapedChar,
            ParsedMatchers,
            ParseOrAsTupleOnly,
            `${AccString}${IgnoreEscapedChar[EscapedChar]}`
          >
        : EscapedChar extends keyof ShorthandMap
        ? RestAfterEscapedChar extends `${'?' | '*' | '+' | '{'}${string}`
          ? ResolveQuantifierForSingleToken<
              [{ type: ShorthandMap[EscapedChar] }],
              RestAfterEscapedChar,
              ParsedMatchers,
              AccString,
              ParseOrAsTupleOnly
            >
          : ParseRegExp<
              RestAfterEscapedChar,
              [
                ...ParsedMatchers,
                ...ResolvesAccStringMatcher<AccString>,
                { type: ShorthandMap[EscapedChar] }
              ],
              ParseOrAsTupleOnly
            >
        : ParseRegExp<
            RestAfterEscapedChar,
            ParsedMatchers,
            ParseOrAsTupleOnly,
            `${AccString}${EscapedChar}`
          >
      : never
    : FirstChar extends '|'
    ? ParseOrAsTupleOnly extends true
      ? ParseRegExp<Rest, [], true> extends infer RestOrMatchersTuple
        ? [
            [
              ...ParsedMatchers,
              ...ResolvesAccStringMatcher<AccString>
            ] extends infer CurrentOrMatchersTuple
              ? CurrentOrMatchersTuple extends []
                ? [{ type: 'string'; value: '' }]
                : CurrentOrMatchersTuple
              : never,
            ...(RestOrMatchersTuple extends Matcher[][]
              ? RestOrMatchersTuple extends []
                ? [[{ type: 'string'; value: '' }]]
                : RestOrMatchersTuple
              : [RestOrMatchersTuple])
          ]
        : never
      : ParseRegExp<Rest, [], true> extends infer RestOrMatchersTuple
      ? [
          {
            type: 'or'
            value: [
              [
                ...ParsedMatchers,
                ...ResolvesAccStringMatcher<AccString>
              ] extends infer CurrentOrMatchersTuple
                ? CurrentOrMatchersTuple extends []
                  ? [{ type: 'string'; value: '' }]
                  : CurrentOrMatchersTuple
                : never,
              ...(RestOrMatchersTuple extends Matcher[][]
                ? RestOrMatchersTuple extends []
                  ? [[{ type: 'string'; value: '' }]]
                  : RestOrMatchersTuple
                : [RestOrMatchersTuple])
            ]
          }
        ]
      : never
    : FirstChar extends '['
    ? ParsePair<FirstChar, Rest> extends infer ParsePairResult
      ? ParsePairResult extends RegExpSyntaxError<any>
        ? ParsePairResult
        : ParsePairResult extends [
            `${infer SetFirstChar}${infer RestAfterSetFirstChar}`,
            infer Rest extends string
          ]
        ? Rest extends `${'?' | '*' | '+' | '{'}${string}`
          ? ResolveQuantifierForSingleToken<
              [
                {
                  type: SetFirstChar extends '^' ? 'notCharSet' : 'charSet'
                  value: SetFirstChar extends '^'
                    ? RestAfterSetFirstChar
                    : `${SetFirstChar}${RestAfterSetFirstChar}`
                }
              ],
              Rest,
              ParsedMatchers,
              AccString,
              ParseOrAsTupleOnly
            >
          : ParseRegExp<
              Rest,
              [
                ...ParsedMatchers,
                ...ResolvesAccStringMatcher<AccString>,
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
      : never
    : FirstChar extends '('
    ? ParsePair<FirstChar, Rest> extends infer ParsePairResult
      ? ParsePairResult extends RegExpSyntaxError<any>
        ? ParsePairResult
        : ParsePairResult extends [
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
                matcherType: infer Quantifier extends
                  | 'optional'
                  | 'zeroOrMore'
                  | 'oneOrMore'
                  | 'repeat'
                  | undefined,
                greedy: infer Greedy extends boolean,
                repeat: infer Repeat extends [`${number}`, `${number}` | '' | string] | undefined
              ]
            >
          ]
        ? ParseRegExp<Inner> extends infer ParsedInnerResult
          ? ParsedInnerResult extends Matcher[]
            ? ParseRegExp<
                Rest,
                [
                  ...ParsedMatchers,
                  ...ResolvesAccStringMatcher<AccString>,
                  ...ResolveQuantifierTypeMatcher<
                    Quantifier,
                    Greedy,
                    Repeat,
                    ResolveEncloseTypeMatcher<Type, positiveOrName, ParsedInnerResult>
                  >
                ],
                ParseOrAsTupleOnly
              >
            : ParsedInnerResult
          : never
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
    : ParseRegExp<Rest, ParsedMatchers, ParseOrAsTupleOnly, `${AccString}${FirstChar}`>
  : [...ParsedMatchers, ...ResolvesAccStringMatcher<AccString>]

type ResolvesAccStringMatcher<AccString> = AccString extends ''
  ? []
  : [{ type: 'string'; value: AccString }]

type ResolveQuantifierForSingleToken<
  CurrentTokenResolvedMatchers extends Matcher[],
  Rest extends string,
  ParsedMatchers extends Matcher[],
  AccString extends string,
  ParseOrAsTupleOnly extends boolean
> = Rest extends `${infer Quantifier extends '?' | '*' | '+'}${infer RestAfterQuantifier}`
  ? ParseRegExp<
      RestAfterQuantifier extends `?${infer RestAfterGreedy}`
        ? RestAfterGreedy
        : RestAfterQuantifier,
      [
        ...ParsedMatchers,
        ...ResolvesAccStringMatcher<AccString>,
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
    ? RepeatInner extends '{'
      ? ParseRegExp<
          `{${RestAfterRepeat}`,
          [
            ...ParsedMatchers,
            ...ResolvesAccStringMatcher<AccString>,
            ...CurrentTokenResolvedMatchers
          ],
          ParseOrAsTupleOnly
        >
      : ParseRegExp<
          RestAfterRepeat extends `?${infer RestAfterGreedy}` ? RestAfterGreedy : RestAfterRepeat,
          [
            ...ParsedMatchers,
            ...ResolvesAccStringMatcher<AccString>,
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
      ? OpenBracket extends '['
        ? [`${ResolvedInner}${Inner}`, InnerAfterCloseBracket]
        : OpenBracket extends '{'
        ? `${ResolvedInner}${Inner}` extends `${number}` | `${number},${number}` | `${number},`
          ? [`${ResolvedInner}${Inner}`, InnerAfterCloseBracket]
          : ['{', `${ResolvedInner}${InputRest}`]
        : ResolveInner<`${ResolvedInner}${Inner}`> extends infer ResolvedInner
        ? ResolvedInner extends InnerResult<any, any>
          ? [ResolvedInner, ResolveRest<InnerAfterCloseBracket>]
          : ResolvedInner
        : never
      : ParsePair<
          OpenBracket,
          InnerAfterCloseBracket,
          OpenBracketCount,
          [...CloseBracketCount, ''],
          `${ResolvedInner}${Inner}${CloseBracketMap[OpenBracket]}`
        >
    : never
  : OpenBracket extends '{'
  ? ['{', `${ResolvedInner}${InputRest}`]
  : RegExpSyntaxError<`Invalid regular expression, missing closing \`${CloseBracketMap[OpenBracket]}\``>

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
  : Inner extends `?<${infer InnerIncludeClosingBracket}`
  ? Inner extends `?<${infer GroupName}>${infer InnerAferNamedGroup}`
    ? GroupName extends ''
      ? RegExpSyntaxError<`Invalid regular expression, capture group name can not be empty for capturing \`${InnerAferNamedGroup}\``>
      : InnerResult<InnerAferNamedGroup, ['namedCapture', GroupName]>
    : RegExpSyntaxError<`Invalid regular expression, invalid capture group name of \`${InnerIncludeClosingBracket}\`, possibly due to a missing closing '>' for group name`>
  : Inner extends `?${string}>${infer SyntaxErrorInner}`
  ? RegExpSyntaxError<`Invalid regular expression, invalid capture group name for capturing \`${SyntaxErrorInner}\`, possibly due to a missing opening '<' and group name`>
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
    ? RepeatInner extends '{'
      ? RestResult<Rest, [undefined, false, undefined]>
      : RestResult<
          RestAfterRepeat extends `?${infer RestAfterGreedyOp}`
            ? RestAfterGreedyOp
            : RestAfterRepeat,
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
