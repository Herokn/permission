import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

export function loadEnvFromMeta(metaUrl: string, relativeDir = '..', prefix = '.env') {
  const dir = dirname(fileURLToPath(metaUrl))
  const mode = process.env.NODE_ENV || 'development'
  const envPath = path.join(dir, relativeDir, `${prefix}.${mode}`)
  if (!fs.existsSync(envPath)) return
  const txt = fs.readFileSync(envPath, 'utf-8')
  for (const line of txt.split(/\r?\n/)) {
    const m = /^([^#=]+)=(.*)$/.exec(line)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}
