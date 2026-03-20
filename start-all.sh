#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-full}"
RESET_DB="false"

# 检查是否需要重置数据库
if [[ "${2:-}" == "--reset-db" ]] || [[ "${1:-}" == "--reset-db" ]]; then
  RESET_DB="true"
fi

cd "$PROJECT_DIR"

# 检查 .env 文件
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "创建 .env 文件..."
    cp .env.example .env
    echo "请编辑 .env 文件，设置必要的环境变量（JWT_SECRET 和 DB_PASSWORD）"
    echo ""
  else
    echo "错误：找不到 .env.example 文件"
    exit 1
  fi
fi

# 检查 .env 文件中的必要变量
source .env 2>/dev/null || true
if [[ -z "${JWT_SECRET}" ]] || [[ "${JWT_SECRET}" == "your-jwt-secret-at-least-32-characters-long" ]]; then
  echo "警告：JWT_SECRET 未设置或使用默认值"
  echo "请生成一个安全的密钥：openssl rand -base64 32"
  echo ""
fi

if [[ -z "${DB_PASSWORD}" ]] || [[ "${DB_PASSWORD}" == "your-database-password" ]]; then
  echo "警告：DB_PASSWORD 未设置或使用默认值"
  echo "请设置一个安全的数据库密码"
  echo ""
fi

# 重置数据库
if [ "$RESET_DB" = "true" ]; then
  echo "正在重置数据库（删除所有数据）..."
  docker compose --profile micro-frontend down -v --remove-orphans
  docker compose down -v --remove-orphans
fi

# 清理端口占用（微前端模式）
if [ "$MODE" = "full" ] || [ "$MODE" = "micro-frontend" ]; then
  if command -v lsof >/dev/null 2>&1; then
    for p in 3050 4130 3032 4120; do
      pid="$(lsof -ti tcp:$p 2>/dev/null || true)"
      if [ -n "$pid" ]; then
        echo "清理端口 $p 占用 (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
      fi
    done
  fi
fi

# 启动服务
echo "正在启动服务..."
echo ""

case "$MODE" in
  core)
    echo "启动核心服务 (MySQL, Redis, 后端, 权限中心前端)..."
    docker compose up -d --build mysql redis backend frontend
    ;;
  user-center)
    echo "启动核心服务 + 用户中心前端..."
    docker compose up -d --build mysql redis backend frontend user-center-frontend
    ;;
  micro-frontend)
    echo "启动微前端模式 (包含 mf-shell 基座)..."
    docker compose --profile micro-frontend up -d --build
    ;;
  full|*)
    echo "启动完整服务 (核心服务 + 用户中心前端)..."
    docker compose up -d --build mysql redis backend frontend user-center-frontend
    ;;
esac

echo ""
echo "==================================="
echo "服务状态："
echo "==================================="
docker compose ps

# 检查后端健康状态
if docker ps -a --format '{{.Names}}' | grep -q '^permission-backend$'; then
  echo ""
  echo "等待后端服务启动..."
  for i in {1..30}; do
    backend_health="$(docker inspect -f '{{.State.Health.Status}}' permission-backend 2>/dev/null || echo "unknown")"
    if [ "$backend_health" = "healthy" ]; then
      echo "✓ 后端服务已就绪"
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "⚠ 后端服务状态: $backend_health"
      echo "如果启动失败，请运行: ./start-all.sh $MODE --reset-db"
    fi
    sleep 2
  done
fi

echo ""
echo "==================================="
echo "访问地址："
echo "==================================="
echo "权限中心前端:      http://localhost:3000"
echo "用户中心前端:      http://localhost:5174 (或通过权限中心内嵌访问)"
echo "后端 API:          http://localhost:8080/api"

if [ "$MODE" = "micro-frontend" ]; then
  echo "微前端基座:        http://localhost:3050"
  echo "微前端 API:        http://localhost:4130"
fi

echo ""
echo "==================================="
echo "默认账号："
echo "==================================="
if [ -n "${AUTH_ADMIN_PASS}" ]; then
  echo "管理员: admin / [已设置密码]"
else
  echo "管理员: admin / [密码未设置，请在 .env 中配置 AUTH_ADMIN_PASS]"
fi

if [ -n "${AUTH_USER1_PASS}" ]; then
  echo "普通用户: user1 / [已设置密码]"
else
  echo "普通用户: user1 / [密码未设置，请在 .env 中配置 AUTH_USER1_PASS]"
fi
echo ""
