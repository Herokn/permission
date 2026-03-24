package com.permission.biz.manager;

import com.permission.biz.dto.organization.AssignOrgMembersDTO;
import com.permission.biz.dto.organization.AssignOrgRolesDTO;
import com.permission.biz.dto.organization.CreateOrganizationDTO;
import com.permission.biz.dto.organization.UpdateOrganizationDTO;
import com.permission.biz.vo.organization.OrgMemberVO;
import com.permission.biz.vo.organization.OrgRoleVO;
import com.permission.biz.vo.organization.OrganizationTreeVO;
import com.permission.biz.vo.organization.OrganizationVO;

import java.util.List;

/**
 * 组织 Manager 接口
 */
public interface OrganizationManager {

    /**
     * 创建组织
     */
    OrganizationVO createOrganization(CreateOrganizationDTO dto);

    /**
     * 编辑组织
     */
    OrganizationVO updateOrganization(Long id, UpdateOrganizationDTO dto);

    /**
     * 删除组织
     */
    void deleteOrganization(Long id);

    /**
     * 查询组织详情
     */
    OrganizationVO getOrganizationDetail(Long id);

    /**
     * 查询组织树
     */
    List<OrganizationTreeVO> getOrganizationTree();

    /**
     * 为组织分配角色
     */
    void assignRoles(Long orgId, AssignOrgRolesDTO dto);

    /**
     * 移除组织角色
     */
    void removeRole(Long orgId, Long roleId);

    /**
     * 查询组织角色列表
     */
    List<OrgRoleVO> listOrgRoles(Long orgId);

    /**
     * 将用户加入组织
     */
    void addMembers(Long orgId, AssignOrgMembersDTO dto);

    /**
     * 将用户移出组织
     */
    void removeMember(Long orgId, String userId);

    /**
     * 查询组织成员列表
     */
    List<OrgMemberVO> listOrgMembers(Long orgId);
}

