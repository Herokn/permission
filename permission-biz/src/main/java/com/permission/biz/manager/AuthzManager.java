package com.permission.biz.manager;

import com.permission.biz.dto.authz.AuthzBatchCheckDTO;
import com.permission.biz.dto.authz.AuthzCheckDTO;
import com.permission.biz.vo.authz.AuthzBatchResultVO;
import com.permission.biz.vo.authz.AuthzResultVO;

/**
 * 鉴权 Manager 接口
 */
public interface AuthzManager {

    AuthzResultVO check(AuthzCheckDTO dto);

    AuthzBatchResultVO checkBatch(AuthzBatchCheckDTO dto);
}

