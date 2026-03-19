package com.permission.biz.manager;

import com.permission.biz.dto.project.CreateProjectDTO;
import com.permission.biz.dto.project.ProjectQueryDTO;
import com.permission.biz.dto.project.UpdateProjectDTO;
import com.permission.biz.vo.project.ProjectVO;
import com.permission.common.result.PageResult;

import java.util.List;

public interface ProjectManager {

    ProjectVO createProject(CreateProjectDTO dto);

    ProjectVO updateProject(Long id, UpdateProjectDTO dto);

    void deleteProject(Long id);

    PageResult<ProjectVO> listProjects(ProjectQueryDTO dto);

    List<ProjectVO> listAllEnabled();
}
