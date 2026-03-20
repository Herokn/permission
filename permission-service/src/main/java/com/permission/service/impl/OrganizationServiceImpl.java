package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.dal.dataobject.OrganizationDO;
import com.permission.dal.mapper.OrganizationMapper;
import com.permission.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 组织 Service 实现
 */
@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationMapper organizationMapper;

    @Override
    public OrganizationDO getById(Long id) {
        return organizationMapper.selectById(id);
    }

    @Override
    public OrganizationDO getByCode(String code) {
        LambdaQueryWrapper<OrganizationDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrganizationDO::getOrgCode, code);
        return organizationMapper.selectOne(wrapper);
    }

    @Override
    public void save(OrganizationDO organizationDO) {
        organizationMapper.insert(organizationDO);
    }

    @Override
    public void updateById(OrganizationDO organizationDO) {
        organizationMapper.updateById(organizationDO);
    }

    @Override
    public void removeById(Long id) {
        organizationMapper.deleteById(id);
    }

    @Override
    public long countByParentId(Long parentId) {
        LambdaQueryWrapper<OrganizationDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrganizationDO::getParentId, parentId);
        return organizationMapper.selectCount(wrapper);
    }

    @Override
    public List<OrganizationDO> listAll() {
        return organizationMapper.selectList(new LambdaQueryWrapper<>());
    }

    @Override
    public List<OrganizationDO> listByParentId(Long parentId) {
        LambdaQueryWrapper<OrganizationDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrganizationDO::getParentId, parentId);
        return organizationMapper.selectList(wrapper);
    }
}

