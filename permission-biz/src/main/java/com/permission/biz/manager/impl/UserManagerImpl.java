package com.permission.biz.manager.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.biz.config.AuthUsersConfig;
import com.permission.biz.dto.user.CreateUserDTO;
import com.permission.biz.dto.user.UpdateUserDTO;
import com.permission.biz.dto.user.UserQueryDTO;
import com.permission.biz.manager.UserManager;
import com.permission.biz.vo.user.CreateUserResultVO;
import com.permission.biz.vo.user.UserVO;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.dal.dataobject.UserDO;
import com.permission.dal.mapper.UserMapper;
import com.permission.service.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Map;
import java.util.UUID;

/**
 * 用户管理 Manager 实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagerImpl implements UserManager {

    private static final int USER_TYPE_BUSINESS = 0;
    private static final String RANDOM_PW_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

    private final UserMapper userMapper;
    private final PasswordService passwordService;
    private final AuthUsersConfig authUsersConfig;

    @Override
    public IPage<UserVO> listUsers(UserQueryDTO dto) {
        Page<UserDO> page = new Page<>(dto.getPageNum(), dto.getPageSize());

        LambdaQueryWrapper<UserDO> wrapper = new LambdaQueryWrapper<UserDO>()
                .eq(UserDO::getUserType, USER_TYPE_BUSINESS)
                .like(StringUtils.hasText(dto.getLoginAccount()), UserDO::getLoginAccount, dto.getLoginAccount())
                .like(StringUtils.hasText(dto.getUserId()), UserDO::getUserId, dto.getUserId())
                .like(StringUtils.hasText(dto.getDisplayName()), UserDO::getDisplayName, dto.getDisplayName())
                .like(StringUtils.hasText(dto.getMobile()), UserDO::getMobile, dto.getMobile())
                .like(StringUtils.hasText(dto.getEmail()), UserDO::getEmail, dto.getEmail())
                .eq(dto.getStatus() != null, UserDO::getStatus, dto.getStatus())
                .eq(dto.getOrgId() != null, UserDO::getPrimaryOrgId, dto.getOrgId())
                .eq(dto.getPositionId() != null, UserDO::getPositionId, dto.getPositionId())
                .orderByDesc(UserDO::getGmtCreate);

        userMapper.selectPage(page, wrapper);

        return page.convert(this::toVo);
    }

    @Override
    public UserVO getUserByUserId(String userId) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
                        .eq(UserDO::getUserType, USER_TYPE_BUSINESS)
        );

        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        return toVo(userDO);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CreateUserResultVO createUser(CreateUserDTO dto) {
        String loginAccount = dto.getLoginAccount().trim();
        assertNotReservedLogin(loginAccount);

        if (userMapper.selectOne(new LambdaQueryWrapper<UserDO>().eq(UserDO::getLoginAccount, loginAccount)) != null) {
            throw new BusinessException(ErrorCode.LOGIN_ACCOUNT_EXISTS);
        }

        if (StringUtils.hasText(dto.getPassword()) && dto.getPassword().length() < 6) {
            throw new BusinessException(ErrorCode.AUTHZ_PARAM_INVALID, "密码长度至少6位");
        }

        String userId = generateUserId();
        while (userMapper.selectOne(new LambdaQueryWrapper<UserDO>().eq(UserDO::getUserId, userId)) != null) {
            userId = generateUserId();
        }

        if (StringUtils.hasText(dto.getMobile())) {
            UserDO mobileUser = userMapper.selectOne(
                    new LambdaQueryWrapper<UserDO>().eq(UserDO::getMobile, dto.getMobile())
            );
            if (mobileUser != null) {
                throw new BusinessException(ErrorCode.MOBILE_EXISTS);
            }
        }

        if (StringUtils.hasText(dto.getEmail())) {
            UserDO emailUser = userMapper.selectOne(
                    new LambdaQueryWrapper<UserDO>().eq(UserDO::getEmail, dto.getEmail())
            );
            if (emailUser != null) {
                throw new BusinessException(ErrorCode.EMAIL_EXISTS);
            }
        }

        String plainPassword;
        String initialPassword = null;
        if (StringUtils.hasText(dto.getPassword())) {
            plainPassword = dto.getPassword();
        } else {
            plainPassword = randomPassword(12);
            initialPassword = plainPassword;
        }

        UserDO userDO = new UserDO();
        userDO.setUserId(userId);
        userDO.setLoginAccount(loginAccount);
        userDO.setPasswordHash(passwordService.encode(plainPassword));
        userDO.setUserType(USER_TYPE_BUSINESS);
        userDO.setDisplayName(dto.getDisplayName());
        userDO.setFullName(dto.getFullName());
        userDO.setMobile(dto.getMobile());
        userDO.setEmail(dto.getEmail());
        userDO.setAvatarUrl(dto.getAvatarUrl());
        userDO.setStatus(1);
        userDO.setPrimaryOrgId(dto.getPrimaryOrgId());
        userDO.setPositionId(dto.getPositionId());
        userDO.setEmployeeNo(dto.getEmployeeNo());

        userMapper.insert(userDO);

        log.info("创建用户成功: userId={}, loginAccount={}", userId, loginAccount);

        CreateUserResultVO result = new CreateUserResultVO();
        result.setUser(toVo(userDO));
        result.setInitialPassword(initialPassword);
        return result;
    }

    @Override
    public UserVO updateUser(String userId, UpdateUserDTO dto) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
                        .eq(UserDO::getUserType, USER_TYPE_BUSINESS)
        );
        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (StringUtils.hasText(dto.getDisplayName())) {
            userDO.setDisplayName(dto.getDisplayName());
        }
        if (dto.getFullName() != null) {
            userDO.setFullName(dto.getFullName());
        }
        if (dto.getMobile() != null) {
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
        UserDO userDO = requireBusinessUser(userId);
        userDO.setStatus(1);
        userMapper.updateById(userDO);
        log.info("启用用户成功: userId={}", userId);
    }

    @Override
    public void disableUser(String userId) {
        UserDO userDO = requireBusinessUser(userId);
        userDO.setStatus(0);
        userMapper.updateById(userDO);
        log.info("禁用用户成功: userId={}", userId);
    }

    @Override
    public void deleteUser(String userId) {
        UserDO userDO = requireBusinessUser(userId);
        userMapper.deleteById(userDO.getId());
        log.info("删除用户成功: userId={}", userId);
    }

    @Override
    public String resetPassword(String userId, String newPassword) {
        UserDO userDO = requireBusinessUser(userId);
        String plain = StringUtils.hasText(newPassword) ? newPassword : randomPassword(12);
        if (plain.length() < 6) {
            throw new BusinessException(ErrorCode.AUTHZ_PARAM_INVALID, "密码长度至少6位");
        }
        userDO.setPasswordHash(passwordService.encode(plain));
        userMapper.updateById(userDO);
        log.info("重置密码成功: userId={}", userId);
        return plain;
    }

    private UserDO requireBusinessUser(String userId) {
        UserDO userDO = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getUserId, userId)
                        .eq(UserDO::getUserType, USER_TYPE_BUSINESS)
        );
        if (userDO == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return userDO;
    }

    private void assertNotReservedLogin(String loginAccount) {
        Map<String, String> cfg = authUsersConfig.getUsers();
        if (cfg != null && cfg.containsKey(loginAccount)) {
            throw new BusinessException(ErrorCode.RESERVED_LOGIN_ACCOUNT);
        }
    }

    private UserVO toVo(UserDO userDO) {
        UserVO vo = new UserVO();
        vo.setId(userDO.getId());
        vo.setUserId(userDO.getUserId());
        vo.setLoginAccount(userDO.getLoginAccount());
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

    private String generateUserId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return "u_" + uuid.substring(0, 12);
    }

    private String randomPassword(int length) {
        SecureRandom r = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(RANDOM_PW_CHARS.charAt(r.nextInt(RANDOM_PW_CHARS.length())));
        }
        return sb.toString();
    }
}
