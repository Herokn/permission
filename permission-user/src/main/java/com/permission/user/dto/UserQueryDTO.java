package com.permission.user.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 用户查询DTO
 */
@Data
@Builder
public class UserQueryDTO {

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String displayName;

    private String mobile;

    private String email;

    private Integer status;

    private Long orgId;
}
