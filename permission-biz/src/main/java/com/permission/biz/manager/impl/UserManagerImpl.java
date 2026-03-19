package com.permission.biz.manager.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.biz.dto.user.CreateUserDTO;
import com.permission.biz.dto.user.UpdateUserDTO;
import com.permission.biz.dto.user.UserQueryDTO;
import com.permission.biz.manager.UserManager;
import com.permission.biz.vo.user.UserVO;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.dal.dataobject.UserDO;
import com.permission.dal.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 用户管理 Manager 实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagerImpl implements UserManager {

    private final UserMapper userMapper;

    @Override
    public IPage<UserVO> listUsers(UserQueryDTO dto) {
        Page<UserDO> page = new Page<>(dto.getPageNum(), dto.getPageSize());

        LambdaQueryWrapper<UserDO> wrapper = new LambdaQueryWrapper<UserDO>()
                .like(StringUtils.hasText(dto.getDisplayName()), UserDO::getDisplayName, dto.getDisplayName())
                .like(StringUtils.hasText(dto.getMobile()), UserDO::getMobile, dto.getMobile())
                .like(StringUtils.hasText(dto.getEmail()), UserDO::getEmail, dto.getEmail())
                .eq(dto.getStatus() != null, UserDO::getStatus, dto.getStatus())
                .orderByDesc(UserDO::getGmtCreate);

        userMapper.selectPage(page, wrapper);

        return page.convert(userDO -> {
            UserVO vo = new UserVO();
            vo.setId(userDO.getId());
            vo.setUserId(userDO.getUserId());
            vo.setDisplayName(userDO.getDisplayName());
            vo.setFullName(userDO.getFullName());
            vo.setMobile(userDO.getMobile());
            vo.setEmail(userDO.getEmail());
            vo.setAvatarUrl(userDO.getAvatarUrl());
            vo.setStatus(userDO.getStatus());
            vo.setPrimaryOrgId(userDO.getPrimaryOrgId());
            vo.setPositionId(userDO.getPositionId());
            vo.setEmployeeNo(userDO.getEmployeeNo());
            return vo;
        });
    }

    @Override
    public UserVO getUserByUserId(String userId) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
        );

        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        UserVO vo = new UserVO();
        vo.setId(userDO.getId());
        vo.setUserId(userDO.getUserId());
        vo.setDisplayName(userDO.getDisplayName());
        vo.setFullName(userDO.getFullName());
        vo.setMobile(userDO.getMobile());
        vo.setEmail(userDO.getEmail());
        vo.setAvatarUrl(userDO.getAvatarUrl());
        vo.setStatus(userDO.getStatus());
        vo.setPrimaryOrgId(userDO.getPrimaryOrgId());
        vo.setPositionId(userDO.getPositionId());
        vo.setEmployeeNo(userDO.getEmployeeNo());
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO createUser(CreateUserDTO dto) {
        // 1. 检查用户ID是否已存在
        UserDO existing = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, dto.getUserId())
        );
        if (existing != null) {
            throw new BusinessException(ErrorCode.USER_ID_EXISTS);
        }

        // 2. 检查手机号是否已被使用
        if (StringUtils.hasText(dto.getMobile())) {
            UserDO mobileUser = userMapper.selectOne(
                    new LambdaQueryWrapper<UserDO>()
                            .eq(UserDO::getMobile, dto.getMobile())
            );
            if (mobileUser != null) {
                throw new BusinessException(ErrorCode.MOBILE_EXISTS);
            }
        }

        // 3. 检查邮箱是否已被使用
        if (StringUtils.hasText(dto.getEmail())) {
            UserDO emailUser = userMapper.selectOne(
                    new LambdaQueryWrapper<UserDO>()
                            .eq(UserDO::getEmail, dto.getEmail())
            );
            if (emailUser != null) {
                throw new BusinessException(ErrorCode.EMAIL_EXISTS);
            }
        }

        // 4. 创建用户
        UserDO userDO = new UserDO();
        userDO.setUserId(dto.getUserId());
        userDO.setDisplayName(dto.getDisplayName());
        userDO.setFullName(dto.getFullName());
        userDO.setMobile(dto.getMobile());
        userDO.setEmail(dto.getEmail());
        userDO.setAvatarUrl(dto.getAvatarUrl());
        userDO.setStatus(1); // 默认启用
        userDO.setPrimaryOrgId(dto.getPrimaryOrgId());
        userDO.setPositionId(dto.getPositionId());
        userDO.setEmployeeNo(dto.getEmployeeNo());

        userMapper.insert(userDO);

        log.info("创建用户成功: userId={}", dto.getUserId());

        UserVO vo = new UserVO();
        vo.setId(userDO.getId());
        vo.setUserId(userDO.getUserId());
        vo.setDisplayName(userDO.getDisplayName());
        vo.setFullName(userDO.getFullName());
        vo.setMobile(userDO.getMobile());
        vo.setEmail(userDO.getEmail());
        vo.setAvatarUrl(userDO.getAvatarUrl());
        vo.setStatus(userDO.getStatus());
        vo.setPrimaryOrgId(userDO.getPrimaryOrgId());
        vo.setPositionId(userDO.getPositionId());
        vo.setEmployeeNo(userDO.getEmployeeNo());
        return vo;
    }

    @Override
    public UserVO updateUser(String userId, UpdateUserDTO dto) {
        // 1. 查询用户
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
        );
        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 2. 更新字段
        if (StringUtils.hasText(dto.getDisplayName())) {
            userDO.setDisplayName(dto.getDisplayName());
        }
        if (dto.getFullName() != null) {
            userDO.setFullName(dto.getFullName());
        }
        if (dto.getMobile() != null) {
            // 检查手机号是否被其他用户使用
            if (StringUtils.hasText(dto.getMobile())) {
                UserDO mobileUser = userMapper.selectOne(
                        new LambdaQueryWrapper<UserDO>()
                                .eq(UserDO::getMobile, dto.getMobile())
                                .ne(UserDO::getUserId, userId)
                );
                if (mobileUser != null) {
                    throw new BusinessException(ErrorCode.MOBILE_EXISTS);
                }
            }
            userDO.setMobile(dto.getMobile());
        }
        if (dto.getEmail() != null) {
            // 检查邮箱是否被其他用户使用
            if (StringUtils.hasText(dto.getEmail())) {
                UserDO emailUser = userMapper.selectOne(
                        new LambdaQueryWrapper<UserDO>()
                                .eq(UserDO::getEmail, dto.getEmail())
                                .ne(UserDO::getUserId, userId)
                );
                if (emailUser != null) {
                    throw new BusinessException(ErrorCode.EMAIL_EXISTS);
                }
            }
            userDO.setEmail(dto.getEmail());
        }
        if (dto.getAvatarUrl() != null) {
            userDO.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getPrimaryOrgId() != null) {
            userDO.setPrimaryOrgId(dto.getPrimaryOrgId());
        }
        if (dto.getPositionId() != null) {
            userDO.setPositionId(dto.getPositionId());
        }
        if (dto.getEmployeeNo() != null) {
            userDO.setEmployeeNo(dto.getEmployeeNo());
        }

        userMapper.updateById(userDO);

        log.info("更新用户成功: userId={}", userId);

        return getUserByUserId(userId);
    }

    @Override
    public void enableUser(String userId) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
        );
        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        userDO.setStatus(1);
        userMapper.updateById(userDO);

        log.info("启用用户成功: userId={}", userId);
    }

    @Override
    public void disableUser(String userId) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
        );
        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        userDO.setStatus(0);
        userMapper.updateById(userDO);

        log.info("禁用用户成功: userId={}", userId);
    }

    @Override
    public void deleteUser(String userId) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
        );
        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        userMapper.deleteById(userDO.getId());

        log.info("删除用户成功: userId={}", userId);
    }
}
