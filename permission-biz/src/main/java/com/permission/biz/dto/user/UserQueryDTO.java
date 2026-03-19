package com.permission.biz.dto.user;

import lombok.Data;

/**
 * 查询用户DTO
 */
@Data
public class UserQueryDTO {

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String displayName;

    private String mobile;

    private String email;

    private Integer status;

    private Long orgId;
}
