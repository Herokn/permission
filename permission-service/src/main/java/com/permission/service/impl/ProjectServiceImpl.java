package com.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.dal.dataobject.ProjectDO;
import com.permission.dal.mapper.ProjectMapper;
import com.permission.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectMapper;

    @Override
    public ProjectDO getByCode(String code) {
        return projectMapper.selectOne(new LambdaQueryWrapper<ProjectDO>()
                .eq(ProjectDO::getCode, code));
    }

    @Override
    public ProjectDO getById(Long id) {
        return projectMapper.selectById(id);
    }

    @Override
    public void save(ProjectDO project) {
        projectMapper.insert(project);
    }

    @Override
    public void updateById(ProjectDO project) {
        projectMapper.updateById(project);
    }

    @Override
    public void removeById(Long id) {
        projectMapper.deleteById(id);
    }

    @Override
    public Page<ProjectDO> page(Page<ProjectDO> page, LambdaQueryWrapper<ProjectDO> wrapper) {
        return projectMapper.selectPage(page, wrapper);
    }

    @Override
    public List<ProjectDO> listByStatus(String status) {
        return projectMapper.selectList(new LambdaQueryWrapper<ProjectDO>()
                .eq(ProjectDO::getStatus, status)
                .last("ORDER BY CASE code WHEN 'UC' THEN 0 WHEN 'PC' THEN 1 ELSE 99 END, id ASC"));
    }

    @Override
    public boolean existsByCode(String code) {
        return projectMapper.selectCount(new LambdaQueryWrapper<ProjectDO>()
                .eq(ProjectDO::getCode, code)) > 0;
    }
}
