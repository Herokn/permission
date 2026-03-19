import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types';
import styles from './LoginPage.module.css';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await login(values);
    } catch {
      // 错误已在 useAuth 中处理
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* 动态背景 */}
      <div className={styles.background}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      {/* 浮动粒子 */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* 登录卡片 */}
      <Card
        className={`${styles.loginCard} ${mounted ? styles.cardVisible : ''}`}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Logo 动画 */}
          <div className={styles.logoContainer}>
            <div className={styles.logoRing}>
              <SafetyCertificateOutlined className={styles.logoIcon} />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Title level={2} className={styles.title}>
              权限管理中心
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              统一权限管理平台
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className={styles.form}
          >
            <Form.Item
              name="userName"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="用户名"
                size="large"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="密码"
                size="large"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                className={styles.loginButton}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
