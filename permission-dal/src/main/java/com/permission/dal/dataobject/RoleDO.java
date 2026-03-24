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
 * 角色实体
 */
@Data
@TableName("role")
public class RoleDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 角色编码 */
    private String code;

    /** 角色名称 */
    private String name;

    /** 角色范围：GLOBAL/PROJECT */
    private String roleScope;

    /** 角色域：APP/PERM_CENTER */
    private String roleDomain;

    /** 项目ID，NULL表示全局角色 */
    private String projectId;

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

