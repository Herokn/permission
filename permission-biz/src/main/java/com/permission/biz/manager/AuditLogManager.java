package com.permission.biz.manager;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.permission.biz.dto.audit.AuditLogQueryDTO;
import com.permission.biz.vo.audit.AuditLogVO;

public interface AuditLogManager {

    IPage<AuditLogVO> pageQuery(AuditLogQueryDTO dto);
}
