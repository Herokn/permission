package com.permission.biz.vo.authz;

import lombok.Data;

/**
 * 鉴权结果 VO
 */
@Data
public class AuthzResultVO {

    private boolean allowed;

    /** explain=true 时返回鉴权原因 */
    private String reason;
}

