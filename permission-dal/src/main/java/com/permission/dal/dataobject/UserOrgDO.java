package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户-组织关联实体
 */
@Data
@TableName("user_org")
public class UserOrgDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID */
    private String userId;

    /** 组织ID */
    private Long orgId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;
}

