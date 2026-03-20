package com.permission.biz.dto.audit;

import lombok.Data;

/**
 * 审计日志查询
 */
@Data
public class AuditLogQueryDTO {

    private Integer pageNum = 1;
    private Integer pageSize = 20;
    private String module;
    private String operator;
    private String action;
}
