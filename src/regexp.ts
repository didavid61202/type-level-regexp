export type Flag = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

const ValueS = Symbol('Value')
const FlagsS = Symbol('Flags')

export type TypedRegExp<Value extends string = string, Flags extends Flag = Flag> = RegExp & {
  [ValueS]: Value
  [FlagsS]: Flags
}

export type ExtractRegExpParts<RE extends TypedRegExp<string, Flag>> = RE extends TypedRegExp<
  infer Pattern,
  infer Flags
>
  ? RegExpParts<Pattern, Flags>
  : never

export type RegExpParts<Pattern extends string = string, Flags extends Flag = Flag> = {
  pattern: Pattern
  flags: Flags
}

export function createRegExp<Pattern extends string, Flags extends Flag = never>(
  pattern: Pattern,
  flags?: Flags[] | Set<Flags>
) {
  return new RegExp(pattern, [...(flags || '')].join('')) as TypedRegExp<Pattern, Flags>
}
