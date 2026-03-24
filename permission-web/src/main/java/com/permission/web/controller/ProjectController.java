package com.permission.web.controller;

import com.permission.biz.dto.project.CreateProjectDTO;
import com.permission.biz.dto.project.ProjectQueryDTO;
import com.permission.biz.dto.project.UpdateProjectDTO;
import com.permission.biz.manager.ProjectManager;
import com.permission.biz.vo.project.ProjectVO;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import com.permission.common.result.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "项目管理", description = "项目 CRUD 接口")
public class ProjectController {

    private final ProjectManager projectManager;

    @PostMapping
    @Operation(summary = "新增项目")
    @RequirePermission("PERMISSION_CENTER_PROJECT_CREATE")
    public ApiResponse<ProjectVO> create(@Valid @RequestBody CreateProjectDTO dto) {
        return ApiResponse.success(projectManager.createProject(dto));
    }

    @PostMapping("/{id}/update")
    @Operation(summary = "更新项目")
    @RequirePermission("PERMISSION_CENTER_PROJECT_EDIT")
    public ApiResponse<ProjectVO> update(@PathVariable Long id, @Valid @RequestBody UpdateProjectDTO dto) {
        return ApiResponse.success(projectManager.updateProject(id, dto));
    }

    @PostMapping("/{id}/delete")
    @Operation(summary = "删除项目")
    @RequirePermission("PERMISSION_CENTER_PROJECT_DELETE")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        projectManager.deleteProject(id);
        return ApiResponse.success();
    }

    @GetMapping
    @Operation(summary = "查询项目列表")
    @RequirePermission("PERMISSION_CENTER_PROJECT_VIEW")
    public ApiResponse<PageResult<ProjectVO>> list(ProjectQueryDTO dto) {
        return ApiResponse.success(projectManager.listProjects(dto));
    }

    @GetMapping("/all")
    @Operation(summary = "查询所有启用项目")
    @RequirePermission("PERMISSION_CENTER_PROJECT_VIEW")
    public ApiResponse<List<ProjectVO>> listAll() {
        return ApiResponse.success(projectManager.listAllEnabled());
    }
}
