package com.permission.biz.vo.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 用户VO
 */
@Data
public class UserVO {

    private Long id;

    private String userId;

    private String loginAccount;

    private String displayName;

    private String fullName;

    private String mobile;

    private String email;

    private String avatarUrl;

    private Integer status;

    @JsonProperty("orgId")
    private Long primaryOrgId;

    private String primaryOrgName;

    private Long positionId;

    private String positionName;

    private String employeeNo;
}
