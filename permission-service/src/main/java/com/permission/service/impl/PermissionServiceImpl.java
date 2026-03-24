package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.dal.dataobject.PermissionDO;
import com.permission.dal.mapper.PermissionMapper;
import com.permission.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 权限点 Service 实现
 */
@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionMapper permissionMapper;

    @Override
    public PermissionDO getById(Long id) {
        return permissionMapper.selectById(id);
    }

    @Override
    public PermissionDO getByCode(String code) {
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PermissionDO::getCode, code);
        return permissionMapper.selectOne(wrapper);
    }

    @Override
    public void save(PermissionDO permissionDO) {
        permissionMapper.insert(permissionDO);
    }

    @Override
    public void updateById(PermissionDO permissionDO) {
        permissionMapper.updateById(permissionDO);
    }

    @Override
    public void removeById(Long id) {
        permissionMapper.deleteById(id);
    }

    @Override
    public long countByParentCode(String parentCode) {
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PermissionDO::getParentCode, parentCode);
        return permissionMapper.selectCount(wrapper);
    }

    @Override
    public List<PermissionDO> listByStatus(String status) {
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PermissionDO::getStatus, status);
        wrapper.orderByAsc(PermissionDO::getSortOrder);
        return permissionMapper.selectList(wrapper);
    }

    @Override
    public IPage<PermissionDO> page(Page<PermissionDO> page, String code, String name, String type, String status) {
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(code), PermissionDO::getCode, code);
        wrapper.like(StringUtils.hasText(name), PermissionDO::getName, name);
        wrapper.eq(StringUtils.hasText(type), PermissionDO::getType, type);
        wrapper.eq(StringUtils.hasText(status), PermissionDO::getStatus, status);
        wrapper.orderByAsc(PermissionDO::getSortOrder);
        return permissionMapper.selectPage(page, wrapper);
    }

    @Override
    public IPage<PermissionDO> pageWithProjectFilter(Page<PermissionDO> page, String code,
            String name, String type, String status, String projectId) {
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(code), PermissionDO::getCode, code);
        wrapper.like(StringUtils.hasText(name), PermissionDO::getName, name);
        wrapper.eq(StringUtils.hasText(type), PermissionDO::getType, type);
        wrapper.eq(StringUtils.hasText(status), PermissionDO::getStatus, status);
        // 严格项目隔离：只返回该项目的权限点
        if (StringUtils.hasText(projectId)) {
            wrapper.eq(PermissionDO::getProjectId, projectId);
        }
        wrapper.orderByAsc(PermissionDO::getSortOrder);
        return permissionMapper.selectPage(page, wrapper);
    }

    @Override
    public List<PermissionDO> listAll() {
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(PermissionDO::getSortOrder);
        return permissionMapper.selectList(wrapper);
    }

    @Override
    public List<PermissionDO> listAllWithProjectFilter(String projectId) {
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        // 严格项目隔离：只返回该项目的权限点
        if (StringUtils.hasText(projectId)) {
            wrapper.eq(PermissionDO::getProjectId, projectId);
        } else {
            // 没有传项目ID时，返回所有（用于系统管理员等场景）
            return listAll();
        }
        wrapper.orderByAsc(PermissionDO::getSortOrder);
        return permissionMapper.selectList(wrapper);
    }

    @Override
    public List<PermissionDO> listByCodes(List<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return List.of();
        }
        LambdaQueryWrapper<PermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(PermissionDO::getCode, codes);
        return permissionMapper.selectList(wrapper);
    }
}

