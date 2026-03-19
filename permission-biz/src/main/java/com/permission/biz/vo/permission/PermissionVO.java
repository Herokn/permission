package com.permission.biz.vo.permission;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 权限点 VO
 */
@Data
public class PermissionVO {

    private Long id;
    private String code;
    private String name;
    private String systemCode;
    private String projectId;
    private String type;
    private String parentCode;
    private Integer sortOrder;
    private String status;
    private String description;
    private LocalDateTime gmtCreate;
    private LocalDateTime gmtModified;
}

