package com.permission.web.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.permission.biz.dto.audit.AuditLogQueryDTO;
import com.permission.biz.manager.AuditLogManager;
import com.permission.biz.vo.audit.AuditLogVO;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import com.permission.common.result.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "审计日志")
@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogManager auditLogManager;

    @Operation(summary = "分页查询审计日志")
    @GetMapping
    @RequirePermission("PERMISSION_CENTER_AUDIT_VIEW")
    public ApiResponse<PageResult<AuditLogVO>> page(AuditLogQueryDTO dto) {
        IPage<AuditLogVO> page = auditLogManager.pageQuery(dto);
        return ApiResponse.success(PageResult.of(
                page.getTotal(),
                dto.getPageNum(),
                dto.getPageSize(),
                page.getRecords()
        ));
    }
}
