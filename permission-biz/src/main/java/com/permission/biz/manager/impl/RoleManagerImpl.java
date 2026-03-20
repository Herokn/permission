package com.permission.biz.manager.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.biz.manager.RoleManager;
import com.permission.biz.event.PermissionChangedEvent;
import com.permission.common.annotation.AuditLog;
import com.permission.common.constant.PermissionConstant;
import com.permission.common.context.UserContextHolder;
import com.permission.common.context.UserInfoDTO;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.enums.RoleDomainEnum;
import com.permission.common.enums.RoleScopeEnum;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.common.result.PageResult;
import com.permission.dal.dataobject.PermissionDO;
import com.permission.dal.dataobject.RoleDO;
import com.permission.dal.dataobject.RolePermissionDO;
import com.permission.dal.dataobject.UserRoleDO;
import com.permission.service.PermissionService;
import com.permission.service.RolePermissionService;
import com.permission.service.RoleService;
import com.permission.service.UserRoleService;
import com.permission.service.cache.AuthzCacheService;
import com.permission.biz.converter.RoleWebConverter;
import com.permission.biz.dto.role.AssignRolePermissionsDTO;
import com.permission.biz.dto.role.CreateRoleDTO;
import com.permission.biz.dto.role.UpdateRoleDTO;
import com.permission.biz.vo.role.RoleVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色 Manager 实现
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RoleManagerImpl implements RoleManager {

    private final RoleService roleService;
    private final RolePermissionService rolePermissionService;
    private final PermissionService permissionService;
    private final UserRoleService userRoleService;
    private final AuthzCacheService authzCacheService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @AuditLog(module = "ROLE", action = "CREATE", targetType = "role")
    public RoleVO createRole(CreateRoleDTO dto) {
        // 1. 枚举校验
        RoleScopeEnum.fromCode(dto.getRoleScope());
        RoleDomainEnum.fromCode(dto.getRoleDomain());

        // 2. code 唯一性校验
        RoleDO existing = roleService.getByCode(dto.getCode());
        if (existing != null) {
            throw new BusinessException(ErrorCode.ROLE_CODE_EXISTS, dto.getCode());
        }

        // 3. 创建（catch 并发重复）
        RoleDO roleDO = RoleWebConverter.INSTANCE.toDO(dto);
        roleDO.setStatus(CommonStatusEnum.ENABLED.getCode());
        
        // 4. 如果前端未传入 projectId，且当前用户不是管理员，自动设置为用户所属项目
        if (!StringUtils.hasText(dto.getProjectId())) {
            UserInfoDTO currentUser = UserContextHolder.getUser();
            if (currentUser != null && !currentUser.isAdmin()) {
                // 查找用户关联的项目（取第一个非空项目）
                List<UserRoleDO> userRoles = userRoleService.listByUserId(currentUser.getUserId());
                String userProjectId = userRoles.stream()
                        .filter(ur -> StringUtils.hasText(ur.getProjectId()))
                        .map(UserRoleDO::getProjectId)
                        .findFirst()
                        .orElse(null);
                if (userProjectId != null) {
                    roleDO.setProjectId(userProjectId);
                    log.info("项目管理员创建角色，自动设置 projectId={}", userProjectId);
                }
            }
        }
        
        try {
            roleService.save(roleDO);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ErrorCode.ROLE_CODE_EXISTS, dto.getCode());
        }

        return RoleWebConverter.INSTANCE.toVO(roleDO);
    }

    @Override
    @AuditLog(module = "ROLE", action = "UPDATE", targetType = "role")
    public RoleVO updateRole(Long id, UpdateRoleDTO dto) {
        RoleDO roleDO = roleService.getById(id);
        if (roleDO == null) {
            throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
        }

        if (StringUtils.hasText(dto.getRoleScope())) {
            RoleScopeEnum.fromCode(dto.getRoleScope());
        }
        if (StringUtils.hasText(dto.getRoleDomain())) {
            RoleDomainEnum.fromCode(dto.getRoleDomain());
        }
        if (StringUtils.hasText(dto.getStatus())) {
            CommonStatusEnum.fromCode(dto.getStatus());
        }

        if (dto.getName() != null) roleDO.setName(dto.getName());
        if (dto.getRoleScope() != null) roleDO.setRoleScope(dto.getRoleScope());
        if (dto.getRoleDomain() != null) roleDO.setRoleDomain(dto.getRoleDomain());
        if (dto.getStatus() != null) roleDO.setStatus(dto.getStatus());
        if (dto.getDescription() != null) roleDO.setDescription(dto.getDescription());

        roleService.updateById(roleDO);
        return RoleWebConverter.INSTANCE.toVO(roleDO);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "ROLE", action = "DELETE", targetType = "role")
    public void deleteRole(Long id) {
        RoleDO roleDO = roleService.getById(id);
        if (roleDO == null) {
            throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
        }

        // 检查用户引用
        long userRefCount = userRoleService.countByRoleId(id);
        if (userRefCount > 0) {
            throw new BusinessException(ErrorCode.ROLE_USED_BY_USER);
        }

        // 删除角色-权限关系
        rolePermissionService.removeByRoleId(id);
        // 删除角色
        roleService.removeById(id);
    }

    @Override
    public PageResult<RoleVO> listRoles(String code, String name, String roleScope, String status,
                                         Integer pageNum, Integer pageSize) {
        pageNum = (pageNum == null || pageNum < 1) ? PermissionConstant.DEFAULT_PAGE_NUM : pageNum;
        pageSize = (pageSize == null || pageSize < 1) ? PermissionConstant.DEFAULT_PAGE_SIZE : pageSize;
        pageSize = Math.min(pageSize, PermissionConstant.MAX_PAGE_SIZE);

        Page<RoleDO> page = new Page<>(pageNum, pageSize);
        IPage<RoleDO> result = roleService.page(page, code, name, roleScope, status);

        List<RoleVO> voList = RoleWebConverter.INSTANCE.toVOList(result.getRecords());
        return PageResult.of(result.getTotal(), pageNum, pageSize, voList);
    }

    @Override
    public PageResult<RoleVO> listRolesWithProjectFilter(String code, String name, String roleScope, String status,
                                                          String projectId, Integer pageNum, Integer pageSize) {
        pageNum = (pageNum == null || pageNum < 1) ? PermissionConstant.DEFAULT_PAGE_NUM : pageNum;
        pageSize = (pageSize == null || pageSize < 1) ? PermissionConstant.DEFAULT_PAGE_SIZE : pageSize;
        pageSize = Math.min(pageSize, PermissionConstant.MAX_PAGE_SIZE);

        Page<RoleDO> page = new Page<>(pageNum, pageSize);
        IPage<RoleDO> result = roleService.pageWithProjectFilter(page, code, name, roleScope, status, projectId);

        List<RoleVO> voList = RoleWebConverter.INSTANCE.toVOList(result.getRecords());
        return PageResult.of(result.getTotal(), pageNum, pageSize, voList);
    }

    @Override
    public RoleVO getRoleDetail(Long id) {
        RoleDO roleDO = roleService.getById(id);
        if (roleDO == null) {
            throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
        }

        RoleVO vo = RoleWebConverter.INSTANCE.toVO(roleDO);
        // 查询角色拥有的权限编码列表
        List<RolePermissionDO> rolePermissions = rolePermissionService.listByRoleId(id);
        vo.setPermissionCodes(rolePermissions.stream()
                .map(RolePermissionDO::getPermissionCode)
                .collect(Collectors.toList()));
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "ROLE", action = "ASSIGN", targetType = "role")
    public void assignPermissions(Long roleId, AssignRolePermissionsDTO dto) {
        RoleDO roleDO = roleService.getById(roleId);
        if (roleDO == null) {
            throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
        }

        // 批量校验权限编码有效性（避免 N+1 查询）
        List<PermissionDO> permissions = permissionService.listByCodes(dto.getPermissionCodes());
        if (permissions.size() != dto.getPermissionCodes().size()) {
            // 找出不存在的编码
            List<String> foundCodes = permissions.stream()
                    .map(PermissionDO::getCode)
                    .collect(Collectors.toList());
            List<String> invalidCodes = dto.getPermissionCodes().stream()
                    .filter(code -> !foundCodes.contains(code))
                    .collect(Collectors.toList());
            throw new BusinessException(ErrorCode.PERMISSION_NOT_FOUND, "权限编码不存在: " + invalidCodes);
        }

        // 全量覆盖
        rolePermissionService.replacePermissions(roleId, dto.getPermissionCodes());

        // 异步清除拥有该角色的所有用户的缓存（通过事件机制，避免同步遍历阻塞）
        eventPublisher.publishEvent(PermissionChangedEvent.rolePermissionChanged(roleId, "SYSTEM"));
        log.info("角色权限分配完成，已发布异步缓存清除事件，roleId={}", roleId);
    }

    @Override
    public List<RoleVO> listAllRoles() {
        List<RoleDO> allRoles = roleService.listByStatus(CommonStatusEnum.ENABLED.getCode());
        return RoleWebConverter.INSTANCE.toVOList(allRoles);
    }

    @Override
    public List<RoleVO> listAllRolesForGrantContext(String projectCode) {
        if (!StringUtils.hasText(projectCode)) {
            return List.of();
        }
        final String pc = projectCode.trim();
        List<RoleDO> all = roleService.listByStatus(CommonStatusEnum.ENABLED.getCode());
        return all.stream()
                .filter(r -> visibleInUserGrantContext(r, pc))
                .sorted(Comparator.comparing(RoleDO::getCode, Comparator.nullsLast(String::compareTo)))
                .map(RoleWebConverter.INSTANCE::toVO)
                .collect(Collectors.toList());
    }

    /**
     * 用户授权页按项目选角色：禁止「project_id 为空的项目角色」混入 UC（旧查询用 OR null 会把权限中心管理员等带进来）。
     */
    private boolean visibleInUserGrantContext(RoleDO r, String projectCode) {
        if (RoleScopeEnum.GLOBAL.getCode().equals(r.getRoleScope())) {
            // 历史数据可能把 PERM_CENTER_ADMIN 标成 GLOBAL：仍应在「用户中心」上下文中隐藏
            if ("PERM_CENTER_ADMIN".equals(r.getCode())) {
                return "PC".equals(projectCode);
            }
            String gd = StringUtils.hasText(r.getRoleDomain()) ? r.getRoleDomain() : RoleDomainEnum.APP.getCode();
            if (RoleDomainEnum.PERM_CENTER.getCode().equals(gd)) {
                return "PC".equals(projectCode);
            }
            return true;
        }
        if (!RoleScopeEnum.PROJECT.getCode().equals(r.getRoleScope())) {
            return false;
        }
        String bound = r.getProjectId() != null ? r.getProjectId().trim() : "";
        if (!StringUtils.hasText(bound)) {
            return false;
        }
        if (!projectCode.equals(bound)) {
            return false;
        }
        String domain = StringUtils.hasText(r.getRoleDomain()) ? r.getRoleDomain() : RoleDomainEnum.APP.getCode();
        if (RoleDomainEnum.PERM_CENTER.getCode().equals(domain) || "PERM_CENTER_ADMIN".equals(r.getCode())) {
            return "PC".equals(projectCode);
        }
        return true;
    }
}

