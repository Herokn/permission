package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 组织-角色关联实体
 */
@Data
@TableName("org_role")
public class OrgRoleDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 组织ID */
    private Long orgId;

    /** 角色ID */
    private Long roleId;

    /** 项目ID（可选，用于项目级隔离） */
    private Long projectId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;
}

