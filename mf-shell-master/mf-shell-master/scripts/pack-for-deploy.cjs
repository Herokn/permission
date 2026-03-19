const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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
  'fe/dist', // 确保前端构建产物被打包
  '.npmrc', // 将 .npmrc 打包进去，确保服务器安装依赖时使用相同的配置
]

console.log('🚀 开始打包部署文件...')

// 0. 自动生成 .npmrc 文件（如果不存在）
const npmrcPath = path.join(ROOT_DIR, '.npmrc')
if (!fs.existsSync(npmrcPath)) {
  console.log('ℹ️  创建 .npmrc 文件以优化依赖安装 (node-linker=hoisted)...')
  // 使用 hoisted 模式，避免 pnpm 软链接在生产环境带来的路径解析问题
  fs.writeFileSync(npmrcPath, 'node-linker=hoisted\n')
}

// 0.1 复制环境文件为 server/.env (为了方便服务器部署，无需手动重命名)
const envFile = path.join(ROOT_DIR, `server/.env.${mode}`)
const targetEnvFile = path.join(ROOT_DIR, 'server/.env')
let hasCopiedEnv = false

if (fs.existsSync(envFile)) {
  console.log(`ℹ️  将 ${path.basename(envFile)} 复制为 server/.env 以便打包...`)
  fs.copyFileSync(envFile, targetEnvFile)
  hasCopiedEnv = true
  // 将新生成的 .env 加入打包列表
  FILES_TO_PACK.push('server/.env')
} else {
  console.warn(`⚠️  未找到环境文件: ${envFile}，请确保本地存在该文件。`)
}

// 1. 确保构建已经完成
if (!fs.existsSync(path.join(ROOT_DIR, 'server/dist'))) {
  console.error('❌ 错误: 未找到 server/dist，请先执行 npm run build:test')
  if (hasCopiedEnv) fs.unlinkSync(targetEnvFile) // 清理临时文件
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
} finally {
  // 清理临时生成的 .env 文件，保持本地环境清洁
  if (hasCopiedEnv && fs.existsSync(targetEnvFile)) {
    fs.unlinkSync(targetEnvFile)
    console.log('🧹 已清理临时文件 server/.env')
  }
}
