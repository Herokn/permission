package com.permission.test.base;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * 单元测试基类
 * 所有单元测试类继承此类
 */
@ExtendWith(MockitoExtension.class)
public abstract class BaseTest {

    @BeforeEach
    public void setUp() {
        // 子类可覆盖此方法进行初始化
    }
}

