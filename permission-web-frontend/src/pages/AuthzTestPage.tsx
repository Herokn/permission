import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Result,
  Tag,
  Typography,
  Divider,
  message,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { checkPermission } from '@/services/api';
import { getUserInfo } from '@/utils/request';
import type { AuthzRequest, AuthzResponse, UserInfo } from '@/types';
import styles from './AuthzTestPage.module.css';

const { Title, Text, Paragraph } = Typography;

const AuthzTestPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthzResponse | null>(null);
  const [request, setRequest] = useState<AuthzRequest | null>(null);

  const userInfo = getUserInfo() as UserInfo | null;
  const currentUserId = userInfo?.userId ?? '';
  const isAdmin = userInfo?.admin ?? false;

  const handleCheck = async (values: AuthzRequest) => {
    setLoading(true);
    try {
      const res = await checkPermission({
        userId: values.userId,
        permissionCode: values.permissionCode,
        projectId: values.projectId || undefined,
      });
      setResult(res.data);
      setRequest(values);
      message.success('鉴权完成');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '鉴权失败');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setResult(null);
    setRequest(null);
  };

  // 预设测试用例
  const testCases = [
    { userId: currentUserId, permissionCode: 'USER_CENTER_USER_VIEW', projectId: 'UC', description: `${currentUserId} 在用户中心项目下查看用户` },
    { userId: currentUserId, permissionCode: 'USER_CENTER_USER_VIEW', projectId: '', description: `${currentUserId} 全局 USER_CENTER_USER_VIEW` },
    { userId: currentUserId, permissionCode: 'PERMISSION_CENTER_ROLE_VIEW', projectId: '', description: `${currentUserId} 查看角色（权限中心）` },
    { userId: currentUserId, permissionCode: 'USER_CENTER_USER_CREATE', projectId: 'UC', description: `${currentUserId} 在 UC 下创建用户` },
  ];

  const handleTestCase = (testCase: typeof testCases[0]) => {
    form.setFieldsValue({
      userId: testCase.userId,
      permissionCode: testCase.permissionCode,
      projectId: testCase.projectId,
    });
    handleCheck({
      userId: testCase.userId,
      permissionCode: testCase.permissionCode,
      projectId: testCase.projectId,
    });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.testCard}>
        <Title level={4} className={styles.title}>
          <SafetyOutlined /> 权限测试
        </Title>
        <Paragraph type="secondary">
          测试用户对特定权限点的访问权限，验证鉴权规则是否正确。
        </Paragraph>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheck}
          initialValues={{ userId: currentUserId, permissionCode: '', projectId: '' }}
        >
          <Form.Item
            name="userId"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
            extra={isAdmin ? "管理员可查询任意用户的权限" : "后端限制只能查询当前登录用户自身的权限"}
          >
            <Input 
              placeholder={isAdmin ? "输入用户ID（管理员权限）" : "当前登录用户"} 
              prefix={<SafetyOutlined />}
              size="large"
              readOnly={!isAdmin}
            />
          </Form.Item>

          <Form.Item
            name="permissionCode"
            label="权限编码"
            rules={[{ required: true, message: '请输入权限编码' }]}
          >
            <Input 
              placeholder="如：USER_CENTER_USER_VIEW、PERMISSION_CENTER_ROLE_VIEW" 
              prefix={<ThunderboltOutlined />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="projectId"
            label="项目ID"
            extra="留空表示全局权限"
          >
            <Input 
              placeholder="如：UC、PC（可选，留空为全局）" 
              allowClear
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                icon={<CheckCircleOutlined />}
              >
                检查权限
              </Button>
              <Button size="large" onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 结果展示 */}
        {result && (
          <div className={styles.resultArea}>
            <Divider>鉴权结果</Divider>
            
            <Result
              icon={result.allowed ? 
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              }
              title={
                <span className={result.allowed ? styles.allowedTitle : styles.deniedTitle}>
                  {result.allowed ? '允许访问' : '拒绝访问'}
                </span>
              }
              subTitle={
                <Space direction="vertical" size="small">
                  <div>
                    <Tag color={result.allowed ? 'success' : 'error'}>
                      {result.allowed ? 'ALLOWED' : 'DENIED'}
                    </Tag>
                  </div>
                  {result.reason && (
                    <Alert
                      type={result.allowed ? 'success' : 'error'}
                      message={result.reason}
                      icon={<QuestionCircleOutlined />}
                      showIcon
                    />
                  )}
                </Space>
              }
              extra={
                <div className={styles.requestInfo}>
                  <Text type="secondary">请求参数：</Text>
                  <code>
                    userId={request?.userId}, 
                    permissionCode={request?.permissionCode}, 
                    projectId={request?.projectId || '(全局)'}
                  </code>
                </div>
              }
            />
          </div>
        )}
      </Card>

      {/* 快速测试用例 */}
      <Card className={styles.testCasesCard}>
        <Title level={5}>
          <ThunderboltOutlined /> 快速测试用例
        </Title>
        <Paragraph type="secondary">
          点击下方测试用例快速验证权限逻辑（基于演示数据）
        </Paragraph>
        
        <div className={styles.testCases}>
          {testCases.map((testCase, index) => (
            <Button
              key={index}
              className={styles.testCaseBtn}
              onClick={() => handleTestCase(testCase)}
              loading={loading}
            >
              <Space direction="vertical" size={0}>
                <Text strong>{testCase.description}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {testCase.userId} + {testCase.permissionCode} 
                  {testCase.projectId ? ` @ ${testCase.projectId}` : ' @ 全局'}
                </Text>
              </Space>
            </Button>
          ))}
        </div>

        <Divider orientation="left">鉴权规则说明</Divider>
        <div className={styles.rulesInfo}>
          <Alert
            type="info"
            message="鉴权优先级"
            description={
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li><Tag color="error">DENY</Tag> 用户直接拒绝权限（最高优先级）</li>
                <li><Tag color="success">ALLOW</Tag> 用户直接允许权限</li>
                <li><Tag color="blue">ROLE</Tag> 用户通过角色获得的权限</li>
                <li><Tag>DEFAULT</Tag> 默认拒绝</li>
              </ol>
            }
          />
          <Alert
            type="warning"
            message="项目维度规则"
            description="全局权限在所有项目中生效，项目级权限仅在指定项目中生效。DENY 权限会覆盖任何 ALLOW 权限。"
            style={{ marginTop: 12 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AuthzTestPage;
