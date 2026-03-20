package com.permission.biz.manager.impl;

import com.permission.biz.manager.AuthzManager;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.service.cache.AuthzCacheService;
import com.permission.service.model.AuthzResult;
import com.permission.biz.dto.authz.AuthzBatchCheckDTO;
import com.permission.biz.dto.authz.AuthzCheckDTO;
import com.permission.biz.vo.authz.AuthzBatchResultVO;
import com.permission.biz.vo.authz.AuthzResultVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 鉴权 Manager 实现
 */
@Component
@RequiredArgsConstructor
public class AuthzManagerImpl implements AuthzManager {

    private final AuthzCacheService authzCacheService;

    @Override
    public AuthzResultVO check(AuthzCheckDTO dto) {
        if (!StringUtils.hasText(dto.getUserId()) || !StringUtils.hasText(dto.getPermissionCode())) {
            throw new BusinessException(ErrorCode.AUTHZ_PARAM_INVALID);
        }

        AuthzResult result = authzCacheService.checkWithCache(
                dto.getUserId(), dto.getPermissionCode(), dto.getProjectId());

        AuthzResultVO vo = new AuthzResultVO();
        vo.setAllowed(result.isAllowed());
        vo.setReason(Boolean.TRUE.equals(dto.getExplain()) ? result.getReason() : null);
        return vo;
    }

    @Override
    public AuthzBatchResultVO checkBatch(AuthzBatchCheckDTO dto) {
        if (!StringUtils.hasText(dto.getUserId()) || dto.getPermissionCodes() == null
                || dto.getPermissionCodes().isEmpty()) {
            throw new BusinessException(ErrorCode.AUTHZ_PARAM_INVALID);
        }

        // 批量鉴权：使用批量缓存方法减少Redis IO次数
        Map<String, AuthzResult> resultMap = authzCacheService.checkBatchWithCache(
                dto.getUserId(), dto.getPermissionCodes(), dto.getProjectId());

        Map<String, Boolean> results = dto.getPermissionCodes().stream()
                .collect(Collectors.toMap(
                        code -> code,
                        code -> resultMap.getOrDefault(code, AuthzResult.denied("未知错误")).isAllowed(),
                        (v1, v2) -> v1,
                        LinkedHashMap::new
                ));

        AuthzBatchResultVO vo = new AuthzBatchResultVO();
        vo.setResults(results);
        return vo;
    }
}

