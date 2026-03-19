package com.permission.biz.dto.project;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProjectDTO {

    @Size(max = 128, message = "项目名称最长128个字符")
    private String name;

    @Size(max = 256, message = "描述最长256个字符")
    private String description;

    /**
     * 系统模块列表
     */
    private List<SystemModuleDTO> systems;

    private String status;

    @Data
    public static class SystemModuleDTO {
        private String code;
        private String name;
    }
}
