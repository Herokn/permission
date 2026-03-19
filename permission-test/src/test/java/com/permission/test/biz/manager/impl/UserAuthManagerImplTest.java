package com.permission.test.biz.manager.impl;

import com.permission.biz.manager.impl.UserAuthManagerImpl;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.enums.PermissionEffectEnum;
import com.permission.common.exception.BusinessException;
import com.permission.dal.dataobject.*;
import com.permission.service.*;
import com.permission.service.cache.AuthzCacheService;
import com.permission.biz.dto.userauth.AssignUserRoleDTO;
import com.permission.biz.dto.userauth.GrantUserPermissionDTO;
import com.permission.biz.vo.userauth.UserAuthDetailVO;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * 用户授权 Manager 单元测试
 */
@DisplayName("用户授权 Manager 单元测试")
class UserAuthManagerImplTest extends BaseTest {

    @Mock
    private UserRoleService userRoleService;
    @Mock
    private UserPermissionService userPermissionService;
    @Mock
    private RoleService roleService;
    @Mock
    private PermissionService permissionService;
    @Mock
    private ProjectService projectService;
    @Mock
    private AuthzCacheService authzCacheService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private UserAuthManagerImpl userAuthManager;

    private RoleDO enabledRole;
    private RoleDO disabledRole;
    private PermissionDO enabledPermission;

    @BeforeEach
    public void setUp() {
        super.setUp();

        enabledRole = new RoleDO();
        enabledRole.setId(1L);
        enabledRole.setCode("ADMIN");
        enabledRole.setRoleScope("GLOBAL");
        enabledRole.setStatus(CommonStatusEnum.ENABLED.getCode());

        disabledRole = new RoleDO();
        disabledRole.setId(2L);
        disabledRole.setCode("VIEWER");
        disabledRole.setRoleScope("PROJECT");
        disabledRole.setStatus(CommonStatusEnum.DISABLED.getCode());

        enabledPermission = new PermissionDO();
        enabledPermission.setId(1L);
        enabledPermission.setCode("ORDER_VIEW");
        enabledPermission.setName("查看订单");
    }

    // [单测用例]测试场景：分配角色-角色不存在时应抛异常
    @Test
    @DisplayName("分配角色-角色不存在时应抛异常")
    void testAssignRole_WhenRoleNotFound_ShouldThrowException() {
        // Arrange
        AssignUserRoleDTO dto = new AssignUserRoleDTO();
        dto.setUserId("user1");
        dto.setRoleId(999L);
        when(roleService.getById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> userAuthManager.assignRole(dto));
    }

    // [单测用例]测试场景：分配角色-角色已禁用时应抛异常
    @Test
    @DisplayName("分配角色-角色已禁用时应抛异常")
    void testAssignRole_WhenRoleDisabled_ShouldThrowException() {
        // Arrange
        AssignUserRoleDTO dto = new AssignUserRoleDTO();
        dto.setUserId("user1");
        dto.setRoleId(2L);
        when(roleService.getById(2L)).thenReturn(disabledRole);

        // Act & Assert
        assertThrows(BusinessException.class, () -> userAuthManager.assignRole(dto));
    }

    // [单测用例]测试场景：分配角色-全局角色指定项目时应抛异常
    @Test
    @DisplayName("分配角色-全局角色指定项目时应抛异常")
    void testAssignRole_WhenGlobalRoleWithProject_ShouldThrowException() {
        // Arrange
        AssignUserRoleDTO dto = new AssignUserRoleDTO();
        dto.setUserId("user1");
        dto.setRoleId(1L);
        dto.setProjectId("project1");
        when(roleService.getById(1L)).thenReturn(enabledRole);

        // Act & Assert
        assertThrows(BusinessException.class, () -> userAuthManager.assignRole(dto));
    }

    // [单测用例]测试场景：分配角色-正常分配应成功
    @Test
    @DisplayName("分配角色-正常分配应成功")
    void testAssignRole_WhenValid_ShouldSucceed() {
        // Arrange
        AssignUserRoleDTO dto = new AssignUserRoleDTO();
        dto.setUserId("user1");
        dto.setRoleId(1L);
        dto.setProjectId(null);
        when(roleService.getById(1L)).thenReturn(enabledRole);

        // Act
        userAuthManager.assignRole(dto);

        // Assert
        verify(userRoleService).assign("user1", 1L, null);
    }

    // [单测用例]测试场景：授予权限-权限不存在时应抛异常
    @Test
    @DisplayName("授予权限-权限不存在时应抛异常")
    void testGrantPermission_WhenPermissionNotFound_ShouldThrowException() {
        // Arrange
        GrantUserPermissionDTO dto = new GrantUserPermissionDTO();
        dto.setUserId("user1");
        dto.setPermissionCode("NOT_EXIST");
        dto.setEffect("ALLOW");
        when(permissionService.getByCode("NOT_EXIST")).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> userAuthManager.grantPermission(dto));
    }

    // [单测用例]测试场景：授予权限-正常授予应成功
    @Test
    @DisplayName("授予权限-正常授予应成功")
    void testGrantPermission_WhenValid_ShouldSucceed() {
        // Arrange
        GrantUserPermissionDTO dto = new GrantUserPermissionDTO();
        dto.setUserId("user1");
        dto.setPermissionCode("ORDER_VIEW");
        dto.setEffect("ALLOW");
        dto.setProjectId(null);
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);

        // Act
        userAuthManager.grantPermission(dto);

        // Assert
        verify(userPermissionService).grant("user1", "ORDER_VIEW", "ALLOW", null);
    }

    // [单测用例]测试场景：查询用户授权详情-应返回角色和直接权限
    @Test
    @DisplayName("查询用户授权详情-应返回角色和直接权限")
    void testGetUserAuthDetail_ShouldReturnRolesAndPermissions() {
        // Arrange
        UserRoleDO ur = new UserRoleDO();
        ur.setUserId("user1");
        ur.setRoleId(1L);
        ur.setProjectId(null);

        UserPermissionDO up = new UserPermissionDO();
        up.setUserId("user1");
        up.setPermissionCode("ORDER_VIEW");
        up.setEffect("ALLOW");
        up.setProjectId(null);

        when(userRoleService.listByUserId("user1")).thenReturn(List.of(ur));
        when(roleService.listByIds(List.of(1L))).thenReturn(List.of(enabledRole));
        when(userPermissionService.listByUserId("user1")).thenReturn(List.of(up));
        when(permissionService.listByCodes(List.of("ORDER_VIEW"))).thenReturn(List.of(enabledPermission));

        // Act
        UserAuthDetailVO result = userAuthManager.getUserAuthDetail("user1");

        // Assert
        assertNotNull(result);
        assertEquals("user1", result.getUserId());
        assertEquals(1, result.getRoles().size());
        assertEquals("ADMIN", result.getRoles().get(0).getRoleCode());
        assertEquals(1, result.getDirectPermissions().size());
        assertEquals("ORDER_VIEW", result.getDirectPermissions().get(0).getPermissionCode());
    }

    // [单测用例]测试场景：移除角色-幂等移除应成功
    @Test
    @DisplayName("移除角色-幂等移除应成功")
    void testRevokeRole_ShouldCallServiceIdempotently() {
        // Arrange
        AssignUserRoleDTO dto = new AssignUserRoleDTO();
        dto.setUserId("user1");
        dto.setRoleId(1L);
        dto.setProjectId(null);

        // Act
        userAuthManager.revokeRole(dto);

        // Assert
        verify(userRoleService).revoke("user1", 1L, null);
    }

    // [单测用例]测试场景：分配角色-项目不存在时应抛异常
    @Test
    @DisplayName("分配角色-项目不存在时应抛异常")
    void testAssignRole_WhenProjectNotFound_ShouldThrowException() {
        // Arrange
        RoleDO projectRole = new RoleDO();
        projectRole.setId(3L);
        projectRole.setCode("PROJECT_ADMIN");
        projectRole.setRoleScope("PROJECT");
        projectRole.setStatus(CommonStatusEnum.ENABLED.getCode());

        AssignUserRoleDTO dto = new AssignUserRoleDTO();
        dto.setUserId("user1");
        dto.setRoleId(3L);
        dto.setProjectId("NON_EXISTENT_PROJECT");
        when(roleService.getById(3L)).thenReturn(projectRole);
        when(projectService.getByCode("NON_EXISTENT_PROJECT")).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> userAuthManager.assignRole(dto));
    }

    // [单测用例]测试场景：授予权限-项目不存在时应抛异常
    @Test
    @DisplayName("授予权限-项目不存在时应抛异常")
    void testGrantPermission_WhenProjectNotFound_ShouldThrowException() {
        // Arrange
        GrantUserPermissionDTO dto = new GrantUserPermissionDTO();
        dto.setUserId("user1");
        dto.setPermissionCode("ORDER_VIEW");
        dto.setEffect("ALLOW");
        dto.setProjectId("NON_EXISTENT_PROJECT");
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(projectService.getByCode("NON_EXISTENT_PROJECT")).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> userAuthManager.grantPermission(dto));
    }

    // [单测用例]测试场景：授予权限-项目存在时应成功
    @Test
    @DisplayName("授予权限-项目存在时应成功")
    void testGrantPermission_WhenProjectExists_ShouldSucceed() {
        // Arrange
        ProjectDO project = new ProjectDO();
        project.setId(1L);
        project.setCode("PROJECT_A");
        project.setName("项目A");

        GrantUserPermissionDTO dto = new GrantUserPermissionDTO();
        dto.setUserId("user1");
        dto.setPermissionCode("ORDER_VIEW");
        dto.setEffect("ALLOW");
        dto.setProjectId("PROJECT_A");
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(projectService.getByCode("PROJECT_A")).thenReturn(project);

        // Act
        userAuthManager.grantPermission(dto);

        // Assert
        verify(userPermissionService).grant("user1", "ORDER_VIEW", "ALLOW", "PROJECT_A");
    }
}

