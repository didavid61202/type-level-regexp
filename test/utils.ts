import path from 'path'
import { fileURLToPath } from 'url'
import { Node, Project, SourceFile, ts, TypeFormatFlags } from 'ts-morph'
import { Bench, Options } from 'tinybench'

type GetTypeFn = (file: SourceFile) => Node<ts.Node>

let _project: Project | undefined

export function createTSProject() {
  return (
    _project ||
    new Project({
      tsConfigFilePath: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../tsconfig.json'
      ),
    })
  )
}

export function logTypeInferenceText(project: Project, getType: GetTypeFn, sourceFileText: string) {
  const typechecher = project.getTypeChecker()
  const file = project.createSourceFile('test.ts', sourceFileText, { overwrite: true })

  //warmup
  typechecher.getTypeAtLocation(getType(file)).getText(undefined, TypeFormatFlags.NoTruncation)

  console.time('logTypeInferenceText')
  const resultText = typechecher
    .getTypeAtLocation(getType(file))
    .getText(undefined, TypeFormatFlags.NoTruncation)
  console.timeEnd('logTypeInferenceText')

  console.log({ resultText })
}

export async function runTypeInferenceBenchmark(
  options: { project: Project; benchOptions?: Options },
  getType: GetTypeFn,
  fileMap: Record<string, string>
) {
  const { project, benchOptions } = options

  const typechecher = project.getTypeChecker()

  const bench = new Bench(benchOptions)

  for (const [fileName, content] of Object.entries(fileMap)) {
    const file = project.createSourceFile(fileName, content)

    bench.add(fileName, () => {
      typechecher.getTypeAtLocation(getType(file)).getText(undefined, TypeFormatFlags.NoTruncation)
    })
  }

  await bench.warmup()
  await bench.run()

  const minMean = Math.min(...bench.tasks.map(task => task.result?.mean || 0))

  console.table(
    bench.tasks.map(({ name, result }) => ({
      'Task Name': name,
      'Average Time (µs)': toThousandFraction(result?.mean),
      Ratio: `${roundTo((result?.mean || 0) / minMean + Number.EPSILON, 2)}x`,
      'Variance (µs)': toThousandFraction(result?.variance),
      'Min (µs)': toThousandFraction(result?.min),
      'Max (µs)': toThousandFraction(result?.max),
    }))
  )
}

const roundTo = (num: number, precision: number) => {
  const factor = Math.pow(10, precision)
  return Math.round(num * factor) / factor
}

const toThousandFraction = (second: number | undefined) =>
  second === undefined ? NaN : roundTo(second * 1000, 3)