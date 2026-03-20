# Multi-stage build with better caching
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy ONLY pom files first (for dependency caching)
COPY pom.xml .
COPY permission-common/pom.xml permission-common/
COPY permission-dal/pom.xml permission-dal/
COPY permission-service/pom.xml permission-service/
COPY permission-biz/pom.xml permission-biz/
COPY permission-web/pom.xml permission-web/
COPY permission-bootstrap/pom.xml permission-bootstrap/
COPY permission-test/pom.xml permission-test/
COPY permission-user/pom.xml permission-user/

# Download dependencies (this layer is cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy source code
COPY permission-common/src permission-common/src
COPY permission-dal/src permission-dal/src
COPY permission-service/src permission-service/src
COPY permission-biz/src permission-biz/src
COPY permission-web/src permission-web/src
COPY permission-bootstrap/src permission-bootstrap/src
COPY permission-test/src permission-test/src
COPY permission-user/src permission-user/src

RUN mvn clean package -B

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

COPY --from=builder /app/permission-bootstrap/target/*.jar app.jar

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

# JVM options
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
