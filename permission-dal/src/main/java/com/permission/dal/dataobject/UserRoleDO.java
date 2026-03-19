package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户-角色关系实体
 */
@Data
@TableName("user_role")
public class UserRoleDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID */
    private String userId;

    /** 角色ID */
    private Long roleId;

    /** 项目ID（NULL表示全局） */
    private String projectId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    /** 软删除标记（保留字段，兼容旧数据） */
    @TableLogic
    private Integer deleted;

    /** 删除时间，NULL表示未删除 */
    private LocalDateTime deletedTime;
}

