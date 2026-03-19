package com.permission.biz.converter;

import com.permission.dal.dataobject.PermissionDO;
import com.permission.biz.dto.permission.CreatePermissionDTO;
import com.permission.biz.vo.permission.PermissionVO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

/**
 * 权限点 MapStruct 转换器
 */
@Mapper
public interface PermissionWebConverter {

    PermissionWebConverter INSTANCE = Mappers.getMapper(PermissionWebConverter.class);

    PermissionVO toVO(PermissionDO permissionDO);

    List<PermissionVO> toVOList(List<PermissionDO> list);

    PermissionDO toDO(CreatePermissionDTO dto);
}

