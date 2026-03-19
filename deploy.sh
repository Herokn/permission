#!/bin/bash

# ================================================
# 统一权限管理平台 - 一键部署脚本
# ================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}"
echo "================================================"
echo "    统一权限管理平台 - 一键部署脚本"
echo "================================================"
echo -e "${NC}"

# 检查 Java 环境
check_java() {
    echo -e "${YELLOW}[1/7] 检查 Java 环境...${NC}"
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 17 ]; then
            echo -e "${GREEN}✓ Java 17+ 已安装: $(java -version 2>&1 | head -n 1)${NC}"
        else
            echo -e "${RED}✗ 需要 Java 17 或更高版本，当前版本: $JAVA_VERSION${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ 未检测到 Java，请先安装 JDK 17+${NC}"
        exit 1
    fi
}

# 检查 Node.js 环境
check_node() {
    echo -e "${YELLOW}[2/7] 检查 Node.js 环境...${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 16 ]; then
            echo -e "${GREEN}✓ Node.js 16+ 已安装: $(node -v)${NC}"
        else
            echo -e "${RED}✗ 需要 Node.js 16 或更高版本，当前版本: $(node -v)${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ 未检测到 Node.js，请先安装 Node.js 16+${NC}"
        exit 1
    fi
}

# 检查 MySQL
check_mysql() {
    echo -e "${YELLOW}[3/7] 检查 MySQL 连接...${NC}"
    
    DB_PASSWORD=${DB_PASSWORD:-}
    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${RED}✗ 请设置 DB_PASSWORD 环境变量${NC}"
        echo -e "${YELLOW}  示例: export DB_PASSWORD=your_password${NC}"
        exit 1
    fi
    
    if command -v mysql &> /dev/null; then
        if mysql -u root -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; then
            echo -e "${GREEN}✓ MySQL 连接成功${NC}"
        else
            echo -e "${YELLOW}! MySQL 连接失败，请确保 MySQL 已启动且配置正确${NC}"
            read -p "是否继续部署？(y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}! 未检测到 MySQL 客户端，跳过连接检查${NC}"
        echo -e "${YELLOW}  请确保 MySQL 服务已启动${NC}"
    fi
}

# 创建数据库
create_database() {
    echo -e "${YELLOW}[4/7] 创建数据库...${NC}"
    if command -v mysql &> /dev/null; then
        mysql -u root -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS permission DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
        echo -e "${GREEN}✓ 数据库 'permission' 已准备就绪${NC}"
    else
        echo -e "${YELLOW}! 请手动创建数据库: CREATE DATABASE permission;${NC}"
    fi
}

# 编译后端
build_backend() {
    echo -e "${YELLOW}[5/7] 编译后端项目...${NC}"
    cd "$PROJECT_DIR"
    
    if [ -f "./mvnw" ]; then
        chmod +x ./mvnw
        ./mvnw clean package -DskipTests -q
    elif command -v mvn &> /dev/null; then
        mvn clean package -DskipTests -q
    else
        echo -e "${RED}✗ 未找到 Maven，请先安装 Maven 或使用 mvnw${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ 后端编译完成${NC}"
}

# 安装前端依赖
install_frontend() {
    echo -e "${YELLOW}[6/7] 安装前端依赖...${NC}"
    cd "$PROJECT_DIR/permission-web-frontend"
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
}

# 启动说明
print_start_info() {
    echo -e "${YELLOW}[7/7] 部署完成！${NC}"
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}          部署成功，启动方式如下：${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${BLUE}【方式一】分别启动后端和前端：${NC}"
    echo ""
    echo -e "  1. 启动后端 (新终端窗口):"
    echo -e "     ${YELLOW}cd $PROJECT_DIR${NC}"
    echo -e "     ${YELLOW}java -jar permission-bootstrap/target/permission-bootstrap-*.jar${NC}"
    echo ""
    echo -e "  2. 启动前端 (新终端窗口):"
    echo -e "     ${YELLOW}cd $PROJECT_DIR/permission-web-frontend${NC}"
    echo -e "     ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${BLUE}【方式二】使用启动脚本：${NC}"
    echo ""
    echo -e "     ${YELLOW}$PROJECT_DIR/start-all.sh${NC}"
    echo ""
    echo -e "${BLUE}【访问地址】${NC}"
    echo ""
    echo -e "  前端地址: ${GREEN}http://localhost:3000${NC}"
    echo -e "  后端地址: ${GREEN}http://localhost:8080${NC}"
    echo -e "  API 文档: ${GREEN}http://localhost:8080/doc.html${NC}"
    echo ""
    echo -e "${YELLOW}【提示】${NC}"
    echo -e "  请确保已设置以下环境变量："
    echo -e "  - JWT_SECRET: JWT 密钥（至少32字符）"
    echo -e "  - DB_PASSWORD: 数据库密码"
    echo -e "  - AUTH_ADMIN_PASS: 管理员密码（可选）"
    echo ""
}

# 主流程
main() {
    check_java
    check_node
    check_mysql
    create_database
    build_backend
    install_frontend
    print_start_info
}

main "$@"
