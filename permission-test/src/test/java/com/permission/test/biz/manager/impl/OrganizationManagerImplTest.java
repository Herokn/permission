package com.permission.test.biz.manager.impl;

import com.permission.biz.dto.organization.AssignOrgMembersDTO;
import com.permission.biz.dto.organization.AssignOrgRolesDTO;
import com.permission.biz.dto.organization.CreateOrganizationDTO;
import com.permission.biz.manager.impl.OrganizationManagerImpl;
import com.permission.biz.vo.organization.OrganizationTreeVO;
import com.permission.biz.vo.organization.OrganizationVO;
import com.permission.common.exception.BusinessException;
import com.permission.dal.dataobject.OrganizationDO;
import com.permission.dal.dataobject.RoleDO;
import com.permission.service.OrgRoleService;
import com.permission.service.OrganizationService;
import com.permission.service.RoleService;
import com.permission.service.UserOrgService;
import com.permission.service.cache.AuthzCacheService;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 组织 Manager 单元测试
 */
@DisplayName("组织 Manager 单元测试")
class OrganizationManagerImplTest extends BaseTest {

    @Mock
    private OrganizationService organizationService;
    @Mock
    private OrgRoleService orgRoleService;
    @Mock
    private UserOrgService userOrgService;
    @Mock
    private RoleService roleService;
    @Mock
    private AuthzCacheService authzCacheService;

    @InjectMocks
    private OrganizationManagerImpl organizationManager;

    private OrganizationDO rootOrg;
    private RoleDO enabledRole;

    @BeforeEach
    public void setUp() {
        super.setUp();

        rootOrg = new OrganizationDO();
        rootOrg.setId(1L);
        rootOrg.setCode("ROOT");
        rootOrg.setName("总公司");
        rootOrg.setParentId(null);
        rootOrg.setStatus("ENABLED");

        enabledRole = new RoleDO();
        enabledRole.setId(1L);
        enabledRole.setCode("ADMIN");
        enabledRole.setStatus("ENABLED");
    }

    // [单测用例]测试场景：创建组织-编码已存在应抛异常
    @Test
    @DisplayName("创建组织-编码已存在应抛异常")
    void testCreateOrganization_WhenCodeExists_ShouldThrow() {
        // Arrange
        CreateOrganizationDTO dto = new CreateOrganizationDTO();
        dto.setCode("ROOT");
        dto.setName("重复组织");

        when(organizationService.getByCode("ROOT")).thenReturn(rootOrg);

        // Act & Assert
        assertThrows(BusinessException.class, () -> organizationManager.createOrganization(dto));
    }

    // [单测用例]测试场景：创建组织-父组织不存在应抛异常
    @Test
    @DisplayName("创建组织-父组织不存在应抛异常")
    void testCreateOrganization_WhenParentNotFound_ShouldThrow() {
        // Arrange
        CreateOrganizationDTO dto = new CreateOrganizationDTO();
        dto.setCode("NEW_ORG");
        dto.setName("新组织");
        dto.setParentId(999L);

        when(organizationService.getByCode("NEW_ORG")).thenReturn(null);
        when(organizationService.getById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessException.class, () -> organizationManager.createOrganization(dto));
    }

    // [单测用例]测试场景：创建组织-正常创建应成功
    @Test
    @DisplayName("创建组织-正常创建应成功")
    void testCreateOrganization_WhenValid_ShouldSucceed() {
        // Arrange
        CreateOrganizationDTO dto = new CreateOrganizationDTO();
        dto.setCode("TECH_DEPT");
        dto.setName("技术部");
        dto.setParentId(1L);

        when(organizationService.getByCode("TECH_DEPT")).thenReturn(null);
        when(organizationService.getById(1L)).thenReturn(rootOrg);

        // Act
        OrganizationVO result = organizationManager.createOrganization(dto);

        // Assert
        assertNotNull(result);
        assertEquals("TECH_DEPT", result.getCode());
        verify(organizationService).save(any(OrganizationDO.class));
    }

    // [单测用例]测试场景：删除组织-存在子组织应抛异常
    @Test
    @DisplayName("删除组织-存在子组织应抛异常")
    void testDeleteOrganization_WhenHasChildren_ShouldThrow() {
        // Arrange
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(organizationService.countByParentId(1L)).thenReturn(2L);

        // Act & Assert
        assertThrows(BusinessException.class, () -> organizationManager.deleteOrganization(1L));
    }

    // [单测用例]测试场景：删除组织-存在关联角色应抛异常
    @Test
    @DisplayName("删除组织-存在关联角色应抛异常")
    void testDeleteOrganization_WhenHasRoles_ShouldThrow() {
        // Arrange
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(organizationService.countByParentId(1L)).thenReturn(0L);
        when(orgRoleService.countByOrgId(1L)).thenReturn(1L);

        // Act & Assert
        assertThrows(BusinessException.class, () -> organizationManager.deleteOrganization(1L));
    }

    // [单测用例]测试场景：删除组织-存在成员应抛异常
    @Test
    @DisplayName("删除组织-存在成员应抛异常")
    void testDeleteOrganization_WhenHasMembers_ShouldThrow() {
        // Arrange
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(organizationService.countByParentId(1L)).thenReturn(0L);
        when(orgRoleService.countByOrgId(1L)).thenReturn(0L);
        when(userOrgService.countByOrgId(1L)).thenReturn(3L);

        // Act & Assert
        assertThrows(BusinessException.class, () -> organizationManager.deleteOrganization(1L));
    }

    // [单测用例]测试场景：查询组织树-应返回树形结构
    @Test
    @DisplayName("查询组织树-应返回树形结构")
    void testGetOrganizationTree_ShouldReturnTree() {
        // Arrange
        OrganizationDO child = new OrganizationDO();
        child.setId(2L);
        child.setCode("TECH_DEPT");
        child.setName("技术部");
        child.setParentId(1L);
        child.setStatus("ENABLED");
        child.setSortOrder(1);

        when(organizationService.listAll()).thenReturn(List.of(rootOrg, child));

        // Act
        List<OrganizationTreeVO> tree = organizationManager.getOrganizationTree();

        // Assert
        assertEquals(1, tree.size());
        assertEquals("ROOT", tree.get(0).getCode());
        assertEquals(1, tree.get(0).getChildren().size());
        assertEquals("TECH_DEPT", tree.get(0).getChildren().get(0).getCode());
    }

    // [单测用例]测试场景：为组织分配角色-角色不存在应抛异常
    @Test
    @DisplayName("为组织分配角色-角色不存在应抛异常")
    void testAssignRoles_WhenRoleNotFound_ShouldThrow() {
        // Arrange
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(roleService.getById(999L)).thenReturn(null);

        AssignOrgRolesDTO dto = new AssignOrgRolesDTO();
        dto.setRoleIds(List.of(999L));

        // Act & Assert
        assertThrows(BusinessException.class, () -> organizationManager.assignRoles(1L, dto));
    }

    // [单测用例]测试场景：为组织分配角色-正常分配
    @Test
    @DisplayName("为组织分配角色-正常分配")
    void testAssignRoles_WhenValid_ShouldSucceed() {
        // Arrange
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(roleService.getById(1L)).thenReturn(enabledRole);
        when(orgRoleService.exists(1L, 1L)).thenReturn(false);
        when(userOrgService.listByOrgId(1L)).thenReturn(Collections.emptyList());

        AssignOrgRolesDTO dto = new AssignOrgRolesDTO();
        dto.setRoleIds(List.of(1L));

        // Act
        organizationManager.assignRoles(1L, dto);

        // Assert
        verify(orgRoleService).save(any());
    }

    // [单测用例]测试场景：将用户加入组织-幂等处理
    @Test
    @DisplayName("将用户加入组织-幂等处理")
    void testAddMembers_WhenAlreadyExists_ShouldBeIdempotent() {
        // Arrange
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(userOrgService.exists("user1", 1L)).thenReturn(true);

        AssignOrgMembersDTO dto = new AssignOrgMembersDTO();
        dto.setUserIds(List.of("user1"));

        // Act
        organizationManager.addMembers(1L, dto);

        // Assert
        verify(userOrgService, never()).save(any());
        verify(authzCacheService).evictUser("user1");
    }
}

