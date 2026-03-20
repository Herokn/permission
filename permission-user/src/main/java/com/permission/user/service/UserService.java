package com.permission.user.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.user.dto.CreateUserDTO;
import com.permission.user.dto.ResetPasswordDTO;
import com.permission.user.dto.UpdateUserDTO;
import com.permission.user.dto.UserQueryDTO;
import com.permission.user.vo.ResetPasswordVO;
import com.permission.user.vo.UserVO;

/**
 * 用户Service
 */
public interface UserService {

    /**
     * 分页查询用户
     */
    IPage<UserVO> listUsers(UserQueryDTO dto);

    /**
     * 根据userId查询用户详情
     */
    UserVO getUserByUserId(String userId);

    /**
     * 创建用户
     */
    UserVO createUser(CreateUserDTO dto);

    /**
     * 更新用户
     */
    UserVO updateUser(String userId, UpdateUserDTO dto);

    /**
     * 启用用户
     */
    void enableUser(String userId);

    /**
     * 禁用用户
     */
    void disableUser(String userId);

    /**
     * 重置密码
     */
    ResetPasswordVO resetPassword(String userId, ResetPasswordDTO dto);
}
