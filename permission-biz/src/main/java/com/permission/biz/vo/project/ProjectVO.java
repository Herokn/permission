package com.permission.biz.vo.project;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectVO {

    private Long id;

    private String code;

    private String name;

    private String description;

    /**
     * 系统模块列表
     */
    private List<SystemModuleVO> systems;

    private String status;

    private LocalDateTime gmtCreate;

    private LocalDateTime gmtModified;

    @Data
    public static class SystemModuleVO {
        private String code;
        private String name;
    }
}
