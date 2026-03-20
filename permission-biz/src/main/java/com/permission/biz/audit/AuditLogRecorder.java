package com.permission.biz.audit;

import com.permission.dal.dataobject.AuditLogDO;
import com.permission.dal.mapper.AuditLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 异步写入审计日志，避免与业务线程争抢连接池；失败仅记录告警。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuditLogRecorder {

    private final AuditLogMapper auditLogMapper;

    @Async("asyncTaskExecutor")
    public void persist(AuditLogDO row) {
        try {
            auditLogMapper.insert(row);
        } catch (Exception e) {
            log.warn("异步审计日志写入失败: {}", e.getMessage());
        }
    }
}
