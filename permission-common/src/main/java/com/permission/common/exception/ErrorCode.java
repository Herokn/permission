package com.permission.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 全局错误码枚举
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    // ==================== 权限点相关 ====================
    PERMISSION_NOT_FOUND("142001", "权限点不存在"),
    PERMISSION_CODE_EXISTS("142002", "权限编码已存在：%s"),
    PERMISSION_PARENT_NOT_FOUND("142003", "父权限点不存在：%s"),
    PERMISSION_CIRCULAR_REF("142004", "不能将自身或子节点设为父权限点"),
    PERMISSION_HAS_CHILDREN("142005", "该权限点下存在子权限，请先删除子权限"),
    PERMISSION_USED_BY_ROLE("142006", "该权限点已被角色引用，请先解除关联"),
    PERMISSION_USED_BY_USER("142007", "该权限点已被用户直接授权，请先解除授权"),
    PERMISSION_DISABLED("142008", "权限点已禁用：%s"),
    PERMISSION_CODE_INVALID("141001", "权限编码格式不正确"),

    // ==================== 角色相关 ====================
    ROLE_NOT_FOUND("142101", "角色不存在"),
    ROLE_CODE_EXISTS("142102", "角色编码已存在：%s"),
    ROLE_DISABLED("142103", "角色已禁用：%s"),
    ROLE_USED_BY_USER("142104", "该角色已被用户引用，请先解除用户角色关联"),

    // ==================== 用户授权相关 ====================
    USER_ROLE_EXISTS("142201", "该用户已在此项目下拥有该角色"),
    USER_ROLE_NOT_FOUND("142202", "用户角色关系不存在"),
    USER_PERMISSION_EXISTS("142203", "该授权记录已存在"),
    USER_PERMISSION_NOT_FOUND("142204", "用户权限记录不存在"),
    GLOBAL_ROLE_NO_PROJECT("142205", "全局角色（如系统管理员）分配时不要传 projectId；仅项目角色需传所属项目编码"),

    // ==================== 项目相关 ====================
    PROJECT_NOT_FOUND("142211", "项目不存在"),
    PROJECT_CODE_EXISTS("142212", "项目编码已存在：%s"),
    PROJECT_USED_BY_USER_ROLE("142213", "该项目已被用户角色引用"),
    PROJECT_USED_BY_USER_PERMISSION("142214", "该项目已被用户权限引用"),
    PROJECT_PROTECTED("142215", "系统内置项目不可删除：%s"),
    PROJECT_DISABLED("142216", "项目已停用，无法进行授权操作"),

    // ==================== 组织权限相关 ====================
    ORG_CODE_EXISTS("142301", "组织编码已存在：%s"),
    ORG_PARENT_NOT_FOUND("142302", "父组织不存在"),
    ORG_NOT_FOUND("142303", "组织不存在"),
    ORG_CIRCULAR_REF("142304", "不能将自身或子组织设为父组织"),
    ORG_HAS_CHILDREN("142305", "该组织下存在子组织，请先删除子组织"),
    ORG_HAS_ROLES("142306", "该组织已关联角色，请先解除关联"),
    ORG_HAS_MEMBERS("142307", "该组织下存在成员，请先移除成员"),

    // ==================== 鉴权相关 ====================
    AUTHZ_PARAM_INVALID("144001", "鉴权参数无效"),
    AUTH_NOT_LOGIN("144002", "用户未登录"),
    AUTH_FORBIDDEN("144003", "无权访问：%s"),

    // ==================== 登录认证相关 ====================
    LOGIN_FAILED("143001", "用户名或密码错误"),
    USER_DISABLED("143002", "用户已禁用"),
    LOGIN_SYSTEM_ERROR("143003", "登录失败，请稍后重试"),
    REFRESH_TOKEN_INVALID("143004", "Refresh Token无效"),
    SESSION_REVOKED("143005", "会话已失效"),
    SSO_AUTH_FAILED("143006", "SSO认证失败"),
    TOKEN_EXPIRED("143007", "Token已过期"),
    TOKEN_INVALID("143008", "Token无效"),
    UNAUTHORIZED("143009", "未登录或登录已过期"),
    TOO_MANY_REQUESTS("143010", "请求过于频繁，请稍后重试"),

    // ==================== 用户管理相关 ====================
    USER_NOT_FOUND("142401", "用户不存在"),
    USER_ID_EXISTS("142402", "用户ID已存在"),
    MOBILE_EXISTS("142403", "手机号已被使用"),
    EMAIL_EXISTS("142404", "邮箱已被使用"),
    LOGIN_ACCOUNT_EXISTS("142405", "登录账号已被使用"),
    RESERVED_LOGIN_ACCOUNT("142406", "该登录账号为系统保留，不可使用"),

    // ==================== 通用错误 ====================
    INVALID_PARAM("140001", "参数无效"),
    SYSTEM_ERROR("140500", "系统错误");

    private final String code;
    private final String message;

    /**
     * 获取格式化后的错误信息
     */
    public String getMessage(Object... args) {
        if (args == null || args.length == 0) {
            return message;
        }
        return String.format(message, args);
    }
}

