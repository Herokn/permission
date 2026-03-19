package com.permission.biz.vo.organization;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 组织 VO
 */
@Data
public class OrganizationVO {

    private Long id;
    private String code;
    private String name;
    private Long parentId;
    private Integer sortOrder;
    private String status;
    private String description;
    private LocalDateTime gmtCreate;
    private LocalDateTime gmtModified;
}

