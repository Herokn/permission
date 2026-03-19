package com.permission.biz.vo.authz;

import lombok.Data;

import java.util.Map;

/**
 * 批量鉴权结果 VO
 */
@Data
public class AuthzBatchResultVO {

    /** permissionCode → allowed */
    private Map<String, Boolean> results;
}

