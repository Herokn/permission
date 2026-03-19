package com.permission.biz.event;

import com.permission.dal.dataobject.UserRoleDO;
import com.permission.service.UserRoleService;
import com.permission.service.cache.AuthzCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

/**
 * 权限变更事件监听器
 * 负责处理权限变更后的通知逻辑和异步缓存清除
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionChangedEventListener {

    private final AuthzCacheService authzCacheService;
    private final UserRoleService userRoleService;

    /**
     * 异步处理权限变更事件
     * 使用 @TransactionalEventListener 确保事件在事务提交后才执行
     */
    @Async("asyncTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPermissionChanged(PermissionChangedEvent event) {
        log.info("收到权限变更事件: userId={}, changeType={}, detail={}, operatorId={}, time={}",
                event.getUserId(),
                event.getChangeType(),
                event.getDetail(),
                event.getOperatorId(),
                event.getEventTime());

        if ("ROLE_PERMISSION_CHANGED".equals(event.getChangeType())) {
            handleRolePermissionChanged(event);
            return;
        }

        sendNotification(event);
    }

    private void handleRolePermissionChanged(PermissionChangedEvent event) {
        String detail = event.getDetail();
        try {
            Long roleId = Long.parseLong(detail.replace("RoleId: ", "").trim());
            List<UserRoleDO> userRoles = userRoleService.listByRoleId(roleId);
            int count = 0;
            for (UserRoleDO userRole : userRoles) {
                authzCacheService.evictUser(userRole.getUserId());
                count++;
            }
            log.info("[异步缓存清除] 角色 {} 权限变更，已清除 {} 个用户的鉴权缓存", roleId, count);
        } catch (Exception e) {
            log.error("[异步缓存清除] 处理角色权限变更事件失败: {}", event, e);
        }
    }

    private void sendNotification(PermissionChangedEvent event) {
        log.info("[通知] 用户 {} 的权限已变更，类型: {}，详情: {}",
                event.getUserId(), event.getChangeType(), event.getDetail());
    }
}
