package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.permission.common.enums.PermissionEffectEnum;
import com.permission.dal.dataobject.UserPermissionDO;
import com.permission.dal.mapper.UserPermissionMapper;
import com.permission.service.UserPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户直接权限 Service 实现
 */
@Service
@RequiredArgsConstructor
public class UserPermissionServiceImpl implements UserPermissionService {

    private final UserPermissionMapper userPermissionMapper;

    @Override
    public UserPermissionDO findDeny(String userId, String permissionCode, String projectId) {
        return findByEffect(userId, permissionCode, PermissionEffectEnum.DENY.getCode(), projectId);
    }

    @Override
    public UserPermissionDO findAllow(String userId, String permissionCode, String projectId) {
        return findByEffect(userId, permissionCode, PermissionEffectEnum.ALLOW.getCode(), projectId);
    }

    private UserPermissionDO findByEffect(String userId, String permissionCode, String effect, String projectId) {
        LambdaQueryWrapper<UserPermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPermissionDO::getUserId, userId);
        wrapper.eq(UserPermissionDO::getPermissionCode, permissionCode);
        wrapper.eq(UserPermissionDO::getEffect, effect);
        // 查指定项目 + 全局
        wrapper.and(w -> {
            w.isNull(UserPermissionDO::getProjectId);
            if (projectId != null) {
                w.or().eq(UserPermissionDO::getProjectId, projectId);
            }
        });
        // 项目级优先于全局
        wrapper.orderByDesc(UserPermissionDO::getProjectId);
        wrapper.last("LIMIT 1");
        return userPermissionMapper.selectOne(wrapper);
    }

    @Override
    public long countByPermissionCode(String permissionCode) {
        LambdaQueryWrapper<UserPermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPermissionDO::getPermissionCode, permissionCode);
        return userPermissionMapper.selectCount(wrapper);
    }

    @Override
    public long countByProjectId(String projectId) {
        LambdaQueryWrapper<UserPermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPermissionDO::getProjectId, projectId);
        return userPermissionMapper.selectCount(wrapper);
    }

    @Override
    public List<UserPermissionDO> listByUserId(String userId) {
        LambdaQueryWrapper<UserPermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPermissionDO::getUserId, userId);
        return userPermissionMapper.selectList(wrapper);
    }

    @Override
    public void grant(String userId, String permissionCode, String effect, String projectId) {
        // 幂等：已存在（deleted=0）则直接返回
        LambdaQueryWrapper<UserPermissionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPermissionDO::getUserId, userId);
        wrapper.eq(UserPermissionDO::getPermissionCode, permissionCode);
        wrapper.eq(UserPermissionDO::getEffect, effect);
        if (projectId != null) {
            wrapper.eq(UserPermissionDO::getProjectId, projectId);
        } else {
            wrapper.isNull(UserPermissionDO::getProjectId);
        }
        Long count = userPermissionMapper.selectCount(wrapper);
        if (count > 0) {
            return;
        }

        // 新方案：不再物理删除，直接插入新记录
        // 由于唯一索引包含 deleted_time（NULL不冲突），新记录可直接插入
        UserPermissionDO record = new UserPermissionDO();
        record.setUserId(userId);
        record.setPermissionCode(permissionCode);
        record.setEffect(effect);
        record.setProjectId(projectId);
        record.setDeletedTime(null); // 未删除
        userPermissionMapper.insert(record);
    }

    @Override
    public void revoke(String userId, String permissionCode, String effect, String projectId) {
        // 新方案：使用 deleted_time 软删除，保留审计链路
        LambdaUpdateWrapper<UserPermissionDO> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(UserPermissionDO::getUserId, userId);
        updateWrapper.eq(UserPermissionDO::getPermissionCode, permissionCode);
        updateWrapper.eq(UserPermissionDO::getEffect, effect);
        if (projectId != null) {
            updateWrapper.eq(UserPermissionDO::getProjectId, projectId);
        } else {
            updateWrapper.isNull(UserPermissionDO::getProjectId);
        }
        // 同时更新 deleted 和 deleted_time，兼容 MyBatis-Plus 逻辑删除
        updateWrapper.set(UserPermissionDO::getDeleted, 1);
        updateWrapper.set(UserPermissionDO::getDeletedTime, LocalDateTime.now());
        
        userPermissionMapper.update(null, updateWrapper);
    }
}

