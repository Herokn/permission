package com.permission.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Knife4j / Swagger API 文档配置
 * 生产环境可通过 swagger.enabled=false 禁用
 */
@Configuration
@ConditionalOnProperty(name = "swagger.enabled", havingValue = "true", matchIfMissing = true)
public class Knife4jConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("权限管理平台 API")
                        .version("1.0.0")
                        .description("统一权限中心接口文档 - Permission Center"));
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("全部接口")
                .pathsToMatch("/**")
                .build();
    }
}
