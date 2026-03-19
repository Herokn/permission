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
    private String code;

    /** 组织名称 */
    private String name;

    /** 父组织ID */
    private Long parentId;

    /** 排序号 */
    private Integer sortOrder;

    /** 状态：ENABLED/DISABLED */
    private String status;

    /** 描述 */
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;
}

