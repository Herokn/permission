package com.permission.biz.vo.organization;

import lombok.Data;

import java.util.List;

/**
 * 组织树 VO
 */
@Data
public class OrganizationTreeVO {

    private Long id;
    private String orgCode;
    private String orgName;
    private String orgType;
    private Integer status;
    private List<OrganizationTreeVO> children;
}
