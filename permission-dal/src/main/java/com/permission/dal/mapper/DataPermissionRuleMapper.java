package com.permission.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.permission.dal.dataobject.DataPermissionRuleDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 数据权限规则 Mapper
 */
@Mapper
public interface DataPermissionRuleMapper extends BaseMapper<DataPermissionRuleDO> {
}
