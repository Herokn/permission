package com.permission.biz.manager.impl;

import com.permission.biz.dto.organization.AssignOrgMembersDTO;
import com.permission.biz.dto.organization.AssignOrgRolesDTO;
import com.permission.biz.dto.organization.CreateOrganizationDTO;
import com.permission.biz.dto.organization.UpdateOrganizationDTO;
import com.permission.biz.manager.OrganizationManager;
import com.permission.biz.vo.organization.*;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    public OrganizationVO createOrganization(CreateOrganizationDTO dto) {
        OrganizationDO existing = organizationService.getByCode(dto.getOrgCode());
        if (existing != null) {
            throw new BusinessException(ErrorCode.ORG_CODE_EXISTS, dto.getOrgCode());
        }

        if (dto.getParentId() != null) {
            OrganizationDO parent = organizationService.getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ErrorCode.ORG_PARENT_NOT_FOUND);
            }
        }

        OrganizationDO orgDO = new OrganizationDO();
        orgDO.setOrgCode(dto.getOrgCode());
        orgDO.setOrgName(dto.getOrgName());
        orgDO.setOrgType(dto.getOrgType());
        orgDO.setParentId(dto.getParentId());
        orgDO.setStatus(1);
        try {
            organizationService.save(orgDO);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ErrorCode.ORG_CODE_EXISTS, dto.getOrgCode());
        }

        return toVO(orgDO);
    }

    @Override
    public OrganizationVO updateOrganization(Long id, UpdateOrganizationDTO dto) {
        OrganizationDO orgDO = organizationService.getById(id);
        if (orgDO == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        if (dto.getParentId() != null) {
            if (dto.getParentId().equals(id)) {
                throw new BusinessException(ErrorCode.ORG_CIRCULAR_REF);
            }
            OrganizationDO parent = organizationService.getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ErrorCode.ORG_PARENT_NOT_FOUND);
            }
            if (isDescendant(id, dto.getParentId())) {
                throw new BusinessException(ErrorCode.ORG_CIRCULAR_REF);
            }
        }

        if (StringUtils.hasText(dto.getOrgName())) {
            orgDO.setOrgName(dto.getOrgName());
        }
        if (StringUtils.hasText(dto.getOrgType())) {
            orgDO.setOrgType(dto.getOrgType());
        }
        if (dto.getParentId() != null) {
            orgDO.setParentId(dto.getParentId());
        }
        if (dto.getStatus() != null) {
            orgDO.setStatus(dto.getStatus());
        }
        organizationService.updateById(orgDO);

        return toVO(organizationService.getById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteOrganization(Long id) {
        OrganizationDO orgDO = organizationService.getById(id);
        if (orgDO == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        if (organizationService.countByParentId(id) > 0) {
            throw new BusinessException(ErrorCode.ORG_HAS_CHILDREN);
        }

        if (orgRoleService.countByOrgId(id) > 0) {
            throw new BusinessException(ErrorCode.ORG_HAS_ROLES);
        }

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
            if (!"ENABLED".equals(role.getStatus())) {
                throw new BusinessException(ErrorCode.ROLE_DISABLED, role.getCode());
            }

            if (!orgRoleService.exists(orgId, roleId)) {
                OrgRoleDO orgRoleDO = new OrgRoleDO();
                orgRoleDO.setOrgId(orgId);
                orgRoleDO.setRoleId(roleId);
                orgRoleService.save(orgRoleDO);
            }
        }

        evictCacheForOrgMembers(orgId);
    }

    @Override
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
    public void addMembers(Long orgId, AssignOrgMembersDTO dto) {
        OrganizationDO org = organizationService.getById(orgId);
        if (org == null) {
            throw new BusinessException(ErrorCode.ORG_NOT_FOUND);
        }

        for (String userId : dto.getUserIds()) {
            if (!userOrgService.exists(userId, orgId)) {
                UserOrgDO userOrgDO = new UserOrgDO();
                userOrgDO.setUserId(userId);
                userOrgDO.setOrgId(orgId);
                userOrgService.save(userOrgDO);
            }
            authzCacheService.evictUser(userId);
        }
    }

    @Override
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
            vo.setOrgName(org.getOrgName());
            return vo;
        }).collect(Collectors.toList());
    }

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

    private List<OrganizationTreeVO> buildTree(List<OrganizationDO> allOrgs) {
        Map<Long, List<OrganizationDO>> parentMap = allOrgs.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getParentId() == null ? 0L : o.getParentId()));
        return buildChildren(0L, parentMap);
    }

    private List<OrganizationTreeVO> buildChildren(Long parentId, Map<Long, List<OrganizationDO>> parentMap) {
        List<OrganizationDO> children = parentMap.getOrDefault(parentId, Collections.emptyList());
        return children.stream()
                .map(o -> {
                    OrganizationTreeVO vo = new OrganizationTreeVO();
                    vo.setId(o.getId());
                    vo.setOrgCode(o.getOrgCode());
                    vo.setOrgName(o.getOrgName());
                    vo.setOrgType(o.getOrgType());
                    vo.setStatus(o.getStatus());
                    vo.setChildren(buildChildren(o.getId(), parentMap));
                    return vo;
                })
                .collect(Collectors.toList());
    }

    private OrganizationVO toVO(OrganizationDO orgDO) {
        OrganizationVO vo = new OrganizationVO();
        vo.setId(orgDO.getId());
        vo.setOrgCode(orgDO.getOrgCode());
        vo.setOrgName(orgDO.getOrgName());
        vo.setOrgType(orgDO.getOrgType());
        vo.setParentId(orgDO.getParentId());
        vo.setLevel(orgDO.getLevel());
        vo.setPath(orgDO.getPath());
        vo.setStatus(orgDO.getStatus());
        vo.setGmtCreate(orgDO.getGmtCreate());
        vo.setGmtModified(orgDO.getGmtModified());
        return vo;
    }

    private void evictCacheForOrgMembers(Long orgId) {
        List<UserOrgDO> members = userOrgService.listByOrgId(orgId);
        for (UserOrgDO member : members) {
            authzCacheService.evictUser(member.getUserId());
        }
    }
}
