package com.permission.test.service.impl;

import com.permission.common.config.PermissionConfig;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.dal.dataobject.*;
import com.permission.service.*;
import com.permission.service.impl.AuthzServiceImpl;
import com.permission.service.model.AuthzResult;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * 鉴权 Service 单元测试
 */
@DisplayName("鉴权 Service 单元测试")
class AuthzServiceImplTest extends BaseTest {

    @Mock
    private PermissionService permissionService;
    @Mock
    private UserPermissionService userPermissionService;
    @Mock
    private UserRoleService userRoleService;
    @Mock
    private RoleService roleService;
    @Mock
    private RolePermissionService rolePermissionService;
    @Mock
    private UserOrgService userOrgService;
    @Mock
    private OrgRoleService orgRoleService;
    @Mock
    private OrganizationService organizationService;
    @Mock
    private PermissionConfig permissionConfig;

    @InjectMocks
    private AuthzServiceImpl authzService;

    private PermissionDO enabledPermission;
    private PermissionDO disabledPermission;
    private RoleDO enabledRole;
    private UserRoleDO userRole;

    @BeforeEach
    public void setUp() {
        super.setUp();

        // 配置默认值（使用 lenient 因为不是所有测试都需要调用此方法）
        lenient().when(permissionConfig.getOrgMaxDepth()).thenReturn(20);

        enabledPermission = new PermissionDO();
        enabledPermission.setId(1L);
        enabledPermission.setCode("ORDER_VIEW");
        enabledPermission.setStatus(CommonStatusEnum.ENABLED.getCode());

        disabledPermission = new PermissionDO();
        disabledPermission.setId(2L);
        disabledPermission.setCode("ORDER_DELETE");
        disabledPermission.setStatus(CommonStatusEnum.DISABLED.getCode());

        enabledRole = new RoleDO();
        enabledRole.setId(1L);
        enabledRole.setCode("ADMIN");
        enabledRole.setStatus(CommonStatusEnum.ENABLED.getCode());

        userRole = new UserRoleDO();
        userRole.setUserId("user1");
        userRole.setRoleId(1L);
        userRole.setProjectId(null);
    }

    // [单测用例]测试场景：权限点不存在时应拒绝
    @Test
    @DisplayName("权限点不存在时应拒绝")
    void testCheck_WhenPermissionNotFound_ShouldDeny() {
        // Arrange
        when(permissionService.getByCode("NOT_EXIST")).thenReturn(null);

        // Act
        AuthzResult result = authzService.check("user1", "NOT_EXIST", null);

        // Assert
        assertFalse(result.isAllowed());
        assertTrue(result.getReason().contains("无效"));
    }

    // [单测用例]测试场景：权限点已禁用时应拒绝
    @Test
    @DisplayName("权限点已禁用时应拒绝")
    void testCheck_WhenPermissionDisabled_ShouldDeny() {
        // Arrange
        when(permissionService.getByCode("ORDER_DELETE")).thenReturn(disabledPermission);

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_DELETE", null);

        // Assert
        assertFalse(result.isAllowed());
        assertTrue(result.getReason().contains("禁用"));
    }

    // [单测用例]测试场景：用户有直接 DENY 记录时应拒绝（最高优先级）
    @Test
    @DisplayName("用户有直接 DENY 时应拒绝（最高优先级）")
    void testCheck_WhenUserHasDeny_ShouldDeny() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        UserPermissionDO denyRecord = new UserPermissionDO();
        denyRecord.setEffect("DENY");
        denyRecord.setProjectId(null);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(denyRecord);

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertFalse(result.isAllowed());
        assertTrue(result.getReason().contains("DENY"));
    }

    // [单测用例]测试场景：用户有直接 ALLOW 记录时应允许
    @Test
    @DisplayName("用户有直接 ALLOW 时应允许")
    void testCheck_WhenUserHasAllow_ShouldAllow() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(null);
        UserPermissionDO allowRecord = new UserPermissionDO();
        allowRecord.setEffect("ALLOW");
        allowRecord.setProjectId(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", null)).thenReturn(allowRecord);

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertTrue(result.isAllowed());
        assertTrue(result.getReason().contains("ALLOW"));
    }

    // [单测用例]测试场景：通过角色权限授权应允许
    @Test
    @DisplayName("通过角色权限授权应允许")
    void testCheck_WhenRoleHasPermission_ShouldAllow() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userRoleService.listByUserIdAndProjectId("user1", null)).thenReturn(List.of(userRole));
        when(roleService.listByIds(List.of(1L))).thenReturn(List.of(enabledRole));
        when(rolePermissionService.listByRoleIdsAndPermissionCode(Set.of(1L), "ORDER_VIEW")).thenReturn(Set.of("1"));

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertTrue(result.isAllowed());
        assertTrue(result.getReason().contains("ADMIN"));
    }

    // [单测用例]测试场景：无任何授权时默认拒绝
    @Test
    @DisplayName("无任何授权时默认拒绝")
    void testCheck_WhenNoAuthorization_ShouldDenyByDefault() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userRoleService.listByUserIdAndProjectId("user1", null)).thenReturn(Collections.emptyList());
        when(userOrgService.listByUserId("user1")).thenReturn(Collections.emptyList());

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertFalse(result.isAllowed());
        assertTrue(result.getReason().contains("默认拒绝"));
    }

    // [单测用例]测试场景：角色已禁用时不应通过角色授权
    @Test
    @DisplayName("角色已禁用时不应通过角色授权")
    void testCheck_WhenRoleDisabled_ShouldNotGrantByRole() {
        // Arrange
        RoleDO disabledRole = new RoleDO();
        disabledRole.setId(2L);
        disabledRole.setCode("DISABLED_ROLE");
        disabledRole.setStatus(CommonStatusEnum.DISABLED.getCode());

        UserRoleDO disabledUserRole = new UserRoleDO();
        disabledUserRole.setUserId("user1");
        disabledUserRole.setRoleId(2L);

        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userRoleService.listByUserIdAndProjectId("user1", null)).thenReturn(List.of(disabledUserRole));
        when(roleService.listByIds(List.of(2L))).thenReturn(List.of(disabledRole));
        when(userOrgService.listByUserId("user1")).thenReturn(Collections.emptyList());

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertFalse(result.isAllowed());
    }

    // [单测用例]测试场景：DENY 优先级高于 ALLOW（即使有 ALLOW 记录也应拒绝）
    @Test
    @DisplayName("DENY 优先级高于 ALLOW")
    void testCheck_DenyTakesPrecedenceOverAllow() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        UserPermissionDO denyRecord = new UserPermissionDO();
        denyRecord.setEffect("DENY");
        denyRecord.setProjectId(null);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(denyRecord);
        // 注意：findAllow 不应被调用，因为 DENY 先检查

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertFalse(result.isAllowed());
        verify(userPermissionService, never()).findAllow(anyString(), anyString(), any());
    }

    // [单测用例]测试场景：通过组织角色权限授权应允许
    @Test
    @DisplayName("通过组织角色权限授权应允许")
    void testCheck_WhenOrgRoleHasPermission_ShouldAllow() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userRoleService.listByUserIdAndProjectId("user1", null)).thenReturn(Collections.emptyList());

        // 用户属于组织 1
        UserOrgDO userOrg = new UserOrgDO();
        userOrg.setUserId("user1");
        userOrg.setOrgId(1L);
        when(userOrgService.listByUserId("user1")).thenReturn(List.of(userOrg));

        // 组织 1 没有父组织
        OrganizationDO org = new OrganizationDO();
        org.setId(1L);
        org.setOrgName("技术部");
        org.setParentId(null);
        when(organizationService.getById(1L)).thenReturn(org);

        // 组织 1 关联角色 ADMIN
        OrgRoleDO orgRole = new OrgRoleDO();
        orgRole.setOrgId(1L);
        orgRole.setRoleId(1L);
        // 使用 listByOrgIdsAndProjectId 而不是 listByOrgIds
        when(orgRoleService.listByOrgIdsAndProjectId(List.of(1L), null)).thenReturn(List.of(orgRole));
        when(roleService.listByIds(List.of(1L))).thenReturn(List.of(enabledRole));
        when(rolePermissionService.listByRoleIdsAndPermissionCode(Set.of(1L), "ORDER_VIEW")).thenReturn(Set.of("1"));

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertTrue(result.isAllowed());
        assertTrue(result.getReason().contains("组织"));
        assertTrue(result.getReason().contains("技术部"));
    }

    // [单测用例]测试场景：通过父组织角色继承权限应允许
    @Test
    @DisplayName("通过父组织角色继承权限应允许")
    void testCheck_WhenParentOrgRoleHasPermission_ShouldAllow() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userRoleService.listByUserIdAndProjectId("user1", null)).thenReturn(Collections.emptyList());

        // 用户属于子组织 2
        UserOrgDO userOrg = new UserOrgDO();
        userOrg.setUserId("user1");
        userOrg.setOrgId(2L);
        when(userOrgService.listByUserId("user1")).thenReturn(List.of(userOrg));

        // 子组织 2 的父组织是 1
        OrganizationDO childOrg = new OrganizationDO();
        childOrg.setId(2L);
        childOrg.setOrgName("前端组");
        childOrg.setParentId(1L);
        when(organizationService.getById(2L)).thenReturn(childOrg);

        // 父组织 1
        OrganizationDO parentOrg = new OrganizationDO();
        parentOrg.setId(1L);
        parentOrg.setOrgName("技术部");
        parentOrg.setParentId(null);
        when(organizationService.getById(1L)).thenReturn(parentOrg);

        // 子组织 2 没有角色，但父组织 1 有角色 ADMIN
        OrgRoleDO orgRole = new OrgRoleDO();
        orgRole.setOrgId(1L);
        orgRole.setRoleId(1L);
        // 使用 listByOrgIdsAndProjectId 而不是 listByOrgIds，参数匹配任意 List
        when(orgRoleService.listByOrgIdsAndProjectId(anyList(), any())).thenReturn(List.of(orgRole));
        when(roleService.listByIds(List.of(1L))).thenReturn(List.of(enabledRole));
        when(rolePermissionService.listByRoleIdsAndPermissionCode(Set.of(1L), "ORDER_VIEW")).thenReturn(Set.of("1"));

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertTrue(result.isAllowed());
        assertTrue(result.getReason().contains("组织"));
        assertTrue(result.getReason().contains("技术部"));
    }

    // [单测用例]测试场景：projectId 隔离 - 用户在项目A有权限，项目B无权限
    @Test
    @DisplayName("projectId隔离 - 用户在项目A有权限，项目B无权限")
    void testCheck_ProjectIdIsolation_DifferentProjects() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", "PROJECT_A")).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", "PROJECT_A")).thenReturn(null);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", "PROJECT_B")).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", "PROJECT_B")).thenReturn(null);

        UserRoleDO projectARole = new UserRoleDO();
        projectARole.setUserId("user1");
        projectARole.setRoleId(1L);
        projectARole.setProjectId("PROJECT_A");

        when(userRoleService.listByUserIdAndProjectId("user1", "PROJECT_A")).thenReturn(List.of(projectARole));
        when(userRoleService.listByUserIdAndProjectId("user1", "PROJECT_B")).thenReturn(Collections.emptyList());
        when(roleService.listByIds(List.of(1L))).thenReturn(List.of(enabledRole));
        when(rolePermissionService.listByRoleIdsAndPermissionCode(Set.of(1L), "ORDER_VIEW")).thenReturn(Set.of("1"));
        when(userOrgService.listByUserId("user1")).thenReturn(Collections.emptyList());

        // Act - 项目A鉴权
        AuthzResult resultA = authzService.check("user1", "ORDER_VIEW", "PROJECT_A");
        // Act - 项目B鉴权
        AuthzResult resultB = authzService.check("user1", "ORDER_VIEW", "PROJECT_B");

        // Assert
        assertTrue(resultA.isAllowed(), "项目A应该有权限");
        assertFalse(resultB.isAllowed(), "项目B应该无权限");
    }

    // [单测用例]测试场景：projectId 隔离 - 用户直接权限在指定项目生效
    @Test
    @DisplayName("projectId隔离 - 用户直接权限在指定项目生效")
    void testCheck_ProjectIdIsolation_UserDirectPermission() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        
        UserPermissionDO allowInProjectA = new UserPermissionDO();
        allowInProjectA.setEffect("ALLOW");
        allowInProjectA.setProjectId("PROJECT_A");
        
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", "PROJECT_A")).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", "PROJECT_A")).thenReturn(allowInProjectA);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", "PROJECT_B")).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", "PROJECT_B")).thenReturn(null);

        // Act
        AuthzResult resultA = authzService.check("user1", "ORDER_VIEW", "PROJECT_A");
        AuthzResult resultB = authzService.check("user1", "ORDER_VIEW", "PROJECT_B");

        // Assert
        assertTrue(resultA.isAllowed(), "项目A应该有权限（直接授权）");
        assertFalse(resultB.isAllowed(), "项目B应该无权限（未授权）");
    }

    // [单测用例]测试场景：projectId 为 null 时的全局权限
    @Test
    @DisplayName("projectId为null时使用全局权限")
    void testCheck_ProjectIdNull_GlobalPermission() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        
        UserPermissionDO globalAllow = new UserPermissionDO();
        globalAllow.setEffect("ALLOW");
        globalAllow.setProjectId(null);
        
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", null)).thenReturn(null);
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", null)).thenReturn(globalAllow);

        // Act
        AuthzResult result = authzService.check("user1", "ORDER_VIEW", null);

        // Assert
        assertTrue(result.isAllowed(), "全局权限应该生效");
    }

    // [单测用例]测试场景：DENY 在特定项目生效
    @Test
    @DisplayName("projectId隔离 - DENY在特定项目生效")
    void testCheck_ProjectIdIsolation_DenyInSpecificProject() {
        // Arrange
        when(permissionService.getByCode("ORDER_VIEW")).thenReturn(enabledPermission);
        
        UserPermissionDO denyInProjectA = new UserPermissionDO();
        denyInProjectA.setEffect("DENY");
        denyInProjectA.setProjectId("PROJECT_A");
        
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", "PROJECT_A")).thenReturn(denyInProjectA);
        when(userPermissionService.findDeny("user1", "ORDER_VIEW", "PROJECT_B")).thenReturn(null);
        
        UserRoleDO projectBRole = new UserRoleDO();
        projectBRole.setUserId("user1");
        projectBRole.setRoleId(1L);
        projectBRole.setProjectId("PROJECT_B");
        
        when(userPermissionService.findAllow("user1", "ORDER_VIEW", "PROJECT_B")).thenReturn(null);
        when(userRoleService.listByUserIdAndProjectId("user1", "PROJECT_B")).thenReturn(List.of(projectBRole));
        when(roleService.listByIds(List.of(1L))).thenReturn(List.of(enabledRole));
        when(rolePermissionService.listByRoleIdsAndPermissionCode(Set.of(1L), "ORDER_VIEW")).thenReturn(Set.of("1"));

        // Act
        AuthzResult resultA = authzService.check("user1", "ORDER_VIEW", "PROJECT_A");
        AuthzResult resultB = authzService.check("user1", "ORDER_VIEW", "PROJECT_B");

        // Assert
        assertFalse(resultA.isAllowed(), "项目A应该被拒绝（DENY）");
        assertTrue(resultB.isAllowed(), "项目B应该有权限（角色授权）");
    }

    @Test
    @DisplayName("getUserPermissionCodes 合并用户直接 ALLOW（与登录态 permissions 一致）")
    void testGetUserPermissionCodes_IncludesDirectAllow() {
        when(userRoleService.listByUserId("user1")).thenReturn(Collections.emptyList());
        when(userOrgService.listByUserId("user1")).thenReturn(Collections.emptyList());

        UserPermissionDO allow = new UserPermissionDO();
        allow.setUserId("user1");
        allow.setPermissionCode("USER_CENTER_USER_VIEW");
        allow.setEffect("ALLOW");
        allow.setProjectId("UC");
        when(userPermissionService.listByUserId("user1")).thenReturn(List.of(allow));

        Set<String> merged = authzService.getUserPermissionCodes("user1", null);
        assertTrue(merged.contains("USER_CENTER_USER_VIEW"));

        Set<String> inUc = authzService.getUserPermissionCodes("user1", "UC");
        assertTrue(inUc.contains("USER_CENTER_USER_VIEW"));

        Set<String> inPc = authzService.getUserPermissionCodes("user1", "PC");
        assertFalse(inPc.contains("USER_CENTER_USER_VIEW"));
    }
}

