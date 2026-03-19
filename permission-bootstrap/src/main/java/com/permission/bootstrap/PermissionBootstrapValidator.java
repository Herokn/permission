package com.permission.bootstrap;

import com.permission.common.constant.PermissionCode;
import com.permission.service.PermissionService;
import com.permission.dal.dataobject.PermissionDO;
import com.permission.common.enums.CommonStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 基础权限校验启动检查
 * 确保系统关键权限点在数据库中存在且启用
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionBootstrapValidator implements ApplicationRunner {

    private final PermissionService permissionService;

    /**
     * 必须存在且启用的权限编码列表
     */
    private static final String[] REQUIRED_PERMISSIONS = {
            PermissionCode.PERM_CENTER_MANAGE
    };

    @Override
    public void run(ApplicationArguments args) {
        log.info("开始校验基础权限配置...");
        
        for (String permissionCode : REQUIRED_PERMISSIONS) {
            PermissionDO permission = permissionService.getByCode(permissionCode);
            if (permission == null) {
                throw new IllegalStateException(
                        "必需的权限点不存在: " + permissionCode + 
                        "，请检查数据库初始化或运行 V8__add_missing_permissions.sql 迁移脚本");
            }
            if (!CommonStatusEnum.ENABLED.getCode().equals(permission.getStatus())) {
                throw new IllegalStateException(
                        "必需的权限点已禁用: " + permissionCode + 
                        "，该权限用于系统核心功能，请重新启用");
            }
            log.info("权限点校验通过: {} - {}", permissionCode, permission.getName());
        }
        
        log.info("基础权限配置校验完成，共校验 {} 个权限点", REQUIRED_PERMISSIONS.length);
    }
}
