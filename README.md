# 🔤🔍 Type-Level RegExp (WIP)

> TypeScript type-level RegExp parser and matcher implemented using template literals.

![Demo](https://user-images.githubusercontent.com/29917252/224330392-daeee9a5-d448-4f00-baf2-29365bdfa4b5.png)


[![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://stackblitz.com/~/github.com/didavid61202/type-level-regexp)

Examples in `Playground`, `test`

## Origin & Notice
The main purpose of this project is to test and demonstrate the possibility and limitations of writing a RegExp parser/matcher in TypeScript's type-level. Note that this may not be practically useful, but rather an interesting showcase.

The idea for this project originated while I was working on improving the type hints of string.match and replace in [magic-regexp](https://github.com/danielroe/magic-regexp) (created by the most inspiring, resourceful, and kind [Daniel Roe](https://github.com/danielroe) from [Nuxt](https://nuxt.com), definitely check it out if you are working with RegExp and TypeScript!).

As the complexity grows, I start working on this separated repo to increase development speed and try out different iterations. Hopefully, it can be ported back to [magic-regexp](https://github.com/danielroe/magic-regexp), and even [Gabriel Vergnaud](https://github.com/gvergnaud)'s awesome [hotscript](https://github.com/gvergnaud/hotscript) when it's stable with good performance.

❤️ Testing, feedbacks and PRs are welcome!
 
## Features

- Enhance types of RegExp related `String` functions for literal or dynamic typed string.
- Result of `String` functions matched exactly as runtime result.
- Support all common RegExp tokens (incl. Lookarounds, Backreferences...etc), quantifiers (incl. greedy/lazy) and (`g`,`i`) flags.
- Provide generic type `ParseRegExp` to parse and RegExp string to AST.
- Provide generic type `MatchRegExp` to match giving string with a parsed RegExp.
- Provide generic type `ResolvePermutation` to permutation all possible matching string of given RegExp if possible (due to TypeScript type-level limitation)
- More details please see [playground](./playground/index.ts), or test in [Tests](./test) or [Stackblitz](https://stackblitz.com/~/github.com/didavid61202/type-level-regexp). (examples in index.test-d.ts)

🚧 Work In Progress, PRs and issue are welcome 🚧

## Example - type-safe args in replacing function of `string.replace()`
![replaceRegexp](https://user-images.githubusercontent.com/29917252/224333879-50d51207-f63c-4ac6-b561-34ace9ebb7d4.JPG)


## RegExp Tokens & Flags

| Tokens | Description | Support |
| --- | --- | --- |
|  `.` | Matches any single character. | ✅ |
|  `*`, `*?` | Matches zero or more occurrences (Greedy/Lazy). | ✅ |
|  `+`, `*?` | Matches one or more occurrences (Greedy/Lazy). | ✅ |
|  `?`, `??` | Matches zero or one occurrence (Greedy/Lazy). | ✅ |
|  `^` | Matches the start of a line. | ✅ |
|  `$` | Matches the end of a line. | ✅ |
|  `\s`, `\S` | Matches any whitespace, non-whitespace character. | ✅ |
|  `\d`, `\D` | Matches any digit, non-digit character. | ✅ |
|  `\w`, `\W` | Matches any word, non-word character. | ✅ |
|  `\b` | Matches a word boundary. | ✅ |
|  `[abc]` | Matches any character in the set. | ✅ |
|  `[^abc]` | Matches any character not in the set. | ✅ |
|  `()` | Creates a capturing group. | ✅ |
|  `(?:)` | Creates a non-capturing group. | ✅ |
|  `(?<name>)` | Creates a named-capturing group. | ✅ |
|  `\|` | Matches either the expression before or after the vertical bar. | ✅ |
|  `{n}` | Matches exactly `n` occurrences. | ✅ |
|  `{n,}` | Matches at least `n` occurrences. | ✅ |
|  `{n,m}` | Matches between `n` and `m` occurrences. | ✅ |
|  `(?=)`, `(?!)` | Positive/Negative lookahead. | ✅ |
|  `(?<=)`, `(?<!)` | Positive/Negative lookbehind. | ✅ |

| Flags | Description | Support |
| --- | --- | --- |
|  `g` | Global matching (matches all occurrences). | ✅ |
|  `i` | Case-insensitive matching. | ✅ |

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 🔥 and ❤️

Published under [MIT License](./LICENCE).
