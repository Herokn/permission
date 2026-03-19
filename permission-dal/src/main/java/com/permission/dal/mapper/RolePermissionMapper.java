package com.permission.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.permission.dal.dataobject.RolePermissionDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface RolePermissionMapper extends BaseMapper<RolePermissionDO> {
    
    int insertBatchSomeColumn(List<RolePermissionDO> list);
}

