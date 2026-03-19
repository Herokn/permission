package com.permission.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.dal.dataobject.ProjectDO;

import java.util.List;

public interface ProjectService {

    ProjectDO getByCode(String code);

    ProjectDO getById(Long id);

    void save(ProjectDO project);

    void updateById(ProjectDO project);

    void removeById(Long id);

    Page<ProjectDO> page(Page<ProjectDO> page, LambdaQueryWrapper<ProjectDO> wrapper);

    List<ProjectDO> listByStatus(String status);

    boolean existsByCode(String code);
}
