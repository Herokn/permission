#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry)
    const d = path.join(dest, entry)
    const stat = fs.statSync(s)
    if (stat.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

const here = path.dirname(new URL(import.meta.url).pathname)
const root = path.resolve(here, '..')
copyDir(path.join(root, 'src', 'types'), path.join(root, 'dist', 'types'))
