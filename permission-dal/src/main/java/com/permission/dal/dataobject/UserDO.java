package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体
 */
@Data
@TableName("user")
public class UserDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 业务用户ID（鉴权主键，非登录账号）
     */
    private String userId;

    /**
     * 登录账号
     */
    private String loginAccount;

    /**
     * BCrypt 密码哈希
     */
    private String passwordHash;

    /**
     * 0=业务用户（列表可见） 1=系统内置（列表不可见）
     */
    private Integer userType;

    /**
     * 显示名称
     */
    private String displayName;

    /**
     * 全名
     */
    private String fullName;

    /**
     * 手机号
     */
    private String mobile;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 头像URL
     */
    private String avatarUrl;

    /**
     * 状态：1=启用, 0=禁用
     */
    private Integer status;

    /**
     * 主组织ID
     */
    private Long primaryOrgId;

    /**
     * 岗位ID
     */
    private Long positionId;

    /**
     * 工号
     */
    private String employeeNo;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;
}
