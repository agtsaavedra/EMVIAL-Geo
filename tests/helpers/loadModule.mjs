import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

export function loadPureModule(relativePath, exportNames) {
  const filePath = path.join(repoRoot, relativePath)
  const source = fs
    .readFileSync(filePath, 'utf-8')
    .replaceAll(
      /export function\s+([a-zA-Z0-9_]+)/g,
      'function $1'
    )

  const factory = new Function(
    `${source}\nreturn { ${exportNames.join(', ')} };`
  )

  return factory()
}
