package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 操作审计日志实体
 */
@Data
@TableName("audit_log")
public class AuditLogDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 操作人 */
    private String operator;

    /** 模块 */
    private String module;

    /** 操作 */
    private String action;

    /** 目标类型 */
    private String targetType;

    /** 目标ID */
    private String targetId;

    /** 操作详情(JSON) */
    private String detail;

    /** 操作人IP */
    private String ipAddress;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;
}

