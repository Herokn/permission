package com.permission.biz.manager;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.permission.biz.dto.user.CreateUserDTO;
import com.permission.biz.dto.user.UpdateUserDTO;
import com.permission.biz.dto.user.UserQueryDTO;
import com.permission.biz.vo.user.UserVO;

/**
 * 用户管理 Manager
 */
public interface UserManager {

    /**
     * 分页查询用户
     */
    IPage<UserVO> listUsers(UserQueryDTO dto);

    /**
     * 查询用户详情
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
     * 删除用户
     */
    void deleteUser(String userId);
}
