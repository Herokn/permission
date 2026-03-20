package com.permission.user.dal.dataobject;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户组织关系实体
 */
@Data
@TableName("user_org_rel")
public class UserOrgRelDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 组织ID
     */
    private Long orgId;

    /**
     * 是否主组织：1=是, 0=否
     */
    private Integer isPrimary;

    /**
     * 岗位ID
     */
    private Long positionId;

    /**
     * 工号
     */
    private String employeeNo;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;
}
