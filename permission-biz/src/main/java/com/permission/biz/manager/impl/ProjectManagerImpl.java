package com.permission.biz.manager.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.biz.dto.project.CreateProjectDTO;
import com.permission.biz.dto.project.ProjectQueryDTO;
import com.permission.biz.dto.project.UpdateProjectDTO;
import com.permission.biz.manager.ProjectManager;
import com.permission.biz.vo.project.ProjectVO;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.enums.RoleDomainEnum;
import com.permission.common.enums.RoleScopeEnum;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.common.result.PageResult;
import com.permission.dal.dataobject.ProjectDO;
import com.permission.dal.dataobject.ProjectDO.SystemModule;
import com.permission.dal.dataobject.RoleDO;
import com.permission.service.ProjectService;
import com.permission.service.RoleService;
import com.permission.service.UserRoleService;
import com.permission.service.UserPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProjectManagerImpl implements ProjectManager {

    private final ProjectService projectService;
    private final RoleService roleService;
    private final UserRoleService userRoleService;
    private final UserPermissionService userPermissionService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProjectVO createProject(CreateProjectDTO dto) {
        if (projectService.existsByCode(dto.getCode())) {
            throw new BusinessException(ErrorCode.PROJECT_CODE_EXISTS, dto.getCode());
        }

        ProjectDO project = new ProjectDO();
        project.setCode(dto.getCode());
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(CommonStatusEnum.ENABLED.getCode());
        project.setSystems(toSystemModules(dto.getSystems()));

        projectService.save(project);
        log.info("创建项目成功: code={}, name={}", project.getCode(), project.getName());

        // 自动创建项目管理员角色
        createProjectAdminRole(project.getCode());

        return toVO(project);
    }

    /**
     * 为项目自动创建项目管理员角色
     */
    private void createProjectAdminRole(String projectCode) {
        String roleCode = projectCode + "_ADMIN";
        String roleName = projectCode + "项目管理员";

        // 检查是否已存在
        if (roleService.existsByCode(roleCode)) {
            log.info("项目管理员角色已存在: {}", roleCode);
            return;
        }

        RoleDO role = new RoleDO();
        role.setCode(roleCode);
        role.setName(roleName);
        role.setProjectId(projectCode);
        role.setRoleScope(RoleScopeEnum.PROJECT.getCode());
        role.setRoleDomain(RoleDomainEnum.APP.getCode());
        role.setStatus(CommonStatusEnum.ENABLED.getCode());
        role.setDescription("项目的管理员角色，拥有该项目所有权限");

        roleService.save(role);
        log.info("创建项目管理员角色成功: code={}, project={}", roleCode, projectCode);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProjectVO updateProject(Long id, UpdateProjectDTO dto) {
        ProjectDO project = projectService.getById(id);
        if (project == null) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
        }

        if (StringUtils.hasText(dto.getName())) {
            project.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }
        if (dto.getSystems() != null) {
            project.setSystems(toSystemModulesFromUpdate(dto.getSystems()));
        }
        if (StringUtils.hasText(dto.getStatus())) {
            project.setStatus(dto.getStatus());
        }

        projectService.updateById(project);
        log.info("更新项目成功: id={}", id);

        return toVO(project);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProject(Long id) {
        ProjectDO project = projectService.getById(id);
        if (project == null) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
        }

        long roleCount = userRoleService.countByProjectId(project.getCode());
        if (roleCount > 0) {
            throw new BusinessException(ErrorCode.PROJECT_USED_BY_USER_ROLE);
        }

        long permCount = userPermissionService.countByProjectId(project.getCode());
        if (permCount > 0) {
            throw new BusinessException(ErrorCode.PROJECT_USED_BY_USER_PERMISSION);
        }

        projectService.removeById(id);
        log.info("删除项目成功: id={}, code={}", id, project.getCode());
    }

    @Override
    public PageResult<ProjectVO> listProjects(ProjectQueryDTO dto) {
        Page<ProjectDO> page = new Page<>(dto.getPageNum(), dto.getPageSize());

        LambdaQueryWrapper<ProjectDO> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(dto.getCode())) {
            wrapper.like(ProjectDO::getCode, dto.getCode());
        }
        if (StringUtils.hasText(dto.getName())) {
            wrapper.like(ProjectDO::getName, dto.getName());
        }
        if (StringUtils.hasText(dto.getStatus())) {
            wrapper.eq(ProjectDO::getStatus, dto.getStatus());
        }
        wrapper.orderByDesc(ProjectDO::getGmtCreate);

        Page<ProjectDO> result = projectService.page(page, wrapper);

        List<ProjectVO> list = result.getRecords().stream()
                .map(this::toVO)
                .collect(Collectors.toList());

        return PageResult.of(result.getTotal(), (int) result.getCurrent(), (int) result.getSize(), list);
    }

    @Override
    public List<ProjectVO> listAllEnabled() {
        return projectService.listByStatus(CommonStatusEnum.ENABLED.getCode()).stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    private ProjectVO toVO(ProjectDO project) {
        ProjectVO vo = new ProjectVO();
        vo.setId(project.getId());
        vo.setCode(project.getCode());
        vo.setName(project.getName());
        vo.setDescription(project.getDescription());
        vo.setStatus(project.getStatus());
        vo.setGmtCreate(project.getGmtCreate());
        vo.setGmtModified(project.getGmtModified());
        vo.setSystems(toSystemModuleVOs(project.getSystems()));
        return vo;
    }

    private List<SystemModule> toSystemModules(List<CreateProjectDTO.SystemModuleDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream().map(dto -> {
            SystemModule module = new SystemModule();
            module.setCode(dto.getCode());
            module.setName(dto.getName());
            return module;
        }).collect(Collectors.toList());
    }

    private List<SystemModule> toSystemModulesFromUpdate(List<UpdateProjectDTO.SystemModuleDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream().map(dto -> {
            SystemModule module = new SystemModule();
            module.setCode(dto.getCode());
            module.setName(dto.getName());
            return module;
        }).collect(Collectors.toList());
    }

    private List<ProjectVO.SystemModuleVO> toSystemModuleVOs(List<SystemModule> modules) {
        if (modules == null || modules.isEmpty()) {
            return Collections.emptyList();
        }
        return modules.stream().map(m -> {
            ProjectVO.SystemModuleVO vo = new ProjectVO.SystemModuleVO();
            vo.setCode(m.getCode());
            vo.setName(m.getName());
            return vo;
        }).collect(Collectors.toList());
    }
}
