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
 * 岗位实体
 */
@Data
@TableName("position")
public class PositionDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 岗位编码 */
    private String positionCode;

    /** 岗位名称 */
    private String positionName;

    /** 岗位级别 */
    private Integer level;

    /** 描述 */
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;
}
