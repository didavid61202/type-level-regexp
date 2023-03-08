# 🔤🔍 Type-Level RegExp (WIP)

> A TypeScript type-level RegExp parser, matcher and permutation resolver.

## Origin & Notice
The main purpose of this project is to test and demonstrate the possibility and limitations of writing a RegExp parser/matcher in TypeScript's type-level.

The idea for this project originated while I was working on improving the type hints of string.match and replace in [magic-regexp](https://github.com/danielroe/magic-regexp) (created by the most inspiring, resourceful, and kind [Daniel Roe](https://github.com/danielroe) from Nuxt, definitely check it out if you are working with RegExp and TypeScript!).

As the complexity grows, I start working on this separated repo to increase development speed and try out different iterations. Hopefully, it can be ported back to [magic-regexp](https://github.com/danielroe/magic-regexp), and even [Gabriel Vergnaud](https://github.com/gvergnaud)'s awesome [hotscript](https://github.com/gvergnaud/hotscript) when it's stable with good performance.

❤️ Testing, feedbacks and PRs are welcome!
 
## Features

- Enhance types of RegExp related `String` functions for literal or dynamic typed string.
- Result of `String` functions matched exactly as runtime result.
- Support all common RegExp tokens (incl. Lookarounds, Backreferences...etc), quantifiers (incl. greedy/lazy) and (`g`,`i`) flags.
- Provide generic type `ParseRegExp` to parse and RegExp string to AST.
- Provide generic type `MatchRegExp` to match giving string with a parsed RegExp.
- Provide generic type `ResolvePermutation` to permutation all possible matching string of given RegExp if possible (due to TypeScript type-level limitation)
- More details please see [Tests](./test) and Playground.

🚧 Work In Progress, PRs and issue are welcome 🚧

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 🔥 and ❤️

Published under [MIT License](./LICENCE).