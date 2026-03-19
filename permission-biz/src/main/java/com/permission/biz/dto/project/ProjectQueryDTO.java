package com.permission.biz.dto.project;

import lombok.Data;

@Data
public class ProjectQueryDTO {

    private String code;

    private String name;

    private String status;

    private Integer pageNum = 1;

    private Integer pageSize = 10;
}
