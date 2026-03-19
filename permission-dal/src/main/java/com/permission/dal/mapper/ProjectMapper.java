package com.permission.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.permission.dal.dataobject.ProjectDO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProjectMapper extends BaseMapper<ProjectDO> {
}
