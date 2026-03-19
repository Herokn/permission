package com.permission.biz.vo.organization;

import lombok.Data;

/**
 * 组织成员 VO
 */
@Data
public class OrgMemberVO {

    private String userId;
    private Long orgId;
    private String orgName;
}

