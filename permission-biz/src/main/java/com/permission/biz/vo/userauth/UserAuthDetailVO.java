package com.permission.biz.vo.userauth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 用户授权详情 VO
 */
@Data
public class UserAuthDetailVO {

    private String userId;
    /** 业务用户登录账号（配置账号无此字段） */
    private String loginAccount;
    /** 显示名称 */
    private String displayName;
    private List<UserRoleVO> roles;
    private List<UserDirectPermissionVO> directPermissions;

    /**
     * 当前用户所绑定且已启用角色下的权限点编码并集（去重、排序），不含组织角色继承；与 directPermissions 共同构成生效授权全貌。
     */
    @Schema(description = "启用角色下的权限点编码并集（去重）")
    private List<String> rolePermissionCodes;
}

