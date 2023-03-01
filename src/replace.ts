import { ExhaustiveMatch } from './match'
import { NamedCapturesTuple, Matcher, MatchedResult } from './utils'

export type ResolveRepalceValue<
  ReplaceValue extends string,
  Precedes extends string,
  MatchArray extends (string | undefined)[],
  RestInputString extends string,
  NamedCaptures extends NamedCapturesTuple,
  ResultRepalceString extends string = ''
> = ReplaceValue extends `${infer Before}$${infer After}`
  ? After extends `${infer FirstChar extends
      | '$'
      | '&'
      | '`'
      | "'"
      | '0'
      | Extract<keyof MatchArray, `${number}`>}${infer Rest}`
    ? ResolveRepalceValue<
        Rest,
        Precedes,
        MatchArray,
        RestInputString,
        NamedCaptures,
        `${ResultRepalceString}${Before}${({
          $: '$'
          '&': MatchArray[0]
          '`': Precedes
          "'": RestInputString
          '0': '$0'
        } & { [K in keyof MatchArray]: K extends '0' ? '$0' : MatchArray[K] })[FirstChar]}`
      >
    : After extends `<${infer Name extends NamedCaptures[0]}>${infer Rest}`
    ? ResolveRepalceValue<
        Rest,
        Precedes,
        MatchArray,
        RestInputString,
        NamedCaptures,
        `${ResultRepalceString}${Before}${{
          [K in NamedCaptures[0]]: Extract<NamedCaptures, [K, any]>[1]
        }[Name]}`
      >
    : ResolveRepalceValue<
        After,
        Precedes,
        MatchArray,
        RestInputString,
        NamedCaptures,
        `${ResultRepalceString}${Before}$`
      >
  : `${ResultRepalceString}${ReplaceValue}`

export type GlobalReplace<
  InputString extends string,
  Matchers extends Matcher[],
  ReplaceValue extends string,
  AccPrecedes extends string = '',
  ResultString extends string = ''
> = ExhaustiveMatch<InputString, Matchers> extends infer Result
  ? Result extends MatchedResult<
      infer MatchArray extends any[],
      infer RestInputString extends string,
      infer NamedCaptures extends NamedCapturesTuple
    >
    ? InputString extends `${infer Precedes}${MatchArray[0]}${RestInputString}`
      ? GlobalReplace<
          RestInputString,
          Matchers,
          ReplaceValue,
          Precedes,
          `${ResultString}${Precedes}${ResolveRepalceValue<
            ReplaceValue,
            `${AccPrecedes}${MatchArray[0]}${Precedes}`,
            MatchArray,
            RestInputString,
            NamedCaptures
          >}`
        >
      : never
    : `${ResultString}${InputString}`
  : never
