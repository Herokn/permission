import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

// 获取 __dirname (ESM 模式下需要手动获取)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const OUTPUT_NAME = 'deploy-package.tar.gz'
const ROOT_DIR = path.resolve(__dirname, '..')

// 获取环境参数
const args = process.argv.slice(2)
const modeArg = args.find((arg) => arg.startsWith('mode='))
const mode = modeArg ? modeArg.split('=')[1] : 'test' // 默认为 test

console.log(`ℹ️  当前打包环境: ${mode}`)

// 需要打包的文件和目录清单
const FILES_TO_PACK = [
  'package.json',
  'pnpm-workspace.yaml',
  'ecosystem.config.cjs',
  'server/dist',
  'server/package.json',
  `server/.env.${mode}`, // 动态包含对应环境的 env 文件
  'packages/shared/dist',
  'packages/shared/package.json',
]

console.log('🚀 开始打包部署文件...')

// 1. 确保构建已经完成
if (!fs.existsSync(path.join(ROOT_DIR, 'server/dist'))) {
  console.error('❌ 错误: 未找到 server/dist，请先执行 npm run build:test')
  process.exit(1)
}

// 2. 检查所有文件是否存在
const missingFiles = FILES_TO_PACK.filter((f) => !fs.existsSync(path.join(ROOT_DIR, f)))
if (missingFiles.length > 0) {
  console.warn('⚠️  警告: 以下文件未找到，将不会被打包:', missingFiles)
}

// 3. 执行 tar 命令
const files = FILES_TO_PACK.filter((f) => fs.existsSync(path.join(ROOT_DIR, f))).join(' ')
// 添加 COPYFILE_DISABLE=1 环境变量以禁止 macOS 生成 ._ 文件
const cmd = `COPYFILE_DISABLE=1 tar -czf ${OUTPUT_NAME} ${files}`

try {
  execSync(cmd, { cwd: ROOT_DIR, stdio: 'inherit' })
  console.log(`\n✅ 打包成功!`)
  console.log(`📦 文件位置: ${path.join(ROOT_DIR, OUTPUT_NAME)}`)
  console.log(`\n👉 接下来请将此文件上传到服务器并执行部署操作。`)
} catch (error) {
  console.error('❌ 打包失败:', error)
  process.exit(1)
}
