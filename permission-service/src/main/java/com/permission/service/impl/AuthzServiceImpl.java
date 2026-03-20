package com.permission.service.impl;

import com.permission.common.config.PermissionConfig;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.enums.PermissionEffectEnum;
import com.permission.dal.dataobject.*;
import com.permission.service.*;
import com.permission.service.model.AuthzResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 鉴权 Service 实现
 * 鉴权优先级：DENY > ALLOW > 用户角色权限 > 组织角色权限 > 默认拒绝
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthzServiceImpl implements AuthzService {

    private final PermissionService permissionService;
    private final UserPermissionService userPermissionService;
    private final UserRoleService userRoleService;
    private final RoleService roleService;
    private final RolePermissionService rolePermissionService;
    private final UserOrgService userOrgService;
    private final OrgRoleService orgRoleService;
    private final OrganizationService organizationService;
    private final PermissionConfig permissionConfig;

    @Override
    public AuthzResult check(String userId, String permissionCode, String projectId) {
        // Step 0: 校验权限点
        PermissionDO permission = permissionService.getByCode(permissionCode);
        if (permission == null || !CommonStatusEnum.ENABLED.getCode().equals(permission.getStatus())) {
            return AuthzResult.denied("权限点无效或已禁用");
        }

        // Step 1: 检查用户直接 DENY（优先级最高）
        UserPermissionDO denyRecord = userPermissionService.findDeny(userId, permissionCode, projectId);
        if (denyRecord != null) {
            String projectInfo = denyRecord.getProjectId() != null
                    ? "（项目 " + denyRecord.getProjectId() + "）" : "（全局）";
            return AuthzResult.denied("被直接 DENY 覆盖" + projectInfo);
        }

        // Step 2: 检查用户直接 ALLOW
        UserPermissionDO allowRecord = userPermissionService.findAllow(userId, permissionCode, projectId);
        if (allowRecord != null) {
            String projectInfo = allowRecord.getProjectId() != null
                    ? "（项目 " + allowRecord.getProjectId() + "）" : "（全局）";
            return AuthzResult.allowed("来自直接授权 ALLOW" + projectInfo);
        }

        // Step 3: 检查用户直接角色权限
        List<UserRoleDO> userRoles = userRoleService.listByUserIdAndProjectId(userId, projectId);
        if (!userRoles.isEmpty()) {
            List<Long> roleIds = userRoles.stream()
                    .map(UserRoleDO::getRoleId)
                    .distinct()
                    .toList();
            Map<Long, RoleDO> roleMap = roleService.listByIds(roleIds).stream()
                    .collect(Collectors.toMap(RoleDO::getId, r -> r));
            Set<Long> validRoleIds = roleMap.values().stream()
                    .filter(r -> CommonStatusEnum.ENABLED.getCode().equals(r.getStatus()))
                    .map(RoleDO::getId)
                    .collect(Collectors.toSet());
            Set<String> roleIdsWithPermission = rolePermissionService.listByRoleIdsAndPermissionCode(validRoleIds, permissionCode);
            if (!roleIdsWithPermission.isEmpty()) {
                for (UserRoleDO userRole : userRoles) {
                    if (roleIdsWithPermission.contains(String.valueOf(userRole.getRoleId()))) {
                        RoleDO role = roleMap.get(userRole.getRoleId());
                        String projectInfo = userRole.getProjectId() != null
                                ? "（项目 " + userRole.getProjectId() + "）" : "（全局）";
                        return AuthzResult.allowed("来自角色 " + role.getCode() + " 授权" + projectInfo);
                    }
                }
            }
        }

        // Step 4: 检查用户组织角色权限（含上级组织继承）
        AuthzResult orgResult = checkOrgRolePermission(userId, permissionCode, projectId);
        if (orgResult != null) {
            return orgResult;
        }

        // Step 5: 默认拒绝
        return AuthzResult.denied("默认拒绝：无匹配授权");
    }

    /**
     * 检查用户通过组织获得的角色权限
     * 1. 查找用户所属的所有组织
     * 2. 对每个组织，收集该组织及所有上级组织的ID
     * 3. 查询这些组织关联的角色（同时过滤项目隔离）
     * 4. 检查角色是否包含目标权限
     */
    private AuthzResult checkOrgRolePermission(String userId, String permissionCode, String projectId) {
        List<UserOrgDO> userOrgs = userOrgService.listByUserId(userId);
        if (userOrgs.isEmpty()) {
            return null;
        }

        Set<Long> allOrgIds = new HashSet<>();
        Map<Long, OrganizationDO> orgCache = new HashMap<>();

        for (UserOrgDO userOrg : userOrgs) {
            collectAncestorOrgIds(userOrg.getOrgId(), allOrgIds, orgCache);
        }

        if (allOrgIds.isEmpty()) {
            return null;
        }

        // 使用新的带 projectId 过滤的查询方法
        Long projectIdLong = projectId != null ? Long.valueOf(projectId) : null;
        List<OrgRoleDO> orgRoles = orgRoleService.listByOrgIdsAndProjectId(new ArrayList<>(allOrgIds), projectIdLong);
        if (orgRoles.isEmpty()) {
            return null;
        }

        List<Long> roleIds = orgRoles.stream()
                .map(OrgRoleDO::getRoleId)
                .distinct()
                .toList();
        Map<Long, RoleDO> roleMap = roleService.listByIds(roleIds).stream()
                .collect(Collectors.toMap(RoleDO::getId, r -> r));

        Set<Long> validRoleIds = roleMap.values().stream()
                .filter(r -> CommonStatusEnum.ENABLED.getCode().equals(r.getStatus()))
                .map(RoleDO::getId)
                .collect(Collectors.toSet());

        Set<String> roleIdsWithPermission = rolePermissionService.listByRoleIdsAndPermissionCode(validRoleIds, permissionCode);

        if (!roleIdsWithPermission.isEmpty()) {
            for (OrgRoleDO orgRole : orgRoles) {
                if (roleIdsWithPermission.contains(String.valueOf(orgRole.getRoleId()))) {
                    RoleDO role = roleMap.get(orgRole.getRoleId());
                    OrganizationDO org = orgCache.get(orgRole.getOrgId());
                    String orgName = org != null ? org.getOrgName() : String.valueOf(orgRole.getOrgId());
                    return AuthzResult.allowed("来自组织「" + orgName + "」的角色 " + role.getCode() + " 授权");
                }
            }
        }

        return null;
    }

    /**
     * 递归收集组织及其所有祖先组织的ID
     * 添加深度限制防止极端情况下的无限递归
     */
    private void collectAncestorOrgIds(Long orgId, Set<Long> allOrgIds, Map<Long, OrganizationDO> orgCache) {
        collectAncestorOrgIdsInternal(orgId, allOrgIds, orgCache, 0);
    }

    private void collectAncestorOrgIdsInternal(Long orgId, Set<Long> allOrgIds, Map<Long, OrganizationDO> orgCache, int depth) {
        int maxDepth = permissionConfig.getOrgMaxDepth();
        
        if (orgId == null || allOrgIds.contains(orgId)) {
            return;
        }

        if (depth > maxDepth) {
            log.warn("组织祖先链深度超过{}层，可能存在循环引用，orgId={}, depth={}", maxDepth, orgId, depth);
            // TODO: 可接入监控系统埋点，如 Micrometer Counter
            // Metrics.counter("permission.org.depth.exceeded", "orgId", String.valueOf(orgId)).increment();
            return;
        }

        OrganizationDO org = orgCache.computeIfAbsent(orgId, organizationService::getById);
        if (org == null) {
            return;
        }

        allOrgIds.add(orgId);
        if (org.getParentId() != null) {
            collectAncestorOrgIdsInternal(org.getParentId(), allOrgIds, orgCache, depth + 1);
        }
    }

    @Override
    public Set<String> getUserPermissionCodes(String userId, String projectId) {
        Set<String> permissionCodes = new HashSet<>();

        // 当 projectId 为 null 时，查询用户所有角色（包括各项目的角色）
        // 当 projectId 不为 null 时，只查询指定项目 + 全局角色
        List<UserRoleDO> userRoles;
        if (projectId == null) {
            userRoles = userRoleService.listByUserId(userId);
        } else {
            userRoles = userRoleService.listByUserIdAndProjectId(userId, projectId);
        }
        
        if (!userRoles.isEmpty()) {
            List<Long> roleIds = userRoles.stream()
                    .map(UserRoleDO::getRoleId)
                    .distinct()
                    .toList();
            Map<Long, RoleDO> roleMap = roleService.listByIds(roleIds).stream()
                    .collect(Collectors.toMap(RoleDO::getId, r -> r));
            Set<Long> validRoleIds = roleMap.values().stream()
                    .filter(r -> CommonStatusEnum.ENABLED.getCode().equals(r.getStatus()))
                    .map(RoleDO::getId)
                    .collect(Collectors.toSet());

            for (Long roleId : validRoleIds) {
                List<RolePermissionDO> rolePerms = rolePermissionService.listByRoleId(roleId);
                rolePerms.forEach(rp -> permissionCodes.add(rp.getPermissionCode()));
            }
        }

        List<UserOrgDO> userOrgs = userOrgService.listByUserId(userId);
        if (!userOrgs.isEmpty()) {
            Set<Long> allOrgIds = new HashSet<>();
            Map<Long, OrganizationDO> orgCache = new HashMap<>();
            for (UserOrgDO userOrg : userOrgs) {
                collectAncestorOrgIds(userOrg.getOrgId(), allOrgIds, orgCache);
            }

            for (Long orgId : allOrgIds) {
                List<OrgRoleDO> orgRoles = orgRoleService.listByOrgId(orgId);
                List<Long> orgRoleIds = orgRoles.stream()
                        .map(OrgRoleDO::getRoleId)
                        .toList();
                for (Long roleId : orgRoleIds) {
                    RoleDO role = roleService.getById(roleId);
                    if (role != null && CommonStatusEnum.ENABLED.getCode().equals(role.getStatus())) {
                        List<RolePermissionDO> rolePerms = rolePermissionService.listByRoleId(roleId);
                        rolePerms.forEach(rp -> permissionCodes.add(rp.getPermissionCode()));
                    }
                }
            }
        }

        // 用户直接 ALLOW：与 check() 一致须生效；此前仅聚合角色/组织角色，导致授权页勾选后登录态 permissions、modules 仍为空
        List<UserPermissionDO> directPerms = userPermissionService.listByUserId(userId);
        for (UserPermissionDO up : directPerms) {
            if (!PermissionEffectEnum.ALLOW.getCode().equals(up.getEffect())) {
                continue;
            }
            if (projectId == null || up.getProjectId() == null || projectId.equals(up.getProjectId())) {
                permissionCodes.add(up.getPermissionCode());
            }
        }

        return permissionCodes;
    }
}

