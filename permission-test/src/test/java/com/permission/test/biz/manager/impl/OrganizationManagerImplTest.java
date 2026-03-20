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
        rootOrg.setOrgCode("ROOT");
        rootOrg.setOrgName("总公司");
        rootOrg.setParentId(null);
        rootOrg.setStatus(1);

        enabledRole = new RoleDO();
        enabledRole.setId(1L);
        enabledRole.setCode("ADMIN");
        enabledRole.setStatus("ENABLED");
    }

    @Test
    @DisplayName("创建组织-编码已存在应抛异常")
    void testCreateOrganization_WhenCodeExists_ShouldThrow() {
        CreateOrganizationDTO dto = new CreateOrganizationDTO();
        dto.setOrgCode("ROOT");
        dto.setOrgName("重复组织");

        when(organizationService.getByCode("ROOT")).thenReturn(rootOrg);

        assertThrows(BusinessException.class, () -> organizationManager.createOrganization(dto));
    }

    @Test
    @DisplayName("创建组织-父组织不存在应抛异常")
    void testCreateOrganization_WhenParentNotFound_ShouldThrow() {
        CreateOrganizationDTO dto = new CreateOrganizationDTO();
        dto.setOrgCode("NEW_ORG");
        dto.setOrgName("新组织");
        dto.setParentId(999L);

        when(organizationService.getByCode("NEW_ORG")).thenReturn(null);
        when(organizationService.getById(999L)).thenReturn(null);

        assertThrows(BusinessException.class, () -> organizationManager.createOrganization(dto));
    }

    @Test
    @DisplayName("创建组织-正常创建应成功")
    void testCreateOrganization_WhenValid_ShouldSucceed() {
        CreateOrganizationDTO dto = new CreateOrganizationDTO();
        dto.setOrgCode("TECH_DEPT");
        dto.setOrgName("技术部");
        dto.setParentId(1L);

        when(organizationService.getByCode("TECH_DEPT")).thenReturn(null);
        when(organizationService.getById(1L)).thenReturn(rootOrg);

        OrganizationVO result = organizationManager.createOrganization(dto);

        assertNotNull(result);
        assertEquals("TECH_DEPT", result.getOrgCode());
        verify(organizationService).save(any(OrganizationDO.class));
    }

    @Test
    @DisplayName("删除组织-存在子组织应抛异常")
    void testDeleteOrganization_WhenHasChildren_ShouldThrow() {
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(organizationService.countByParentId(1L)).thenReturn(2L);

        assertThrows(BusinessException.class, () -> organizationManager.deleteOrganization(1L));
    }

    @Test
    @DisplayName("删除组织-存在关联角色应抛异常")
    void testDeleteOrganization_WhenHasRoles_ShouldThrow() {
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(organizationService.countByParentId(1L)).thenReturn(0L);
        when(orgRoleService.countByOrgId(1L)).thenReturn(1L);

        assertThrows(BusinessException.class, () -> organizationManager.deleteOrganization(1L));
    }

    @Test
    @DisplayName("删除组织-存在成员应抛异常")
    void testDeleteOrganization_WhenHasMembers_ShouldThrow() {
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(organizationService.countByParentId(1L)).thenReturn(0L);
        when(orgRoleService.countByOrgId(1L)).thenReturn(0L);
        when(userOrgService.countByOrgId(1L)).thenReturn(3L);

        assertThrows(BusinessException.class, () -> organizationManager.deleteOrganization(1L));
    }

    @Test
    @DisplayName("查询组织树-应返回树形结构")
    void testGetOrganizationTree_ShouldReturnTree() {
        OrganizationDO child = new OrganizationDO();
        child.setId(2L);
        child.setOrgCode("TECH_DEPT");
        child.setOrgName("技术部");
        child.setParentId(1L);
        child.setStatus(1);

        when(organizationService.listAll()).thenReturn(List.of(rootOrg, child));

        List<OrganizationTreeVO> tree = organizationManager.getOrganizationTree();

        assertEquals(1, tree.size());
        assertEquals("ROOT", tree.get(0).getOrgCode());
        assertEquals(1, tree.get(0).getChildren().size());
        assertEquals("TECH_DEPT", tree.get(0).getChildren().get(0).getOrgCode());
    }

    @Test
    @DisplayName("为组织分配角色-角色不存在应抛异常")
    void testAssignRoles_WhenRoleNotFound_ShouldThrow() {
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(roleService.getById(999L)).thenReturn(null);

        AssignOrgRolesDTO dto = new AssignOrgRolesDTO();
        dto.setRoleIds(List.of(999L));

        assertThrows(BusinessException.class, () -> organizationManager.assignRoles(1L, dto));
    }

    @Test
    @DisplayName("为组织分配角色-正常分配")
    void testAssignRoles_WhenValid_ShouldSucceed() {
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(roleService.getById(1L)).thenReturn(enabledRole);
        when(orgRoleService.exists(1L, 1L)).thenReturn(false);
        when(userOrgService.listByOrgId(1L)).thenReturn(Collections.emptyList());

        AssignOrgRolesDTO dto = new AssignOrgRolesDTO();
        dto.setRoleIds(List.of(1L));

        organizationManager.assignRoles(1L, dto);

        verify(orgRoleService).save(any());
    }

    @Test
    @DisplayName("将用户加入组织-幂等处理")
    void testAddMembers_WhenAlreadyExists_ShouldBeIdempotent() {
        when(organizationService.getById(1L)).thenReturn(rootOrg);
        when(userOrgService.exists("user1", 1L)).thenReturn(true);

        AssignOrgMembersDTO dto = new AssignOrgMembersDTO();
        dto.setUserIds(List.of("user1"));

        organizationManager.addMembers(1L, dto);

        verify(userOrgService, never()).save(any());
        verify(authzCacheService).evictUser("user1");
    }
}
