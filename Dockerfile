# 多阶段构建
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
COPY permission-common/pom.xml permission-common/
COPY permission-dal/pom.xml permission-dal/
COPY permission-service/pom.xml permission-service/
COPY permission-biz/pom.xml permission-biz/
COPY permission-web/pom.xml permission-web/
COPY permission-bootstrap/pom.xml permission-bootstrap/
COPY permission-test/pom.xml permission-test/

# 先下载依赖（利用 Docker 缓存）
RUN mvn dependency:go-offline -B

# 拷贝源码
COPY permission-common/src permission-common/src
COPY permission-dal/src permission-dal/src
COPY permission-service/src permission-service/src
COPY permission-biz/src permission-biz/src
COPY permission-web/src permission-web/src
COPY permission-bootstrap/src permission-bootstrap/src

# 构建
RUN mvn clean package -DskipTests -B

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 安装 wget 用于健康检查
RUN apk add --no-cache wget tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

COPY --from=builder /app/permission-bootstrap/target/*.jar app.jar

# 创建非 root 用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

# JVM 优化参数
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

