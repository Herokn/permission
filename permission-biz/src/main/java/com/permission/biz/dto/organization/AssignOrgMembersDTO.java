package com.permission.biz.dto.organization;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 为组织添加成员 DTO
 */
@Data
public class AssignOrgMembersDTO {

    @NotEmpty(message = "用户ID列表不能为空")
    private List<String> userIds;
}

