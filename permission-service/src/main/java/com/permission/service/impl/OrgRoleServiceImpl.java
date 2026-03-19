package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.dal.dataobject.OrgRoleDO;
import com.permission.dal.mapper.OrgRoleMapper;
import com.permission.service.OrgRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * 组织-角色 Service 实现
 */
@Service
@RequiredArgsConstructor
public class OrgRoleServiceImpl implements OrgRoleService {

    private final OrgRoleMapper orgRoleMapper;

    @Override
    public List<OrgRoleDO> listByOrgId(Long orgId) {
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrgRoleDO::getOrgId, orgId);
        return orgRoleMapper.selectList(wrapper);
    }

    @Override
    public List<OrgRoleDO> listByOrgIds(List<Long> orgIds) {
        if (orgIds == null || orgIds.isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(OrgRoleDO::getOrgId, orgIds);
        return orgRoleMapper.selectList(wrapper);
    }

    @Override
    public List<OrgRoleDO> listByOrgIdsAndProjectId(List<Long> orgIds, Long projectId) {
        if (orgIds == null || orgIds.isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(OrgRoleDO::getOrgId, orgIds);
        if (projectId == null) {
            // 查询全局组织角色（project_id 为 null）
            wrapper.isNull(OrgRoleDO::getProjectId);
        } else {
            // 查询特定项目的组织角色 + 全局组织角色
            wrapper.and(w -> w.eq(OrgRoleDO::getProjectId, projectId)
                    .or()
                    .isNull(OrgRoleDO::getProjectId));
        }
        return orgRoleMapper.selectList(wrapper);
    }

    @Override
    public long countByOrgId(Long orgId) {
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrgRoleDO::getOrgId, orgId);
        return orgRoleMapper.selectCount(wrapper);
    }

    @Override
    public long countByRoleId(Long roleId) {
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrgRoleDO::getRoleId, roleId);
        return orgRoleMapper.selectCount(wrapper);
    }

    @Override
    public boolean exists(Long orgId, Long roleId) {
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrgRoleDO::getOrgId, orgId)
               .eq(OrgRoleDO::getRoleId, roleId);
        return orgRoleMapper.selectCount(wrapper) > 0;
    }

    @Override
    public void save(OrgRoleDO orgRoleDO) {
        orgRoleMapper.insert(orgRoleDO);
    }

    @Override
    public void remove(Long orgId, Long roleId) {
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrgRoleDO::getOrgId, orgId)
               .eq(OrgRoleDO::getRoleId, roleId);
        orgRoleMapper.delete(wrapper);
    }

    @Override
    public void removeByOrgId(Long orgId) {
        LambdaQueryWrapper<OrgRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrgRoleDO::getOrgId, orgId);
        orgRoleMapper.delete(wrapper);
    }
}

