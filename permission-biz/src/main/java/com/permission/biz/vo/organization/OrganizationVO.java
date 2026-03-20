package com.permission.biz.vo.organization;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 组织 VO
 */
@Data
public class OrganizationVO {

    private Long id;
    private String orgCode;
    private String orgName;
    private String orgType;
    private Long parentId;
    private Integer level;
    private String path;
    private Integer status;
    private LocalDateTime gmtCreate;
    private LocalDateTime gmtModified;
}
