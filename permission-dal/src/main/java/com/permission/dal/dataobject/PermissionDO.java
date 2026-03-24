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
 * 权限点实体
 */
@Data
@TableName("permission")
public class PermissionDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 权限编码 */
    private String code;

    /** 权限名称 */
    private String name;

    /** 所属系统编码 */
    private String systemCode;

    /** 项目ID，NULL表示全局权限 */
    private String projectId;

    /** 权限类型：MENU/PAGE/ACTION */
    private String type;

    /** 父权限编码 */
    private String parentCode;

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

