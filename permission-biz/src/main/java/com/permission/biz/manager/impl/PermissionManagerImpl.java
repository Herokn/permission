package com.permission.biz.manager.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.biz.manager.PermissionManager;
import com.permission.common.annotation.AuditLog;
import com.permission.common.constant.PermissionConstant;
import com.permission.common.enums.CommonStatusEnum;
import com.permission.common.enums.PermissionTypeEnum;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.common.result.PageResult;
import com.permission.dal.dataobject.PermissionDO;
import com.permission.service.PermissionService;
import com.permission.service.RolePermissionService;
import com.permission.service.UserPermissionService;
import com.permission.biz.converter.PermissionWebConverter;
import com.permission.biz.dto.permission.CreatePermissionDTO;
import com.permission.biz.dto.permission.UpdatePermissionDTO;
import com.permission.biz.vo.permission.PermissionTreeVO;
import com.permission.biz.vo.permission.PermissionVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 权限点 Manager 实现
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionManagerImpl implements PermissionManager {

    private final PermissionService permissionService;
    private final RolePermissionService rolePermissionService;
    private final UserPermissionService userPermissionService;

    @Override
    @AuditLog(module = "PERMISSION", action = "CREATE", targetType = "permission")
    public PermissionVO createPermission(CreatePermissionDTO dto) {
        // 1. type 枚举校验
        PermissionTypeEnum.fromCode(dto.getType());

        // 2. code 唯一性校验
        PermissionDO existing = permissionService.getByCode(dto.getCode());
        if (existing != null) {
            throw new BusinessException(ErrorCode.PERMISSION_CODE_EXISTS, dto.getCode());
        }

        // 3. parentCode 校验
        if (StringUtils.hasText(dto.getParentCode())) {
            PermissionDO parent = permissionService.getByCode(dto.getParentCode());
            if (parent == null) {
                throw new BusinessException(ErrorCode.PERMISSION_PARENT_NOT_FOUND, dto.getParentCode());
            }
        }

        // 4. 创建 DO 并保存（catch 并发重复）
        PermissionDO permissionDO = PermissionWebConverter.INSTANCE.toDO(dto);
        permissionDO.setStatus(CommonStatusEnum.ENABLED.getCode());
        try {
            permissionService.save(permissionDO);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ErrorCode.PERMISSION_CODE_EXISTS, dto.getCode());
        }

        return PermissionWebConverter.INSTANCE.toVO(permissionDO);
    }

    @Override
    @AuditLog(module = "PERMISSION", action = "UPDATE", targetType = "permission")
    public PermissionVO updatePermission(Long id, UpdatePermissionDTO dto) {
        // 1. 查询现有记录
        PermissionDO permissionDO = permissionService.getById(id);
        if (permissionDO == null) {
            throw new BusinessException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        // 2. type 枚举校验
        if (StringUtils.hasText(dto.getType())) {
            PermissionTypeEnum.fromCode(dto.getType());
        }

        // 3. parentCode 变更校验
        if (dto.getParentCode() != null && !Objects.equals(dto.getParentCode(), permissionDO.getParentCode())) {
            if (StringUtils.hasText(dto.getParentCode())) {
                PermissionDO parent = permissionService.getByCode(dto.getParentCode());
                if (parent == null) {
                    throw new BusinessException(ErrorCode.PERMISSION_PARENT_NOT_FOUND, dto.getParentCode());
                }
                // 循环引用检测
                checkCircularReference(permissionDO.getCode(), dto.getParentCode());
            }
        }

        // 4. status 枚举校验
        if (StringUtils.hasText(dto.getStatus())) {
            CommonStatusEnum.fromCode(dto.getStatus());
        }

        // 5. 更新非 null 字段
        if (dto.getName() != null) permissionDO.setName(dto.getName());
        if (dto.getSystemCode() != null) permissionDO.setSystemCode(dto.getSystemCode());
        if (dto.getType() != null) permissionDO.setType(dto.getType());
        if (dto.getParentCode() != null) permissionDO.setParentCode(dto.getParentCode());
        if (dto.getSortOrder() != null) permissionDO.setSortOrder(dto.getSortOrder());
        if (dto.getStatus() != null) permissionDO.setStatus(dto.getStatus());
        if (dto.getDescription() != null) permissionDO.setDescription(dto.getDescription());

        permissionService.updateById(permissionDO);
        return PermissionWebConverter.INSTANCE.toVO(permissionDO);
    }

    @Override
    @AuditLog(module = "PERMISSION", action = "DELETE", targetType = "permission")
    public void deletePermission(Long id) {
        // 1. 查询现有记录
        PermissionDO permissionDO = permissionService.getById(id);
        if (permissionDO == null) {
            throw new BusinessException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        // 2. 子节点检查
        long childCount = permissionService.countByParentCode(permissionDO.getCode());
        if (childCount > 0) {
            throw new BusinessException(ErrorCode.PERMISSION_HAS_CHILDREN);
        }

        // 3. 角色引用检查
        long roleRefCount = rolePermissionService.countByPermissionCode(permissionDO.getCode());
        if (roleRefCount > 0) {
            throw new BusinessException(ErrorCode.PERMISSION_USED_BY_ROLE);
        }

        // 4. 用户授权引用检查
        long userRefCount = userPermissionService.countByPermissionCode(permissionDO.getCode());
        if (userRefCount > 0) {
            throw new BusinessException(ErrorCode.PERMISSION_USED_BY_USER);
        }

        // 5. 逻辑删除
        permissionService.removeById(id);
    }

    @Override
    public PageResult<PermissionVO> listPermissions(String code, String name, String type, String status,
                                                     Integer pageNum, Integer pageSize) {
        pageNum = (pageNum == null || pageNum < 1) ? PermissionConstant.DEFAULT_PAGE_NUM : pageNum;
        pageSize = (pageSize == null || pageSize < 1) ? PermissionConstant.DEFAULT_PAGE_SIZE : pageSize;
        pageSize = Math.min(pageSize, PermissionConstant.MAX_PAGE_SIZE);

        Page<PermissionDO> page = new Page<>(pageNum, pageSize);
        IPage<PermissionDO> result = permissionService.page(page, code, name, type, status);

        List<PermissionVO> voList = PermissionWebConverter.INSTANCE.toVOList(result.getRecords());
        return PageResult.of(result.getTotal(), pageNum, pageSize, voList);
    }

    @Override
    public PageResult<PermissionVO> listPermissionsWithProjectFilter(String code, String name, String type, String status,
                                                                      String projectId, Integer pageNum, Integer pageSize) {
        pageNum = (pageNum == null || pageNum < 1) ? PermissionConstant.DEFAULT_PAGE_NUM : pageNum;
        pageSize = (pageSize == null || pageSize < 1) ? PermissionConstant.DEFAULT_PAGE_SIZE : pageSize;
        pageSize = Math.min(pageSize, PermissionConstant.MAX_PAGE_SIZE);

        Page<PermissionDO> page = new Page<>(pageNum, pageSize);
        IPage<PermissionDO> result = permissionService.pageWithProjectFilter(page, code, name, type, status, projectId);

        List<PermissionVO> voList = PermissionWebConverter.INSTANCE.toVOList(result.getRecords());
        return PageResult.of(result.getTotal(), pageNum, pageSize, voList);
    }

    @Override
    public List<PermissionTreeVO> getPermissionTree() {
        List<PermissionDO> allPermissions = permissionService.listByStatus(CommonStatusEnum.ENABLED.getCode());
        return buildTree(allPermissions);
    }

    @Override
    public List<PermissionTreeVO> getPermissionTreeWithProjectFilter(String projectId) {
        List<PermissionDO> permissions = permissionService.listAllWithProjectFilter(projectId);
        // 只保留启用状态的权限点
        permissions = permissions.stream()
                .filter(p -> CommonStatusEnum.ENABLED.getCode().equals(p.getStatus()))
                .collect(Collectors.toList());
        return buildTree(permissions);
    }

    @Override
    public List<PermissionVO> listAllPermissions() {
        List<PermissionDO> allPermissions = permissionService.listByStatus(CommonStatusEnum.ENABLED.getCode());
        return PermissionWebConverter.INSTANCE.toVOList(allPermissions);
    }

    @Override
    public List<PermissionVO> listAllPermissionsWithProjectFilter(String projectId) {
        List<PermissionDO> permissions = permissionService.listAllWithProjectFilter(projectId);
        // 只保留启用状态的权限点
        permissions = permissions.stream()
                .filter(p -> CommonStatusEnum.ENABLED.getCode().equals(p.getStatus()))
                .collect(Collectors.toList());
        return PermissionWebConverter.INSTANCE.toVOList(permissions);
    }

    /**
     * 循环引用检测
     */
    private void checkCircularReference(String currentCode, String newParentCode) {
        if (currentCode.equals(newParentCode)) {
            throw new BusinessException(ErrorCode.PERMISSION_CIRCULAR_REF);
        }
        String cursor = newParentCode;
        Set<String> visited = new HashSet<>();
        while (StringUtils.hasText(cursor)) {
            if (visited.contains(cursor)) break;
            visited.add(cursor);
            PermissionDO parent = permissionService.getByCode(cursor);
            if (parent == null) break;
            if (parent.getCode().equals(currentCode)) {
                throw new BusinessException(ErrorCode.PERMISSION_CIRCULAR_REF);
            }
            cursor = parent.getParentCode();
        }
    }

    /**
     * 构建权限树
     */
    private List<PermissionTreeVO> buildTree(List<PermissionDO> permissions) {
        Map<String, List<PermissionDO>> parentMap = permissions.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getParentCode() == null ? "" : p.getParentCode()));

        return buildChildren("", parentMap);
    }

    private List<PermissionTreeVO> buildChildren(String parentCode, Map<String, List<PermissionDO>> parentMap) {
        List<PermissionDO> children = parentMap.getOrDefault(parentCode, Collections.emptyList());
        return children.stream()
                .sorted(Comparator.comparingInt(p -> p.getSortOrder() == null ? 0 : p.getSortOrder()))
                .map(p -> {
                    PermissionTreeVO vo = new PermissionTreeVO();
                    vo.setId(p.getId());
                    vo.setCode(p.getCode());
                    vo.setName(p.getName());
                    vo.setType(p.getType());
                    vo.setStatus(p.getStatus());
                    vo.setSortOrder(p.getSortOrder());
                    vo.setChildren(buildChildren(p.getCode(), parentMap));
                    return vo;
                })
                .collect(Collectors.toList());
    }
}

