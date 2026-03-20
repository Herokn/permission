package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.dal.dataobject.RolePermissionDO;
import com.permission.dal.mapper.RolePermissionMapper;
import com.permission.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 角色-权限 Service 实现
 */
@Service
@RequiredArgsConstructor
public class RolePermissionServiceImpl implements RolePermissionService {

    private final RolePermissionMapper rolePermissionMapper;

    @Override
    public List<RolePermissionDO> listByRoleId(Long roleId) {
        LambdaQueryWrapper<RolePermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RolePermissionDO::getRoleId, roleId);
        return rolePermissionMapper.selectList(wrapper);
    }

    @Override
    public long countByPermissionCode(String permissionCode) {
        LambdaQueryWrapper<RolePermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RolePermissionDO::getPermissionCode, permissionCode);
        return rolePermissionMapper.selectCount(wrapper);
    }

    @Override
    public boolean exists(Long roleId, String permissionCode) {
        LambdaQueryWrapper<RolePermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RolePermissionDO::getRoleId, roleId);
        wrapper.eq(RolePermissionDO::getPermissionCode, permissionCode);
        return rolePermissionMapper.selectCount(wrapper) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void replacePermissions(Long roleId, List<String> permissionCodes) {
        removeByRoleId(roleId);

        if (permissionCodes != null && !permissionCodes.isEmpty()) {
            // 去重且保持顺序，避免重复提交或前端重复项产生冗余行
            List<String> distinct = new ArrayList<>(new LinkedHashSet<>(permissionCodes));
            List<RolePermissionDO> entities = new ArrayList<>(distinct.size());
            for (String code : distinct) {
                RolePermissionDO rp = new RolePermissionDO();
                rp.setRoleId(roleId);
                rp.setPermissionCode(code);
                rp.setDeleted(0);  // insertBatchSomeColumn 不会自动填充，需手动设置
                entities.add(rp);
            }
            rolePermissionMapper.insertBatchSomeColumn(entities);
        }
    }

    @Override
    public void removeByRoleId(Long roleId) {
        LambdaQueryWrapper<RolePermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RolePermissionDO::getRoleId, roleId);
        rolePermissionMapper.delete(wrapper);
    }

    @Override
    public Set<String> listByRoleIdsAndPermissionCode(Set<Long> roleIds, String permissionCode) {
        if (roleIds == null || roleIds.isEmpty()) {
            return Set.of();
        }
        LambdaQueryWrapper<RolePermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(RolePermissionDO::getRoleId, roleIds);
        wrapper.eq(RolePermissionDO::getPermissionCode, permissionCode);
        List<RolePermissionDO> list = rolePermissionMapper.selectList(wrapper);
        Set<String> result = new HashSet<>();
        for (RolePermissionDO rp : list) {
            result.add(String.valueOf(rp.getRoleId()));
        }
        return result;
    }
}

