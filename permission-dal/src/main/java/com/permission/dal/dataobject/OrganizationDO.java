package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 组织实体
 */
@Data
@TableName("organization")
public class OrganizationDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 组织编码 */
    private String orgCode;

    /** 组织名称 */
    private String orgName;

    /** 组织类型：COMPANY/DEPARTMENT/TEAM */
    private String orgType;

    /** 父组织ID */
    private Long parentId;

    /** 层级 */
    private Integer level;

    /** 路径 */
    private String path;

    /** 状态：1=启用, 0=禁用 */
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;
}

