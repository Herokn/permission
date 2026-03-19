package com.permission.biz.manager.impl;

import com.permission.biz.dto.organization.AssignOrgMembersDTO;
import com.permission.biz.dto.organization.AssignOrgRolesDTO;
import com.permission.biz.dto.organization.CreateOrganizationDTO;
import com.permission.biz.dto.organization.UpdateOrganizationDTO;
import com.permission.biz.manager.OrganizationManager;
import com.permission.biz.vo.organization.*;
import com.permission.common.annotation.AuditLog;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.dal.dataobject.OrganizationDO;
import com.permission.dal.dataobject.OrgRoleDO;
import com.permission.dal.dataobject.RoleDO;
import com.permission.dal.dataobject.UserOrgDO;
import com.permission.service.OrgRoleService;
import com.permission.service.OrganizationService;
import com.permission.service.RoleService;
import com.permission.service.UserOrgService;
import com.permission.service.cache.AuthzCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 组织 Manager 实现
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrganizationManagerImpl implements OrganizationManager {

    private final OrganizationService organizationService;
    private final OrgRoleService orgRoleService;
    private final UserOrgService userOrgService;
    private final RoleService roleService;
    private final AuthzCacheService authzCacheService;

    @Override
    @AuditLog(module = "ORGANIZATION", action = "CREATE", targetType = "organization", description = "创建组织")
    public OrganizationVO createOrganization(CreateOrganizationDTO dto) {
        // 1. 编码唯一性校验
        OrganizationDO existing = organizationService.getByCode(dto.getCode());
        if (existing != null) {
            throw new BusinessException(ErrorCode.ORG_CODE_EXISTS, dto.getCode());
        }

        // 2. 父组织校验
        if (dto.getParentId() != null) {
            OrganizationDO parent = organizationService.getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ErrorCode.ORG_PARENT_NOT_FOUND);
            }
        }

        // 3. 创建（catch 并发重复）
        OrganizationDO orgDO = new OrganizationDO();
        orgDO.setCode(dto.getCode());
        orgDO.setName(dto.getName());
        orgDO.setParentId(dto.getParentId());
        orgDO.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        orgDO.setStatus(CommonStatusEnum.ENABLED.getCode());
        orgDO.setDescription(dto.getDescription());
        try {
            organizationService.save(orgDO);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ErrorCode.ORG_CODE_EXISTS, dto.getCode());
        }

        return toVO(orgDO);
    }

    @Override
    @AuditLog(module = "ORGANIZATION", action = "UPDATE", targetType = "organization", description = "编辑组织")
    public OrganizationVO updateOrganization(Long id, UpdateOrganizationDTO dto) {
        OrganizationDO orgDO = organizationService.getById(id);
        if (orgDO == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        // 父组织校验
        if (dto.getParentId() != null) {
            if (dto.getParentId().equals(id)) {
                throw new BusinessException(ErrorCode.ORG_CIRCULAR_REF);
            }
            OrganizationDO parent = organizationService.getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ErrorCode.ORG_PARENT_NOT_FOUND);
            }
            // 检查循环引用：目标父节点不能是自己的子孙
            if (isDescendant(id, dto.getParentId())) {
                throw new BusinessException(ErrorCode.ORG_CIRCULAR_REF);
            }
        }

        if (StringUtils.hasText(dto.getName())) {
            orgDO.setName(dto.getName());
        }
        if (dto.getParentId() != null) {
            orgDO.setParentId(dto.getParentId());
        }
        if (dto.getSortOrder() != null) {
            orgDO.setSortOrder(dto.getSortOrder());
        }
        if (StringUtils.hasText(dto.getStatus())) {
            CommonStatusEnum.fromCode(dto.getStatus());
            orgDO.setStatus(dto.getStatus());
        }
        if (dto.getDescription() != null) {
            orgDO.setDescription(dto.getDescription());
        }
        organizationService.updateById(orgDO);

        return toVO(organizationService.getById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "ORGANIZATION", action = "DELETE", targetType = "organization", description = "删除组织")
    public void deleteOrganization(Long id) {
        OrganizationDO orgDO = organizationService.getById(id);
        if (orgDO == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        // 检查子组织
        if (organizationService.countByParentId(id) > 0) {
            throw new BusinessException(ErrorCode.ORG_HAS_CHILDREN);
        }

        // 检查关联角色
        if (orgRoleService.countByOrgId(id) > 0) {
            throw new BusinessException(ErrorCode.ORG_HAS_ROLES);
        }

        // 检查关联成员
        if (userOrgService.countByOrgId(id) > 0) {
            throw new BusinessException(ErrorCode.ORG_HAS_MEMBERS);
        }

        organizationService.removeById(id);
    }

    @Override
    public OrganizationVO getOrganizationDetail(Long id) {
        OrganizationDO orgDO = organizationService.getById(id);
        if (orgDO == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }
        return toVO(orgDO);
    }

    @Override
    public List<OrganizationTreeVO> getOrganizationTree() {
        List<OrganizationDO> allOrgs = organizationService.listAll();
        return buildTree(allOrgs);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "ORGANIZATION", action = "ASSIGN", targetType = "org_role", description = "为组织分配角色")
    public void assignRoles(Long orgId, AssignOrgRolesDTO dto) {
        OrganizationDO org = organizationService.getById(orgId);
        if (org == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        for (Long roleId : dto.getRoleIds()) {
            RoleDO role = roleService.getById(roleId);
            if (role == null) {
                throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
            }
            if (!CommonStatusEnum.ENABLED.getCode().equals(role.getStatus())) {
                throw new BusinessException(ErrorCode.ROLE_DISABLED, role.getCode());
            }

            // 幂等：已存在则跳过
            if (!orgRoleService.exists(orgId, roleId)) {
                OrgRoleDO orgRoleDO = new OrgRoleDO();
                orgRoleDO.setOrgId(orgId);
                orgRoleDO.setRoleId(roleId);
                orgRoleService.save(orgRoleDO);
            }
        }

        // 清除组织下所有用户的鉴权缓存
        evictCacheForOrgMembers(orgId);
    }

    @Override
    @AuditLog(module = "ORGANIZATION", action = "REVOKE", targetType = "org_role", description = "移除组织角色")
    public void removeRole(Long orgId, Long roleId) {
        orgRoleService.remove(orgId, roleId);
        evictCacheForOrgMembers(orgId);
    }

    @Override
    public List<OrgRoleVO> listOrgRoles(Long orgId) {
        OrganizationDO org = organizationService.getById(orgId);
        if (org == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        List<OrgRoleDO> orgRoles = orgRoleService.listByOrgId(orgId);
        return orgRoles.stream().map(or -> {
            OrgRoleVO vo = new OrgRoleVO();
            vo.setRoleId(or.getRoleId());
            RoleDO role = roleService.getById(or.getRoleId());
            if (role != null) {
                vo.setRoleCode(role.getCode());
                vo.setRoleName(role.getName());
                vo.setRoleScope(role.getRoleScope());
                vo.setStatus(role.getStatus());
            }
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @AuditLog(module = "ORGANIZATION", action = "ASSIGN", targetType = "user_org", description = "将用户加入组织")
    public void addMembers(Long orgId, AssignOrgMembersDTO dto) {
        OrganizationDO org = organizationService.getById(orgId);
        if (org == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        for (String userId : dto.getUserIds()) {
            // 幂等：已存在则跳过
            if (!userOrgService.exists(userId, orgId)) {
                UserOrgDO userOrgDO = new UserOrgDO();
                userOrgDO.setUserId(userId);
                userOrgDO.setOrgId(orgId);
                userOrgService.save(userOrgDO);
            }
            // 清除该用户的鉴权缓存
            authzCacheService.evictUser(userId);
        }
    }

    @Override
    @AuditLog(module = "ORGANIZATION", action = "REVOKE", targetType = "user_org", description = "将用户移出组织")
    public void removeMember(Long orgId, String userId) {
        userOrgService.remove(userId, orgId);
        authzCacheService.evictUser(userId);
    }

    @Override
    public List<OrgMemberVO> listOrgMembers(Long orgId) {
        OrganizationDO org = organizationService.getById(orgId);
        if (org == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        List<UserOrgDO> members = userOrgService.listByOrgId(orgId);
        return members.stream().map(m -> {
            OrgMemberVO vo = new OrgMemberVO();
            vo.setUserId(m.getUserId());
            vo.setOrgId(m.getOrgId());
            vo.setOrgName(org.getName());
            return vo;
        }).collect(Collectors.toList());
    }

    // ==================== 私有方法 ====================

    /**
     * 检查 targetId 是否是 orgId 的子孙
     */
    private boolean isDescendant(Long orgId, Long targetId) {
        List<OrganizationDO> children = organizationService.listByParentId(orgId);
        for (OrganizationDO child : children) {
            if (child.getId().equals(targetId)) {
                return true;
            }
            if (isDescendant(child.getId(), targetId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 构建组织树
     */
    private List<OrganizationTreeVO> buildTree(List<OrganizationDO> allOrgs) {
        Map<Long, List<OrganizationDO>> parentMap = allOrgs.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getParentId() == null ? 0L : o.getParentId()));
        return buildChildren(0L, parentMap);
    }

    private List<OrganizationTreeVO> buildChildren(Long parentId, Map<Long, List<OrganizationDO>> parentMap) {
        List<OrganizationDO> children = parentMap.getOrDefault(parentId, Collections.emptyList());
        return children.stream()
                .sorted(Comparator.comparingInt(o -> o.getSortOrder() == null ? 0 : o.getSortOrder()))
                .map(o -> {
                    OrganizationTreeVO vo = new OrganizationTreeVO();
                    vo.setId(o.getId());
                    vo.setCode(o.getCode());
                    vo.setName(o.getName());
                    vo.setStatus(o.getStatus());
                    vo.setSortOrder(o.getSortOrder());
                    vo.setChildren(buildChildren(o.getId(), parentMap));
                    return vo;
                })
                .collect(Collectors.toList());
    }

    private OrganizationVO toVO(OrganizationDO orgDO) {
        OrganizationVO vo = new OrganizationVO();
        vo.setId(orgDO.getId());
        vo.setCode(orgDO.getCode());
        vo.setName(orgDO.getName());
        vo.setParentId(orgDO.getParentId());
        vo.setSortOrder(orgDO.getSortOrder());
        vo.setStatus(orgDO.getStatus());
        vo.setDescription(orgDO.getDescription());
        vo.setGmtCreate(orgDO.getGmtCreate());
        vo.setGmtModified(orgDO.getGmtModified());
        return vo;
    }

    /**
     * 清除组织下所有成员的鉴权缓存
     */
    private void evictCacheForOrgMembers(Long orgId) {
        List<UserOrgDO> members = userOrgService.listByOrgId(orgId);
        for (UserOrgDO member : members) {
            authzCacheService.evictUser(member.getUserId());
        }
    }
}

