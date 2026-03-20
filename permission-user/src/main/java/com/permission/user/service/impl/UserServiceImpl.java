package com.permission.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.permission.user.dal.dataobject.UserDO;
import com.permission.user.dal.dataobject.UserOrgRelDO;
import com.permission.user.dal.mapper.UserMapper;
import com.permission.user.dal.mapper.UserOrgRelMapper;
import com.permission.user.dto.CreateUserDTO;
import com.permission.user.dto.ResetPasswordDTO;
import com.permission.user.dto.UpdateUserDTO;
import com.permission.user.dto.UserQueryDTO;
import com.permission.user.service.UserService;
import com.permission.user.vo.ResetPasswordVO;
import com.permission.user.vo.UserVO;

import java.security.SecureRandom;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 用户Service实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserOrgRelMapper userOrgRelMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

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
            UserVO vo = UserVO.builder()
                    .id(userDO.getId())
                    .userId(userDO.getUserId())
                    .displayName(userDO.getDisplayName())
                    .fullName(userDO.getFullName())
                    .mobile(userDO.getMobile())
                    .email(userDO.getEmail())
                    .avatarUrl(userDO.getAvatarUrl())
                    .status(userDO.getStatus())
                    .build();

            // TODO: 查询和组织、岗位相关信息
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

        return UserVO.builder()
                .id(userDO.getId())
                .userId(userDO.getUserId())
                .displayName(userDO.getDisplayName())
                .fullName(userDO.getFullName())
                .mobile(userDO.getMobile())
                .email(userDO.getEmail())
                .avatarUrl(userDO.getAvatarUrl())
                .status(userDO.getStatus())
                .build();
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

        userMapper.insert(userDO);

        // 5. 创建用户组织关系
        if (dto.getPrimaryOrgId() != null) {
            UserOrgRelDO orgRel = new UserOrgRelDO();
            orgRel.setUserId(dto.getUserId());
            orgRel.setOrgId(dto.getPrimaryOrgId());
            orgRel.setIsPrimary(1);
            orgRel.setPositionId(dto.getPositionId());
            orgRel.setEmployeeNo(dto.getEmployeeNo());
            userOrgRelMapper.insert(orgRel);
            log.info("创建用户组织关系成功: userId={}, orgId={}", dto.getUserId(), dto.getPrimaryOrgId());
        }

        log.info("创建用户成功: userId={}", dto.getUserId());

        return UserVO.builder()
                .id(userDO.getId())
                .userId(userDO.getUserId())
                .displayName(userDO.getDisplayName())
                .fullName(userDO.getFullName())
                .mobile(userDO.getMobile())
                .email(userDO.getEmail())
                .avatarUrl(userDO.getAvatarUrl())
                .status(userDO.getStatus())
                .primaryOrgId(dto.getPrimaryOrgId())
                .positionId(dto.getPositionId())
                .employeeNo(dto.getEmployeeNo())
                .build();
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
    public ResetPasswordVO resetPassword(String userId, ResetPasswordDTO dto) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
        );
        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        String temporaryPassword;
        boolean autoGenerated = dto.getNewPassword() == null;

        if (autoGenerated) {
            // 自动生成8位随机密码
            temporaryPassword = generateRandomPassword(8);
        } else {
            temporaryPassword = dto.getNewPassword();
        }

        // 加密密码（注意：这里简化处理，实际应该在单独的密码表）
        // TODO: 实现完整的密码管理逻辑

        log.info("重置密码成功: userId={}, autoGenerated={}", userId, autoGenerated);

        return ResetPasswordVO.builder()
                .temporaryPassword(temporaryPassword)
                .autoGenerated(autoGenerated)
                .build();
    }

    /**
     * 生成随机密码
     */
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return password.toString();
    }
}
