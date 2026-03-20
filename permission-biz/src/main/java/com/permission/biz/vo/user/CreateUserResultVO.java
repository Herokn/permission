package com.permission.biz.vo.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 创建用户结果（含可选的初始随机密码）
 */
@Data
@Schema(description = "创建用户结果")
public class CreateUserResultVO {

    @Schema(description = "用户信息")
    private UserVO user;

    /**
     * 服务端随机生成密码时返回；客户端自行指定密码时为 null
     */
    @Schema(description = "初始密码（仅随机生成时返回）")
    private String initialPassword;
}
