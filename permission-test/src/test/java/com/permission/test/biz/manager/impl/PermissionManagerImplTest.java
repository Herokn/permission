package com.permission.test.biz.manager.impl;

import com.permission.biz.manager.impl.PermissionManagerImpl;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.exception.BusinessException;
import com.permission.dal.dataobject.PermissionDO;
import com.permission.service.PermissionService;
import com.permission.service.RolePermissionService;
import com.permission.service.UserPermissionService;
import com.permission.biz.dto.permission.CreatePermissionDTO;
import com.permission.biz.dto.permission.UpdatePermissionDTO;
import com.permission.biz.vo.permission.PermissionVO;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 权限点 Manager 单元测试
 */
@DisplayName("权限点 Manager 单元测试")
class PermissionManagerImplTest extends BaseTest {

    @Mock
    private PermissionService permissionService;
    @Mock
    private RolePermissionService rolePermissionService;
    @Mock
    private UserPermissionService userPermissionService;

    @InjectMocks
    private PermissionManagerImpl permissionManager;

    private PermissionDO existingPermission;

    @BeforeEach
    public void setUp() {
        super.setUp();

        existingPermission = new PermissionDO();
        existingPermission.setId(1L);
        existingPermission.setCode("ORDER_VIEW");
        existingPermission.setName("查看订单");
        existingPermission.setType("ACTION");
        existingPermission.setStatus(CommonStatusEnum.ENABLED.getCode());
        existingPermission.setParentCode("ORDER_LIST");
    }

    // [单测用例]测试场景：新增权限点-编码已存在时应抛异常
    @Test
    @DisplayName("新增权限点-编码已存在时应抛异常")
    void testCreatePermission_WhenCodeExists_ShouldThrowException() {
        // Arrange
        CreatePermissionDTO dto = new CreatePermissionDTO();
        dto.setCode("ORDER_VIEW");
        dto.setName("查看订单");
        dto.setType("ACTION");

        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(existingPermission);

        // Act & Assert
        assertThrows(BusinessException.class, () -> permissionManager.createPermission(dto));
    }

    // [单测用例]测试场景：新增权限点-父权限不存在时应抛异常
    @Test
    @DisplayName("新增权限点-父权限不存在时应抛异常")
    void testCreatePermission_WhenParentNotFound_ShouldThrowException() {
        // Arrange
        CreatePermissionDTO dto = new CreatePermissionDTO();
        dto.setCode("NEW_PERM");
        dto.setName("新权限");
        dto.setType("ACTION");
        dto.setParentCode("NOT_EXIST_PARENT");

        when(permissionService.getByCode("NEW_PERM")).thenReturn(null);
        when(permissionService.getByCode("NOT_EXIST_PARENT")).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> permissionManager.createPermission(dto));
    }

    // [单测用例]测试场景：删除权限点-存在子节点时应抛异常
    @Test
    @DisplayName("删除权限点-存在子节点时应抛异常")
    void testDeletePermission_WhenHasChildren_ShouldThrowException() {
        // Arrange
        when(permissionService.getById(1L)).thenReturn(existingPermission);
        when(permissionService.countByParentCode("ORDER_VIEW")).thenReturn(3L);

        // Act & Assert
        assertThrows(BusinessException.class, () -> permissionManager.deletePermission(1L));
    }

    // [单测用例]测试场景：删除权限点-被角色引用时应抛异常
    @Test
    @DisplayName("删除权限点-被角色引用时应抛异常")
    void testDeletePermission_WhenUsedByRole_ShouldThrowException() {
        // Arrange
        when(permissionService.getById(1L)).thenReturn(existingPermission);
        when(permissionService.countByParentCode("ORDER_VIEW")).thenReturn(0L);
        when(rolePermissionService.countByPermissionCode("ORDER_VIEW")).thenReturn(2L);

        // Act & Assert
        assertThrows(BusinessException.class, () -> permissionManager.deletePermission(1L));
    }

    // [单测用例]测试场景：删除权限点-被用户直接授权引用时应抛异常
    @Test
    @DisplayName("删除权限点-被用户直接授权引用时应抛异常")
    void testDeletePermission_WhenUsedByUser_ShouldThrowException() {
        // Arrange
        when(permissionService.getById(1L)).thenReturn(existingPermission);
        when(permissionService.countByParentCode("ORDER_VIEW")).thenReturn(0L);
        when(rolePermissionService.countByPermissionCode("ORDER_VIEW")).thenReturn(0L);
        when(userPermissionService.countByPermissionCode("ORDER_VIEW")).thenReturn(1L);

        // Act & Assert
        assertThrows(BusinessException.class, () -> permissionManager.deletePermission(1L));
    }

    // [单测用例]测试场景：删除权限点-无引用时应成功删除
    @Test
    @DisplayName("删除权限点-无引用时应成功删除")
    void testDeletePermission_WhenNoReference_ShouldSucceed() {
        // Arrange
        when(permissionService.getById(1L)).thenReturn(existingPermission);
        when(permissionService.countByParentCode("ORDER_VIEW")).thenReturn(0L);
        when(rolePermissionService.countByPermissionCode("ORDER_VIEW")).thenReturn(0L);
        when(userPermissionService.countByPermissionCode("ORDER_VIEW")).thenReturn(0L);

        // Act
        permissionManager.deletePermission(1L);

        // Assert
        verify(permissionService).removeById(1L);
    }

    // [单测用例]测试场景：删除权限点-权限不存在时应抛异常
    @Test
    @DisplayName("删除权限点-权限不存在时应抛异常")
    void testDeletePermission_WhenNotFound_ShouldThrowException() {
        // Arrange
        when(permissionService.getById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> permissionManager.deletePermission(999L));
    }

    // [单测用例]测试场景：更新权限点-权限不存在时应抛异常
    @Test
    @DisplayName("更新权限点-权限不存在时应抛异常")
    void testUpdatePermission_WhenNotFound_ShouldThrowException() {
        // Arrange
        UpdatePermissionDTO dto = new UpdatePermissionDTO();
        dto.setName("新名称");
        when(permissionService.getById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> permissionManager.updatePermission(999L, dto));
    }

    // [单测用例]测试场景：新增权限点-成功创建
    @Test
    @DisplayName("新增权限点-成功创建")
    void testCreatePermission_Success() {
        // Arrange
        CreatePermissionDTO dto = new CreatePermissionDTO();
        dto.setCode("NEW_PERM");
        dto.setName("新权限点");
        dto.setType("ACTION");
        dto.setDescription("测试权限点");

        when(permissionService.getByCode("NEW_PERM")).thenReturn(null);
        doAnswer(invocation -> {
            PermissionDO saved = invocation.getArgument(0);
            saved.setId(100L);
            return null;
        }).when(permissionService).save(any(PermissionDO.class));

        // Act
        PermissionVO result = permissionManager.createPermission(dto);

        // Assert
        assertNotNull(result);
        assertEquals("NEW_PERM", result.getCode());
        assertEquals("新权限点", result.getName());
        assertEquals("ACTION", result.getType());
        verify(permissionService).save(any(PermissionDO.class));
    }

    // [单测用例]测试场景：新增权限点-带父权限成功创建
    @Test
    @DisplayName("新增权限点-带父权限成功创建")
    void testCreatePermission_WithParent_Success() {
        // Arrange
        CreatePermissionDTO dto = new CreatePermissionDTO();
        dto.setCode("ORDER_CREATE");
        dto.setName("创建订单");
        dto.setType("ACTION");
        dto.setParentCode("ORDER_VIEW");

        PermissionDO parentPermission = new PermissionDO();
        parentPermission.setId(1L);
        parentPermission.setCode("ORDER_VIEW");
        parentPermission.setName("查看订单");
        parentPermission.setStatus(CommonStatusEnum.ENABLED.getCode());

        when(permissionService.getByCode("ORDER_CREATE")).thenReturn(null);
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(parentPermission);
        doNothing().when(permissionService).save(any(PermissionDO.class));

        // Act
        PermissionVO result = permissionManager.createPermission(dto);

        // Assert
        assertNotNull(result);
        assertEquals("ORDER_CREATE", result.getCode());
        assertEquals("ORDER_VIEW", result.getParentCode());
    }

    // [单测用例]测试场景：更新权限点-成功更新
    @Test
    @DisplayName("更新权限点-成功更新")
    void testUpdatePermission_Success() {
        // Arrange
        UpdatePermissionDTO dto = new UpdatePermissionDTO();
        dto.setName("更新后的名称");
        dto.setDescription("更新后的描述");

        when(permissionService.getById(1L)).thenReturn(existingPermission);
        doNothing().when(permissionService).updateById(any(PermissionDO.class));

        // Act
        PermissionVO result = permissionManager.updatePermission(1L, dto);

        // Assert
        assertNotNull(result);
        assertEquals("更新后的名称", result.getName());
        verify(permissionService).updateById(any(PermissionDO.class));
    }
}

