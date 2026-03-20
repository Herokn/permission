#!/bin/bash
# MySQL 官方镜像仅在数据目录为空时执行 /docker-entrypoint-initdb.d/*
# 将完整库结构导入 MYSQL_DATABASE（与 compose 中库名一致）
set -euo pipefail
echo "[init] importing init_full.sql -> database: ${MYSQL_DATABASE}"
# 必须使用 utf8mb4，否则 permission.name 等中文会乱码
mysql --default-character-set=utf8mb4 -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" < /init-full.sql
echo "[init] done."
