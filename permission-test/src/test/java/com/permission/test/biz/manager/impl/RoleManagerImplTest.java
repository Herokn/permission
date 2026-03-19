package com.permission.test.biz.manager.impl;

import com.permission.biz.manager.impl.RoleManagerImpl;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.exception.BusinessException;
import com.permission.dal.dataobject.PermissionDO;
import com.permission.dal.dataobject.RoleDO;
import com.permission.dal.dataobject.RolePermissionDO;
import com.permission.service.PermissionService;
import com.permission.service.RolePermissionService;
import com.permission.service.RoleService;
import com.permission.service.UserRoleService;
import com.permission.service.cache.AuthzCacheService;
import com.permission.biz.dto.role.AssignRolePermissionsDTO;
import com.permission.biz.dto.role.CreateRoleDTO;
import com.permission.biz.vo.role.RoleVO;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 角色 Manager 单元测试
 */
@DisplayName("角色 Manager 单元测试")
class RoleManagerImplTest extends BaseTest {

    @Mock
    private RoleService roleService;
    @Mock
    private RolePermissionService rolePermissionService;
    @Mock
    private PermissionService permissionService;
    @Mock
    private UserRoleService userRoleService;
    @Mock
    private AuthzCacheService authzCacheService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private RoleManagerImpl roleManager;

    private RoleDO existingRole;

    @BeforeEach
    public void setUp() {
        super.setUp();

        existingRole = new RoleDO();
        existingRole.setId(1L);
        existingRole.setCode("ADMIN");
        existingRole.setName("管理员");
        existingRole.setRoleScope("GLOBAL");
        existingRole.setRoleDomain("APP");
        existingRole.setStatus(CommonStatusEnum.ENABLED.getCode());
    }

    // [单测用例]测试场景：新增角色-编码已存在时应抛异常
    @Test
    @DisplayName("新增角色-编码已存在时应抛异常")
    void testCreateRole_WhenCodeExists_ShouldThrowException() {
        // Arrange
        CreateRoleDTO dto = new CreateRoleDTO();
        dto.setCode("ADMIN");
        dto.setName("管理员");
        dto.setRoleScope("GLOBAL");
        dto.setRoleDomain("APP");

        when(roleService.getByCode("ADMIN")).thenReturn(existingRole);

        // Act & Assert
        assertThrows(BusinessException.class, () -> roleManager.createRole(dto));
    }

    // [单测用例]测试场景：删除角色-被用户引用时应抛异常
    @Test
    @DisplayName("删除角色-被用户引用时应抛异常")
    void testDeleteRole_WhenUsedByUser_ShouldThrowException() {
        // Arrange
        when(roleService.getById(1L)).thenReturn(existingRole);
        when(userRoleService.countByRoleId(1L)).thenReturn(5L);

        // Act & Assert
        assertThrows(BusinessException.class, () -> roleManager.deleteRole(1L));
    }

    // [单测用例]测试场景：删除角色-无引用时应成功
    @Test
    @DisplayName("删除角色-无引用时应成功")
    void testDeleteRole_WhenNoReference_ShouldSucceed() {
        // Arrange
        when(roleService.getById(1L)).thenReturn(existingRole);
        when(userRoleService.countByRoleId(1L)).thenReturn(0L);

        // Act
        roleManager.deleteRole(1L);

        // Assert
        verify(rolePermissionService).removeByRoleId(1L);
        verify(roleService).removeById(1L);
    }

    // [单测用例]测试场景：删除角色-角色不存在时应抛异常
    @Test
    @DisplayName("删除角色-角色不存在时应抛异常")
    void testDeleteRole_WhenNotFound_ShouldThrowException() {
        // Arrange
        when(roleService.getById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> roleManager.deleteRole(999L));
    }

    // [单测用例]测试场景：分配权限-角色不存在时应抛异常
    @Test
    @DisplayName("分配权限-角色不存在时应抛异常")
    void testAssignPermissions_WhenRoleNotFound_ShouldThrowException() {
        // Arrange
        AssignRolePermissionsDTO dto = new AssignRolePermissionsDTO();
        dto.setPermissionCodes(List.of("ORDER_VIEW"));
        when(roleService.getById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> roleManager.assignPermissions(999L, dto));
    }

    // [单测用例]测试场景：分配权限-权限编码无效时应抛异常
    @Test
    @DisplayName("分配权限-权限编码无效时应抛异常")
    void testAssignPermissions_WhenPermissionNotFound_ShouldThrowException() {
        // Arrange
        AssignRolePermissionsDTO dto = new AssignRolePermissionsDTO();
        dto.setPermissionCodes(List.of("NOT_EXIST"));
        when(roleService.getById(1L)).thenReturn(existingRole);
        // 批量查询返回空列表
        when(permissionService.listByCodes(List.of("NOT_EXIST"))).thenReturn(List.of());

        // Act & Assert
        assertThrows(BusinessException.class, () -> roleManager.assignPermissions(1L, dto));
    }

    // [单测用例]测试场景：分配权限-权限编码有效时应成功
    @Test
    @DisplayName("分配权限-权限编码有效时应成功")
    void testAssignPermissions_WhenValid_ShouldSucceed() {
        // Arrange
        AssignRolePermissionsDTO dto = new AssignRolePermissionsDTO();
        dto.setPermissionCodes(List.of("ORDER_VIEW", "ORDER_CREATE"));

        PermissionDO perm1 = new PermissionDO();
        perm1.setCode("ORDER_VIEW");
        PermissionDO perm2 = new PermissionDO();
        perm2.setCode("ORDER_CREATE");

        when(roleService.getById(1L)).thenReturn(existingRole);
        // 使用批量查询
        when(permissionService.listByCodes(List.of("ORDER_VIEW", "ORDER_CREATE"))).thenReturn(List.of(perm1, perm2));

        // Act
        roleManager.assignPermissions(1L, dto);

        // Assert
        verify(rolePermissionService).replacePermissions(1L, List.of("ORDER_VIEW", "ORDER_CREATE"));
    }

    // [单测用例]测试场景：查询角色详情-角色不存在时应抛异常
    @Test
    @DisplayName("查询角色详情-角色不存在时应抛异常")
    void testGetRoleDetail_WhenNotFound_ShouldThrowException() {
        // Arrange
        when(roleService.getById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> roleManager.getRoleDetail(999L));
    }

    // [单测用例]测试场景：查询角色详情-角色存在时应返回含权限列表
    @Test
    @DisplayName("查询角色详情-应返回含权限列表")
    void testGetRoleDetail_WhenExists_ShouldReturnWithPermissions() {
        // Arrange
        when(roleService.getById(1L)).thenReturn(existingRole);
        RolePermissionDO rp1 = new RolePermissionDO();
        rp1.setPermissionCode("ORDER_VIEW");
        RolePermissionDO rp2 = new RolePermissionDO();
        rp2.setPermissionCode("ORDER_CREATE");
        when(rolePermissionService.listByRoleId(1L)).thenReturn(List.of(rp1, rp2));

        // Act
        RoleVO result = roleManager.getRoleDetail(1L);

        // Assert
        assertNotNull(result);
        assertEquals("ADMIN", result.getCode());
        assertEquals(2, result.getPermissionCodes().size());
        assertTrue(result.getPermissionCodes().contains("ORDER_VIEW"));
    }
}

