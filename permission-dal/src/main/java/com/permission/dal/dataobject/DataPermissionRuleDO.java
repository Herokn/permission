package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 数据权限规则 DO
 */
@Data
@TableName("data_permission_rule")
public class DataPermissionRuleDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 角色ID
     */
    private Long roleId;

    /**
     * 资源类型（如 ORDER, PROJECT 等）
     */
    private String resourceType;

    /**
     * 范围类型：ALL/DEPARTMENT/SELF/CUSTOM
     */
    private String scopeType;

    /**
     * 范围值（如部门ID列表，JSON格式）
     */
    private String scopeValue;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedTime;
}
