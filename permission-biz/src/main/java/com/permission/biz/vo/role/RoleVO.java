package com.permission.biz.vo.role;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 角色 VO
 */
@Data
public class RoleVO {

    private Long id;
    private String code;
    private String name;
    private String roleScope;
    private String roleDomain;
    private String projectId;
    private String status;
    private String description;
    private LocalDateTime gmtCreate;
    private LocalDateTime gmtModified;

    /** 角色拥有的权限编码列表（详情接口返回） */
    private List<String> permissionCodes;
}

