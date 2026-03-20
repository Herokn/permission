package com.permission.user.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.permission.user.dal.dataobject.UserDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户Mapper
 */
@Mapper
public interface UserMapper extends BaseMapper<UserDO> {
}
