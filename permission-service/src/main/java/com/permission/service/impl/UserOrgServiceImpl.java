package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.dal.dataobject.UserOrgDO;
import com.permission.dal.mapper.UserOrgMapper;
import com.permission.service.UserOrgService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户-组织 Service 实现
 */
@Service
@RequiredArgsConstructor
public class UserOrgServiceImpl implements UserOrgService {

    private final UserOrgMapper userOrgMapper;

    @Override
    public List<UserOrgDO> listByUserId(String userId) {
        LambdaQueryWrapper<UserOrgDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserOrgDO::getUserId, userId);
        return userOrgMapper.selectList(wrapper);
    }

    @Override
    public List<UserOrgDO> listByOrgId(Long orgId) {
        LambdaQueryWrapper<UserOrgDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserOrgDO::getOrgId, orgId);
        return userOrgMapper.selectList(wrapper);
    }

    @Override
    public long countByOrgId(Long orgId) {
        LambdaQueryWrapper<UserOrgDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserOrgDO::getOrgId, orgId);
        return userOrgMapper.selectCount(wrapper);
    }

    @Override
    public boolean exists(String userId, Long orgId) {
        LambdaQueryWrapper<UserOrgDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserOrgDO::getUserId, userId)
               .eq(UserOrgDO::getOrgId, orgId);
        return userOrgMapper.selectCount(wrapper) > 0;
    }

    @Override
    public void save(UserOrgDO userOrgDO) {
        userOrgMapper.insert(userOrgDO);
    }

    @Override
    public void remove(String userId, Long orgId) {
        LambdaQueryWrapper<UserOrgDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserOrgDO::getUserId, userId)
               .eq(UserOrgDO::getOrgId, orgId);
        userOrgMapper.delete(wrapper);
    }
}

