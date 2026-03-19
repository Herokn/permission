#!/bin/bash

# ================================================
# 统一权限管理平台 - 启动脚本
# ================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}"
echo "================================================"
echo "    统一权限管理平台 - 启动中..."
echo "================================================"
echo -e "${NC}"

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"

# 检查后端 jar 是否存在
JAR_FILE=$(find "$PROJECT_DIR/permission-bootstrap/target" -name "permission-bootstrap-*.jar" -type f | head -1)
if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}✗ 未找到后端 jar 文件，请先运行 deploy.sh 进行编译${NC}"
    exit 1
fi

# 检查前端依赖是否安装
if [ ! -d "$PROJECT_DIR/permission-web-frontend/node_modules" ]; then
    echo -e "${YELLOW}! 前端依赖未安装，正在安装...${NC}"
    cd "$PROJECT_DIR/permission-web-frontend"
    npm install
fi

# 启动后端
echo -e "${YELLOW}[1/2] 启动后端服务...${NC}"
cd "$PROJECT_DIR"
nohup java -jar "$JAR_FILE" > "$PROJECT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_DIR/logs/backend.pid"
echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
echo -e "  日志文件: $PROJECT_DIR/logs/backend.log"

# 等待后端启动
echo -e "${YELLOW}  等待后端启动...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 后端服务就绪${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ 后端启动超时，请检查日志: $PROJECT_DIR/logs/backend.log${NC}"
        exit 1
    fi
    sleep 1
done

# 启动前端
echo -e "${YELLOW}[2/2] 启动前端服务...${NC}"
cd "$PROJECT_DIR/permission-web-frontend"
nohup npm run dev > "$PROJECT_DIR/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_DIR/logs/frontend.pid"
echo -e "${GREEN}✓ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"
echo -e "  日志文件: $PROJECT_DIR/logs/frontend.log"

# 等待前端启动
sleep 3

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}          服务启动完成！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}【访问地址】${NC}"
echo -e "  前端: ${GREEN}http://localhost:3000${NC}"
echo -e "  后端: ${GREEN}http://localhost:8080${NC}"
echo -e "  API:  ${GREEN}http://localhost:8080/doc.html${NC}"
echo ""
echo -e "${BLUE}【测试账号】${NC}"
echo -e "  管理员: ${GREEN}admin${NC} / ${GREEN}admin123${NC}"
echo -e "  用户:   ${GREEN}user1${NC} / ${GREEN}user123${NC}"
echo ""
echo -e "${BLUE}【停止服务】${NC}"
echo -e "  ${YELLOW}$PROJECT_DIR/stop-all.sh${NC}"
echo ""
