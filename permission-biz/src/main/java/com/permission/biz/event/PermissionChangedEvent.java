package com.permission.biz.event;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 权限变更事件
 */
@Data
public class PermissionChangedEvent {

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 变更类型：ROLE_ASSIGN, ROLE_REVOKE, PERMISSION_GRANT, PERMISSION_REVOKE
     */
    private String changeType;

    /**
     * 变更详情
     */
    private String detail;

    /**
     * 操作人
     */
    private String operatorId;

    /**
     * 事件时间
     */
    private LocalDateTime eventTime;

    public static PermissionChangedEvent roleAssign(String userId, Long roleId, String operatorId) {
        PermissionChangedEvent event = new PermissionChangedEvent();
        event.setUserId(userId);
        event.setChangeType("ROLE_ASSIGN");
        event.setDetail("RoleId: " + roleId);
        event.setOperatorId(operatorId);
        event.setEventTime(LocalDateTime.now());
        return event;
    }

    public static PermissionChangedEvent roleRevoke(String userId, Long roleId, String operatorId) {
        PermissionChangedEvent event = new PermissionChangedEvent();
        event.setUserId(userId);
        event.setChangeType("ROLE_REVOKE");
        event.setDetail("RoleId: " + roleId);
        event.setOperatorId(operatorId);
        event.setEventTime(LocalDateTime.now());
        return event;
    }

    public static PermissionChangedEvent permissionGrant(String userId, String permissionCode, String operatorId) {
        PermissionChangedEvent event = new PermissionChangedEvent();
        event.setUserId(userId);
        event.setChangeType("PERMISSION_GRANT");
        event.setDetail("PermissionCode: " + permissionCode);
        event.setOperatorId(operatorId);
        event.setEventTime(LocalDateTime.now());
        return event;
    }

    public static PermissionChangedEvent permissionRevoke(String userId, String permissionCode, String operatorId) {
        PermissionChangedEvent event = new PermissionChangedEvent();
        event.setUserId(userId);
        event.setChangeType("PERMISSION_REVOKE");
        event.setDetail("PermissionCode: " + permissionCode);
        event.setOperatorId(operatorId);
        event.setEventTime(LocalDateTime.now());
        return event;
    }

    /**
     * 角色权限变更事件（userId 为 null，表示影响该角色下所有用户）
     */
    public static PermissionChangedEvent rolePermissionChanged(Long roleId, String operatorId) {
        PermissionChangedEvent event = new PermissionChangedEvent();
        event.setUserId(null);
        event.setChangeType("ROLE_PERMISSION_CHANGED");
        event.setDetail("RoleId: " + roleId);
        event.setOperatorId(operatorId);
        event.setEventTime(LocalDateTime.now());
        return event;
    }
}
