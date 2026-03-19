package com.permission.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.permission.dal.dataobject.LoginSessionDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 登录会话 Mapper
 */
@Mapper
public interface LoginSessionMapper extends BaseMapper<LoginSessionDO> {
}
