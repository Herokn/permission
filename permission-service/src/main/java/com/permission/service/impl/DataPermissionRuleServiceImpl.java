package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.dal.dataobject.DataPermissionRuleDO;
import com.permission.dal.mapper.DataPermissionRuleMapper;
import com.permission.service.DataPermissionRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 数据权限规则 Service 实现
 */
@Service
@RequiredArgsConstructor
public class DataPermissionRuleServiceImpl implements DataPermissionRuleService {

    private final DataPermissionRuleMapper dataPermissionRuleMapper;

    @Override
    public List<DataPermissionRuleDO> listByRoleId(Long roleId) {
        LambdaQueryWrapper<DataPermissionRuleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataPermissionRuleDO::getRoleId, roleId);
        return dataPermissionRuleMapper.selectList(wrapper);
    }

    @Override
    public List<DataPermissionRuleDO> listByRoleIds(List<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return List.of();
        }
        LambdaQueryWrapper<DataPermissionRuleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(DataPermissionRuleDO::getRoleId, roleIds);
        return dataPermissionRuleMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setRules(Long roleId, List<DataPermissionRuleDO> rules) {
        // 先删除旧规则
        removeByRoleId(roleId);

        // 插入新规则
        for (DataPermissionRuleDO rule : rules) {
            rule.setRoleId(roleId);
            dataPermissionRuleMapper.insert(rule);
        }
    }

    @Override
    public void removeByRoleId(Long roleId) {
        LambdaQueryWrapper<DataPermissionRuleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataPermissionRuleDO::getRoleId, roleId);
        dataPermissionRuleMapper.delete(wrapper);
    }

    @Override
    public DataPermissionRuleDO getByRoleIdAndResourceType(Long roleId, String resourceType) {
        LambdaQueryWrapper<DataPermissionRuleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataPermissionRuleDO::getRoleId, roleId);
        wrapper.eq(DataPermissionRuleDO::getResourceType, resourceType);
        return dataPermissionRuleMapper.selectOne(wrapper);
    }
}
