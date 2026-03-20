package com.permission.user.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.permission.user.dal.dataobject.UserOrgRelDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户组织关系Mapper
 */
@Mapper
public interface UserOrgRelMapper extends BaseMapper<UserOrgRelDO> {
}
