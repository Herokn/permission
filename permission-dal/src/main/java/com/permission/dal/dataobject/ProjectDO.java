package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 项目实体
 */
@Data
@TableName(value = "project", autoResultMap = true)
public class ProjectDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String code;

    private String name;

    private String description;

    /**
     * 系统模块列表，JSON格式存储
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<SystemModule> systems;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;

    /**
     * 系统模块
     */
    @Data
    public static class SystemModule {
        private String code;
        private String name;
    }
}
