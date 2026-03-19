package com.permission.web.controller;

import com.permission.biz.dto.organization.AssignOrgMembersDTO;
import com.permission.biz.dto.organization.AssignOrgRolesDTO;
import com.permission.biz.dto.organization.CreateOrganizationDTO;
import com.permission.biz.dto.organization.UpdateOrganizationDTO;
import com.permission.biz.manager.OrganizationManager;
import com.permission.biz.vo.organization.*;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 组织管理 Controller
 */
@Tag(name = "组织管理")
@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationManager organizationManager;

    @Operation(summary = "创建组织")
    @PostMapping
    @RequirePermission("ORG_CREATE")
    public ApiResponse<OrganizationVO> create(@Valid @RequestBody CreateOrganizationDTO dto) {
        return ApiResponse.success(organizationManager.createOrganization(dto));
    }

    @Operation(summary = "编辑组织")
    @PutMapping("/{id}")
    @RequirePermission("ORG_UPDATE")
    public ApiResponse<OrganizationVO> update(@PathVariable Long id,
                                               @Valid @RequestBody UpdateOrganizationDTO dto) {
        return ApiResponse.success(organizationManager.updateOrganization(id, dto));
    }

    @Operation(summary = "删除组织")
    @DeleteMapping("/{id}")
    @RequirePermission("ORG_DELETE")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        organizationManager.deleteOrganization(id);
        return ApiResponse.success();
    }

    @Operation(summary = "查询组织详情")
    @GetMapping("/{id}")
    @RequirePermission("ORG_VIEW")
    public ApiResponse<OrganizationVO> detail(@PathVariable Long id) {
        return ApiResponse.success(organizationManager.getOrganizationDetail(id));
    }

    @Operation(summary = "查询组织树")
    @GetMapping("/tree")
    @RequirePermission("ORG_VIEW")
    public ApiResponse<List<OrganizationTreeVO>> tree() {
        return ApiResponse.success(organizationManager.getOrganizationTree());
    }

    @Operation(summary = "为组织分配角色")
    @PostMapping("/{orgId}/roles")
    @RequirePermission("ORG_ROLE_ASSIGN")
    public ApiResponse<Void> assignRoles(@PathVariable Long orgId,
                                          @Valid @RequestBody AssignOrgRolesDTO dto) {
        organizationManager.assignRoles(orgId, dto);
        return ApiResponse.success();
    }

    @Operation(summary = "移除组织角色")
    @DeleteMapping("/{orgId}/roles/{roleId}")
    @RequirePermission("ORG_ROLE_ASSIGN")
    public ApiResponse<Void> removeRole(@PathVariable Long orgId, @PathVariable Long roleId) {
        organizationManager.removeRole(orgId, roleId);
        return ApiResponse.success();
    }

    @Operation(summary = "查询组织角色列表")
    @GetMapping("/{orgId}/roles")
    @RequirePermission("ORG_VIEW")
    public ApiResponse<List<OrgRoleVO>> listRoles(@PathVariable Long orgId) {
        return ApiResponse.success(organizationManager.listOrgRoles(orgId));
    }

    @Operation(summary = "将用户加入组织")
    @PostMapping("/{orgId}/members")
    @RequirePermission("ORG_MEMBER_MANAGE")
    public ApiResponse<Void> addMembers(@PathVariable Long orgId,
                                         @Valid @RequestBody AssignOrgMembersDTO dto) {
        organizationManager.addMembers(orgId, dto);
        return ApiResponse.success();
    }

    @Operation(summary = "将用户移出组织")
    @DeleteMapping("/{orgId}/members/{userId}")
    @RequirePermission("ORG_MEMBER_MANAGE")
    public ApiResponse<Void> removeMember(@PathVariable Long orgId, @PathVariable String userId) {
        organizationManager.removeMember(orgId, userId);
        return ApiResponse.success();
    }

    @Operation(summary = "查询组织成员列表")
    @GetMapping("/{orgId}/members")
    @RequirePermission("ORG_VIEW")
    public ApiResponse<List<OrgMemberVO>> listMembers(@PathVariable Long orgId) {
        return ApiResponse.success(organizationManager.listOrgMembers(orgId));
    }
}

