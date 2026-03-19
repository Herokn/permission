package com.permission.biz.manager.impl;

import com.permission.biz.manager.UserAuthManager;
import com.permission.biz.event.PermissionChangedEvent;
import com.permission.common.annotation.AuditLog;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.enums.PermissionEffectEnum;
import com.permission.common.enums.RoleScopeEnum;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.dal.dataobject.*;
import com.permission.service.*;
import com.permission.service.cache.AuthzCacheService;
import com.permission.biz.dto.userauth.AssignUserRoleDTO;
import com.permission.biz.dto.userauth.BatchAssignRoleDTO;
import com.permission.biz.dto.userauth.BatchGrantPermissionDTO;
import com.permission.biz.dto.userauth.GrantUserPermissionDTO;
import com.permission.biz.vo.userauth.UserAuthDetailVO;
import com.permission.biz.vo.userauth.UserDirectPermissionVO;
import com.permission.biz.vo.userauth.UserRoleVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 用户授权 Manager 实现
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserAuthManagerImpl implements UserAuthManager {

    private final UserRoleService userRoleService;
    private final UserPermissionService userPermissionService;
    private final RoleService roleService;
    private final PermissionService permissionService;
    private final ProjectService projectService;
    private final AuthzCacheService authzCacheService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 校验项目 ID 存在性（如果指定了项目）
     */
    private void validateProjectExists(String projectId) {
        if (StringUtils.hasText(projectId)) {
            ProjectDO project = projectService.getByCode(projectId);
            if (project == null) {
                throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "ASSIGN", targetType = "user_role")
    public void assignRole(AssignUserRoleDTO dto) {
        // 1. 校验角色存在
        RoleDO role = roleService.getById(dto.getRoleId());
        if (role == null) {
            throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
        }
        if (!CommonStatusEnum.ENABLED.getCode().equals(role.getStatus())) {
            throw new BusinessException(ErrorCode.ROLE_DISABLED, role.getCode());
        }

        // 2. 全局角色不支持指定项目
        if (RoleScopeEnum.GLOBAL.getCode().equals(role.getRoleScope())
                && StringUtils.hasText(dto.getProjectId())) {
            throw new BusinessException(ErrorCode.GLOBAL_ROLE_NO_PROJECT);
        }

        // 3. 校验项目存在性
        validateProjectExists(dto.getProjectId());

        // 4. 幂等分配
        userRoleService.assign(dto.getUserId(), dto.getRoleId(), dto.getProjectId());

        // 5. 清除用户缓存
        authzCacheService.evictUser(dto.getUserId());
        
        // 6. 发布权限变更事件
        eventPublisher.publishEvent(PermissionChangedEvent.roleAssign(
                dto.getUserId(), dto.getRoleId(), "SYSTEM"));
        log.info("用户角色分配完成，已清除用户 {} 的鉴权缓存", dto.getUserId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "BATCH_ASSIGN", targetType = "user_role")
    public void batchAssignRole(BatchAssignRoleDTO dto) {
        // 1. 校验角色存在
        RoleDO role = roleService.getById(dto.getRoleId());
        if (role == null) {
            throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
        }
        if (!CommonStatusEnum.ENABLED.getCode().equals(role.getStatus())) {
            throw new BusinessException(ErrorCode.ROLE_DISABLED, role.getCode());
        }

        // 2. 全局角色不支持指定项目
        if (RoleScopeEnum.GLOBAL.getCode().equals(role.getRoleScope())
                && StringUtils.hasText(dto.getProjectId())) {
            throw new BusinessException(ErrorCode.GLOBAL_ROLE_NO_PROJECT);
        }

        // 3. 校验项目存在性
        validateProjectExists(dto.getProjectId());

        // 4. 批量分配
        for (String userId : dto.getUserIds()) {
            userRoleService.assign(userId, dto.getRoleId(), dto.getProjectId());
        }

        // 5. 批量清除缓存
        authzCacheService.evictUsers(dto.getUserIds());
        log.info("批量用户角色分配完成，共 {} 个用户", dto.getUserIds().size());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "BATCH_REVOKE", targetType = "user_role")
    public void batchRevokeRole(BatchAssignRoleDTO dto) {
        // 批量移除
        for (String userId : dto.getUserIds()) {
            userRoleService.revoke(userId, dto.getRoleId(), dto.getProjectId());
        }

        // 批量清除缓存
        authzCacheService.evictUsers(dto.getUserIds());
        log.info("批量用户角色移除完成，共 {} 个用户", dto.getUserIds().size());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "REVOKE", targetType = "user_role")
    public void revokeRole(AssignUserRoleDTO dto) {
        // 幂等移除
        userRoleService.revoke(dto.getUserId(), dto.getRoleId(), dto.getProjectId());

        // 清除用户缓存
        authzCacheService.evictUser(dto.getUserId());
        
        // 发布权限变更事件
        eventPublisher.publishEvent(PermissionChangedEvent.roleRevoke(
                dto.getUserId(), dto.getRoleId(), "SYSTEM"));
        log.info("用户角色移除完成，已清除用户 {} 的鉴权缓存", dto.getUserId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "ASSIGN", targetType = "user_permission")
    public void grantPermission(GrantUserPermissionDTO dto) {
        // 1. 校验权限点存在
        PermissionDO perm = permissionService.getByCode(dto.getPermissionCode());
        if (perm == null) {
            throw new BusinessException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        // 2. 校验 effect 枚举
        PermissionEffectEnum.fromCode(dto.getEffect());

        // 3. 校验项目存在性
        validateProjectExists(dto.getProjectId());

        // 4. 幂等授予
        userPermissionService.grant(dto.getUserId(), dto.getPermissionCode(),
                dto.getEffect(), dto.getProjectId());

        // 5. 清除用户缓存
        authzCacheService.evictUser(dto.getUserId());
        
        // 6. 发布权限变更事件
        eventPublisher.publishEvent(PermissionChangedEvent.permissionGrant(
                dto.getUserId(), dto.getPermissionCode(), "SYSTEM"));
        log.info("用户权限授予完成，已清除用户 {} 的鉴权缓存", dto.getUserId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "BATCH_GRANT", targetType = "user_permission")
    public void batchGrantPermission(BatchGrantPermissionDTO dto) {
        // 1. 校验权限点存在
        PermissionDO perm = permissionService.getByCode(dto.getPermissionCode());
        if (perm == null) {
            throw new BusinessException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        // 2. 校验 effect 枚举
        PermissionEffectEnum.fromCode(dto.getEffect());

        // 3. 校验项目存在性
        validateProjectExists(dto.getProjectId());

        // 4. 批量授予
        for (String userId : dto.getUserIds()) {
            userPermissionService.grant(userId, dto.getPermissionCode(),
                    dto.getEffect(), dto.getProjectId());
        }

        // 5. 批量清除缓存
        for (String userId : dto.getUserIds()) {
            authzCacheService.evictUser(userId);
        }
        log.info("批量用户权限授予完成，共 {} 个用户", dto.getUserIds().size());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "BATCH_REVOKE", targetType = "user_permission")
    public void batchRevokePermission(BatchGrantPermissionDTO dto) {
        // 校验 effect 枚举
        PermissionEffectEnum.fromCode(dto.getEffect());

        // 批量移除
        for (String userId : dto.getUserIds()) {
            userPermissionService.revoke(userId, dto.getPermissionCode(),
                    dto.getEffect(), dto.getProjectId());
        }

        // 批量清除缓存
        for (String userId : dto.getUserIds()) {
            authzCacheService.evictUser(userId);
        }
        log.info("批量用户权限移除完成，共 {} 个用户", dto.getUserIds().size());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "USER_AUTH", action = "REVOKE", targetType = "user_permission")
    public void revokePermission(GrantUserPermissionDTO dto) {
        // 校验 effect 枚举
        PermissionEffectEnum.fromCode(dto.getEffect());
        // 幂等移除
        userPermissionService.revoke(dto.getUserId(), dto.getPermissionCode(),
                dto.getEffect(), dto.getProjectId());

        // 清除用户缓存
        authzCacheService.evictUser(dto.getUserId());
        
        // 发布权限变更事件
        eventPublisher.publishEvent(PermissionChangedEvent.permissionRevoke(
                dto.getUserId(), dto.getPermissionCode(), "SYSTEM"));
        log.info("用户权限移除完成，已清除用户 {} 的鉴权缓存", dto.getUserId());
    }

    @Override
    public UserAuthDetailVO getUserAuthDetail(String userId) {
        UserAuthDetailVO detail = new UserAuthDetailVO();
        detail.setUserId(userId);

        // 1. 查询用户角色（批量优化）
        List<UserRoleDO> userRoles = userRoleService.listByUserId(userId);
        if (!userRoles.isEmpty()) {
            List<Long> roleIds = userRoles.stream()
                    .map(UserRoleDO::getRoleId)
                    .distinct()
                    .collect(Collectors.toList());
            Map<Long, RoleDO> roleMap = roleService.listByIds(roleIds).stream()
                    .collect(Collectors.toMap(RoleDO::getId, r -> r));
            
            List<UserRoleVO> roleVOs = userRoles.stream().map(ur -> {
                UserRoleVO vo = new UserRoleVO();
                vo.setRoleId(ur.getRoleId());
                vo.setProjectId(ur.getProjectId());
                RoleDO role = roleMap.get(ur.getRoleId());
                if (role != null) {
                    vo.setRoleCode(role.getCode());
                    vo.setRoleName(role.getName());
                    vo.setRoleScope(role.getRoleScope());
                    vo.setStatus(role.getStatus());
                }
                return vo;
            }).collect(Collectors.toList());
            detail.setRoles(roleVOs);
        }

        // 2. 查询用户直接权限（批量优化）
        List<UserPermissionDO> userPerms = userPermissionService.listByUserId(userId);
        if (!userPerms.isEmpty()) {
            Set<String> permCodes = userPerms.stream()
                    .map(UserPermissionDO::getPermissionCode)
                    .collect(Collectors.toSet());
            Map<String, PermissionDO> permMap = permissionService.listByCodes(new ArrayList<>(permCodes)).stream()
                    .collect(Collectors.toMap(PermissionDO::getCode, p -> p));
            
            List<UserDirectPermissionVO> permVOs = userPerms.stream().map(up -> {
                UserDirectPermissionVO vo = new UserDirectPermissionVO();
                vo.setPermissionCode(up.getPermissionCode());
                vo.setEffect(up.getEffect());
                vo.setProjectId(up.getProjectId());
                PermissionDO perm = permMap.get(up.getPermissionCode());
                if (perm != null) {
                    vo.setPermissionName(perm.getName());
                    vo.setStatus(perm.getStatus());
                }
                return vo;
            }).collect(Collectors.toList());
            detail.setDirectPermissions(permVOs);
        }

        return detail;
    }
}

