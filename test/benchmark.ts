import { createTSProject, logTypeInferenceText, runTypeInferenceBenchmark } from './utils'

const project = createTSProject()

logTypeInferenceText(
  project,
  file => file.getTypeAliasOrThrow('Result'),
  `
    import { MatchRegExp } from 'type-level-regexp'
    
    type Result = MatchRegExp<
    'ad@3od9Msq',
    \`^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$\`,
    never>
    `
)

runTypeInferenceBenchmark(
  { project, benchOptions: { iterations: 800, warmupIterations: 100 } },
  file => file.getTypeAliasOrThrow('Result'),
  {
    'parse-baseline.ts': `
    import { ParseRegExp } from 'type-level-regexp'

    type Result = ParseRegExp<'a'>
    `,
    'parse-password.ts': `
    import { ParseRegExp } from 'type-level-regexp'
    
    type Result = ParseRegExp<\`^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$\`>`,
    'match-complex.ts': `
    import { MatchRegExp } from 'type-level-regexp'
    
    type Result = MatchRegExp<
    'bAR-fOo-baR-baz-quX-BAr',
    \`(?<g1>B[a-z]r)\\\\W\\\\b(?<g2>Fo[G-Y])(?<=foO)-(?<g3>Beh|bA(?<g4>r|k))-BAZ(?=-(?<g5>Q[O-Z]x-\\\\k<g3>))\`,
    'i'>`,
    'match-password.ts': `
    import { MatchRegExp } from 'type-level-regexp'
    
    type Result = MatchRegExp<
    'ad@3od9Msq',
    \`^(?=.*(?<lower>[a-z]))(?=.*(?<upper>[A-Z]))(?=.*(?<digit>\\\\d))(?=.*(?<special>[!@#$%^&*])).{8,}$\`,
    never>
    `,
    // 'permutation.ts': `import { MatchRegExp } from 'type-level-regexp'

    // type Result = MatchRegExp<
    // string,
    //  \`(?<g1>B[a-z]r)\\\\W\\\\b(?<g2>Fo[G-Y])(?<=foO)-(?<g3>Beh|bA(?<g4>r|k))-BAZ(?=-(?<g5>Q[O-Z]x-\\\\k<g3>))\`,
    //  never>`,
  }
)
