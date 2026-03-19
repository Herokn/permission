package com.permission.biz.converter;

import com.permission.dal.dataobject.RoleDO;
import com.permission.biz.dto.role.CreateRoleDTO;
import com.permission.biz.vo.role.RoleVO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

/**
 * 角色 MapStruct 转换器
 */
@Mapper
public interface RoleWebConverter {

    RoleWebConverter INSTANCE = Mappers.getMapper(RoleWebConverter.class);

    RoleVO toVO(RoleDO roleDO);

    List<RoleVO> toVOList(List<RoleDO> list);

    RoleDO toDO(CreateRoleDTO dto);
}

