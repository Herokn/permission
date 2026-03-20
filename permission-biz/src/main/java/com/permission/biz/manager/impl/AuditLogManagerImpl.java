package com.permission.biz.manager.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.biz.dto.audit.AuditLogQueryDTO;
import com.permission.biz.manager.AuditLogManager;
import com.permission.biz.vo.audit.AuditLogVO;
import com.permission.dal.dataobject.AuditLogDO;
import com.permission.dal.mapper.AuditLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuditLogManagerImpl implements AuditLogManager {

    private final AuditLogMapper auditLogMapper;

    @Override
    public IPage<AuditLogVO> pageQuery(AuditLogQueryDTO dto) {
        Page<AuditLogDO> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        // 仅展示权限中心域操作：角色、权限点、用户授权（不记录用户中心组织等）
        LambdaQueryWrapper<AuditLogDO> w = new LambdaQueryWrapper<AuditLogDO>()
                .in(AuditLogDO::getModule, "ROLE", "PERMISSION", "USER_AUTH")
                .eq(StringUtils.hasText(dto.getModule()), AuditLogDO::getModule, dto.getModule())
                .eq(StringUtils.hasText(dto.getOperator()), AuditLogDO::getOperator, dto.getOperator())
                .eq(StringUtils.hasText(dto.getAction()), AuditLogDO::getAction, dto.getAction())
                .orderByDesc(AuditLogDO::getGmtCreate);
        auditLogMapper.selectPage(page, w);
        return page.convert(this::toVo);
    }

    private AuditLogVO toVo(AuditLogDO d) {
        AuditLogVO v = new AuditLogVO();
        v.setId(d.getId());
        v.setOperator(d.getOperator());
        v.setModule(d.getModule());
        v.setAction(d.getAction());
        v.setTargetType(d.getTargetType());
        v.setTargetId(d.getTargetId());
        v.setDetail(d.getDetail());
        v.setIpAddress(d.getIpAddress());
        v.setGmtCreate(d.getGmtCreate());
        return v;
    }
}
