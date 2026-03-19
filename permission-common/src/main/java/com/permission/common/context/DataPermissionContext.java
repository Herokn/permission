package com.permission.common.context;

import com.permission.common.enums.DataScopeTypeEnum;
import lombok.Data;

import java.util.List;
import java.util.Set;

/**
 * 数据权限上下文
 * 在请求处理过程中持有当前用户的数据权限信息
 */
@Data
public class DataPermissionContext {

    /**
     * 资源类型
     */
    private String resourceType;

    /**
     * 范围类型
     */
    private DataScopeTypeEnum scopeType;

    /**
     * 范围值（如部门ID列表）
     */
    private Set<String> scopeValues;

    /**
     * 用户ID（用于 SELF 范围）
     */
    private String userId;

    /**
     * 用户所属组织ID列表（用于 DEPARTMENT 范围）
     */
    private List<Long> userOrgIds;

    /**
     * 是否有权限访问指定数据
     */
    public boolean canAccess(String dataOwnerId, Long dataOrgId) {
        if (scopeType == null) {
            return false;
        }

        switch (scopeType) {
            case ALL:
                return true;
            case SELF:
                return userId != null && userId.equals(dataOwnerId);
            case DEPARTMENT:
                return dataOrgId != null && userOrgIds != null && userOrgIds.contains(dataOrgId);
            case CUSTOM:
                // 自定义范围，根据 scopeValues 判断
                return dataOrgId != null && scopeValues != null 
                    && scopeValues.contains(String.valueOf(dataOrgId));
            default:
                return false;
        }
    }
}
