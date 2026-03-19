#!/bin/bash

# ================================================
# 统一权限管理平台 - 停止脚本
# ================================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$PROJECT_DIR/logs"

echo -e "${YELLOW}停止所有服务...${NC}"

# 停止后端
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        sleep 2
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            kill -9 "$BACKEND_PID" 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ 后端服务已停止 (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}! 后端服务未运行${NC}"
    fi
    rm -f "$PID_DIR/backend.pid"
else
    echo -e "${YELLOW}! 未找到后端 PID 文件${NC}"
fi

# 停止前端
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
        sleep 2
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            kill -9 "$FRONTEND_PID" 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ 前端服务已停止 (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}! 前端服务未运行${NC}"
    fi
    rm -f "$PID_DIR/frontend.pid"
else
    echo -e "${YELLOW}! 未找到前端 PID 文件${NC}"
fi

echo -e "${GREEN}所有服务已停止${NC}"
