package com.permission.biz.vo.permission;

import lombok.Data;

import java.util.List;

/**
 * 权限树 VO
 */
@Data
public class PermissionTreeVO {

    private Long id;
    private String code;
    private String name;
    private String type;
    private String status;
    private Integer sortOrder;
    private List<PermissionTreeVO> children;
}

