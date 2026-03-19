package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.dal.dataobject.RoleDO;
import com.permission.dal.mapper.RoleMapper;
import com.permission.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 角色 Service 实现
 */
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleMapper roleMapper;

    @Override
    public RoleDO getById(Long id) {
        return roleMapper.selectById(id);
    }

    @Override
    public RoleDO getByCode(String code) {
        LambdaQueryWrapper<RoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RoleDO::getCode, code);
        return roleMapper.selectOne(wrapper);
    }

    @Override
    public boolean existsByCode(String code) {
        LambdaQueryWrapper<RoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RoleDO::getCode, code);
        return roleMapper.selectCount(wrapper) > 0;
    }

    @Override
    public void save(RoleDO roleDO) {
        roleMapper.insert(roleDO);
    }

    @Override
    public void updateById(RoleDO roleDO) {
        roleMapper.updateById(roleDO);
    }

    @Override
    public void removeById(Long id) {
        roleMapper.deleteById(id);
    }

    @Override
    public IPage<RoleDO> page(Page<RoleDO> page, String code, String name, String roleScope, String status) {
        LambdaQueryWrapper<RoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(code), RoleDO::getCode, code);
        wrapper.like(StringUtils.hasText(name), RoleDO::getName, name);
        wrapper.eq(StringUtils.hasText(roleScope), RoleDO::getRoleScope, roleScope);
        wrapper.eq(StringUtils.hasText(status), RoleDO::getStatus, status);
        wrapper.orderByDesc(RoleDO::getGmtCreate);
        return roleMapper.selectPage(page, wrapper);
    }

    @Override
    public IPage<RoleDO> pageWithProjectFilter(Page<RoleDO> page, String code, String name, String roleScope, String status, String projectId) {
        LambdaQueryWrapper<RoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(code), RoleDO::getCode, code);
        wrapper.like(StringUtils.hasText(name), RoleDO::getName, name);
        wrapper.eq(StringUtils.hasText(roleScope), RoleDO::getRoleScope, roleScope);
        wrapper.eq(StringUtils.hasText(status), RoleDO::getStatus, status);
        // 项目隔离：查询该项目的角色 + 全局角色（projectId=null）
        if (StringUtils.hasText(projectId)) {
            wrapper.and(w -> w.eq(RoleDO::getProjectId, projectId).or().isNull(RoleDO::getProjectId));
        }
        wrapper.orderByDesc(RoleDO::getGmtCreate);
        return roleMapper.selectPage(page, wrapper);
    }

    @Override
    public List<RoleDO> listAll() {
        return roleMapper.selectList(new LambdaQueryWrapper<>());
    }

    @Override
    public List<RoleDO> listByStatus(String status) {
        LambdaQueryWrapper<RoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(status), RoleDO::getStatus, status);
        wrapper.orderByAsc(RoleDO::getCode);
        return roleMapper.selectList(wrapper);
    }

    @Override
    public List<RoleDO> listByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return roleMapper.selectBatchIds(ids);
    }
}

