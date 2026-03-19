package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.dal.dataobject.UserRoleDO;
import com.permission.dal.mapper.UserRoleMapper;
import com.permission.service.UserRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户-角色 Service 实现
 */
@Service
@RequiredArgsConstructor
public class UserRoleServiceImpl implements UserRoleService {

    private final UserRoleMapper userRoleMapper;

    @Override
    public List<UserRoleDO> listByUserIdAndProjectId(String userId, String projectId) {
        LambdaQueryWrapper<UserRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRoleDO::getUserId, userId);
        // 查询指定项目 + 全局（projectId = NULL）
        wrapper.and(w -> {
            w.isNull(UserRoleDO::getProjectId);
            if (projectId != null) {
                w.or().eq(UserRoleDO::getProjectId, projectId);
            }
        });
        return userRoleMapper.selectList(wrapper);
    }

    @Override
    public List<UserRoleDO> listByUserId(String userId) {
        LambdaQueryWrapper<UserRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRoleDO::getUserId, userId);
        return userRoleMapper.selectList(wrapper);
    }

    @Override
    public List<UserRoleDO> listByRoleId(Long roleId) {
        LambdaQueryWrapper<UserRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRoleDO::getRoleId, roleId);
        return userRoleMapper.selectList(wrapper);
    }

    @Override
    public long countByRoleId(Long roleId) {
        LambdaQueryWrapper<UserRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRoleDO::getRoleId, roleId);
        return userRoleMapper.selectCount(wrapper);
    }

    @Override
    public long countByProjectId(String projectId) {
        LambdaQueryWrapper<UserRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRoleDO::getProjectId, projectId);
        return userRoleMapper.selectCount(wrapper);
    }

    @Override
    public void assign(String userId, Long roleId, String projectId) {
        // 幂等：已存在则直接返回
        if (exists(userId, roleId, projectId)) {
            return;
        }
        UserRoleDO userRoleDO = new UserRoleDO();
        userRoleDO.setUserId(userId);
        userRoleDO.setRoleId(roleId);
        userRoleDO.setProjectId(projectId);
        userRoleMapper.insert(userRoleDO);
    }

    @Override
    public void revoke(String userId, Long roleId, String projectId) {
        LambdaQueryWrapper<UserRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRoleDO::getUserId, userId);
        wrapper.eq(UserRoleDO::getRoleId, roleId);
        if (projectId != null) {
            wrapper.eq(UserRoleDO::getProjectId, projectId);
        } else {
            wrapper.isNull(UserRoleDO::getProjectId);
        }
        // 幂等：不存在也不报错
        userRoleMapper.delete(wrapper);
    }

    @Override
    public boolean exists(String userId, Long roleId, String projectId) {
        LambdaQueryWrapper<UserRoleDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRoleDO::getUserId, userId);
        wrapper.eq(UserRoleDO::getRoleId, roleId);
        if (projectId != null) {
            wrapper.eq(UserRoleDO::getProjectId, projectId);
        } else {
            wrapper.isNull(UserRoleDO::getProjectId);
        }
        return userRoleMapper.selectCount(wrapper) > 0;
    }
}

