package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户直接权限实体
 */
@Data
@TableName("user_permission")
public class UserPermissionDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID */
    private String userId;

    /** 权限编码 */
    private String permissionCode;

    /** 效果：ALLOW/DENY */
    private String effect;

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

