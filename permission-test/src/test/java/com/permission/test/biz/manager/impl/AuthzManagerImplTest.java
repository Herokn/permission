package com.permission.test.biz.manager.impl;

import com.permission.biz.manager.impl.AuthzManagerImpl;
import com.permission.common.exception.BusinessException;
import com.permission.service.cache.AuthzCacheService;
import com.permission.service.model.AuthzResult;
import com.permission.biz.dto.authz.AuthzBatchCheckDTO;
import com.permission.biz.dto.authz.AuthzCheckDTO;
import com.permission.biz.vo.authz.AuthzBatchResultVO;
import com.permission.biz.vo.authz.AuthzResultVO;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * 鉴权 Manager 单元测试
 */
@DisplayName("鉴权 Manager 单元测试")
class AuthzManagerImplTest extends BaseTest {

    @Mock
    private AuthzCacheService authzCacheService;

    @InjectMocks
    private AuthzManagerImpl authzManager;

    // [单测用例]测试场景：单鉴权-参数无效时应抛异常
    @Test
    @DisplayName("单鉴权-参数无效时应抛异常")
    void testCheck_WhenParamInvalid_ShouldThrowException() {
        // Arrange
        AuthzCheckDTO dto = new AuthzCheckDTO();
        dto.setUserId("");
        dto.setPermissionCode("ORDER_VIEW");

        // Act & Assert
        assertThrows(BusinessException.class, () -> authzManager.check(dto));
    }

    // [单测用例]测试场景：单鉴权-explain=false 时不返回 reason
    @Test
    @DisplayName("单鉴权-explain=false 时不返回 reason")
    void testCheck_WhenExplainFalse_ShouldNotReturnReason() {
        // Arrange
        AuthzCheckDTO dto = new AuthzCheckDTO();
        dto.setUserId("user1");
        dto.setPermissionCode("ORDER_VIEW");
        dto.setExplain(false);

        when(authzCacheService.checkWithCache("user1", "ORDER_VIEW", null))
                .thenReturn(AuthzResult.allowed("来自角色 ADMIN"));

        // Act
        AuthzResultVO result = authzManager.check(dto);

        // Assert
        assertTrue(result.isAllowed());
        assertNull(result.getReason());
    }

    // [单测用例]测试场景：单鉴权-explain=true 时返回 reason
    @Test
    @DisplayName("单鉴权-explain=true 时返回 reason")
    void testCheck_WhenExplainTrue_ShouldReturnReason() {
        // Arrange
        AuthzCheckDTO dto = new AuthzCheckDTO();
        dto.setUserId("user1");
        dto.setPermissionCode("ORDER_VIEW");
        dto.setExplain(true);

        when(authzCacheService.checkWithCache("user1", "ORDER_VIEW", null))
                .thenReturn(AuthzResult.allowed("来自角色 ADMIN"));

        // Act
        AuthzResultVO result = authzManager.check(dto);

        // Assert
        assertTrue(result.isAllowed());
        assertEquals("来自角色 ADMIN", result.getReason());
    }

    // [单测用例]测试场景：批量鉴权-应返回每个权限的鉴权结果
    @Test
    @DisplayName("批量鉴权-应返回每个权限的鉴权结果")
    void testCheckBatch_ShouldReturnResultsForEachPermission() {
        // Arrange
        AuthzBatchCheckDTO dto = new AuthzBatchCheckDTO();
        dto.setUserId("user1");
        dto.setPermissionCodes(List.of("ORDER_VIEW", "ORDER_DELETE"));

        when(authzCacheService.checkWithCache("user1", "ORDER_VIEW", null))
                .thenReturn(AuthzResult.allowed("角色授权"));
        when(authzCacheService.checkWithCache("user1", "ORDER_DELETE", null))
                .thenReturn(AuthzResult.denied("默认拒绝"));

        // Act
        AuthzBatchResultVO result = authzManager.checkBatch(dto);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getResults().size());
        assertTrue(result.getResults().get("ORDER_VIEW"));
        assertFalse(result.getResults().get("ORDER_DELETE"));
    }

    // [单测用例]测试场景：批量鉴权-参数无效时应抛异常
    @Test
    @DisplayName("批量鉴权-参数无效时应抛异常")
    void testCheckBatch_WhenParamInvalid_ShouldThrowException() {
        // Arrange
        AuthzBatchCheckDTO dto = new AuthzBatchCheckDTO();
        dto.setUserId("");
        dto.setPermissionCodes(List.of("ORDER_VIEW"));

        // Act & Assert
        assertThrows(BusinessException.class, () -> authzManager.checkBatch(dto));
    }
}

