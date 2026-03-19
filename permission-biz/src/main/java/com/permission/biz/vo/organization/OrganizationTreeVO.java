package com.permission.biz.vo.organization;

import lombok.Data;

import java.util.List;

/**
 * 组织树 VO
 */
@Data
public class OrganizationTreeVO {

    private Long id;
    private String code;
    private String name;
    private String status;
    private Integer sortOrder;
    private List<OrganizationTreeVO> children;
}

