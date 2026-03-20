package com.permission.biz.dto.user;

import lombok.Data;

/**
 * 查询用户DTO
 */
@Data
public class UserQueryDTO {

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    /** 模糊：登录账号 */
    private String loginAccount;

    /** 模糊：业务用户ID */
    private String userId;

    private String displayName;

    private String mobile;

    private String email;

    private Integer status;

    /** 主组织 */
    private Long orgId;

    /** 岗位 */
    private Long positionId;
}
