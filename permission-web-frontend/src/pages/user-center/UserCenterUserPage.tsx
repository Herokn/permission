import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Tag,
  Switch,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request, { get, post } from '@/utils/request';
import { useAuth } from '@/hooks/useAuth';
import { canAccessPermission } from '@/utils/permissions';

interface User {
  id: number;
  userId: string;
  loginAccount: string;
  displayName: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  status: number;
  orgId?: number;
  positionId?: number;
}

interface UserPageResult {
  list: User[];
  total: number;
  pageNum: number;
  pageSize: number;
}

interface CreateUserResult {
  user?: User;
  initialPassword?: string | null;
}

interface Organization {
  id: number;
  orgCode: string;
  orgName: string;
}

interface Position {
  id: number;
  positionCode: string;
  positionName: string;
}

const { Option } = Select;

const UserCenterUserPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [queryTick, setQueryTick] = useState(0);

  const can = (code: string) => canAccessPermission(currentUser, code);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const q = searchForm.getFieldsValue();
      const params: Record<string, string | number | undefined> = {
        pageNum,
        pageSize,
      };
      const trim = (s: unknown) => (typeof s === 'string' ? s.trim() : s);
      if (trim(q.loginAccount)) params.loginAccount = trim(q.loginAccount) as string;
      if (trim(q.userId)) params.userId = trim(q.userId) as string;
      if (trim(q.displayName)) params.displayName = trim(q.displayName) as string;
      if (trim(q.mobile)) params.mobile = trim(q.mobile) as string;
      if (trim(q.email)) params.email = trim(q.email) as string;
      if (q.status !== undefined && q.status !== null && q.status !== '') params.status = q.status;
      if (q.orgId != null) params.orgId = q.orgId;
      if (q.positionId != null) params.positionId = q.positionId;

      const api = await get<UserPageResult>('/api/users', { params });
      const page = api.data;
      const list = Array.isArray(page?.list) ? page.list : [];
      setData(list);
      setTotal(page?.total ?? 0);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, searchForm]);

  const loadOrganizations = async () => {
    try {
      const response = await request.get('/api/organizations/tree');
      const apiResponse = (response as { data?: { data?: unknown } }).data;
      const treeData = apiResponse?.data || [];
      const flattenOrgs = (orgs: { id: number; orgCode: string; orgName: string; children?: unknown[] }[]): Organization[] => {
        const result: Organization[] = [];
        orgs.forEach((org) => {
          result.push({ id: org.id, orgCode: org.orgCode, orgName: org.orgName });
          if (org.children) {
            result.push(...flattenOrgs(org.children as { id: number; orgCode: string; orgName: string; children?: unknown[] }[]));
          }
        });
        return result;
      };
      setOrganizations(flattenOrgs(Array.isArray(treeData) ? treeData : []));
    } catch {
      console.error('加载组织列表失败');
    }
  };

  const loadPositions = async () => {
    try {
      const response = await request.get('/api/positions');
      const apiResponse = (response as { data?: { data?: Position[] } }).data;
      const positionList = apiResponse?.data || [];
      setPositions(Array.isArray(positionList) ? positionList : []);
    } catch {
      console.error('加载岗位列表失败');
    }
  };

  useEffect(() => {
    fetchList();
  }, [fetchList, queryTick]);

  useEffect(() => {
    loadOrganizations();
    loadPositions();
  }, []);

  const handleSearch = () => {
    setPageNum(1);
    setQueryTick((t) => t + 1);
  };

  const handleResetSearch = () => {
    searchForm.resetFields();
    setPageNum(1);
    setQueryTick((t) => t + 1);
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      displayName: record.displayName,
      fullName: record.fullName,
      mobile: record.mobile,
      email: record.email,
      orgId: record.orgId,
      positionId: record.positionId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (u: User) => {
    try {
      await request.delete(`/api/users/${encodeURIComponent(u.userId)}`);
      message.success('删除成功');
      fetchList();
    } catch {
      message.error('删除失败');
    }
  };

  const handleToggleStatus = async (u: User) => {
    try {
      const newStatus = u.status === 1 ? 0 : 1;
      if (newStatus === 1) {
        await request.post(`/api/users/${encodeURIComponent(u.userId)}/enable`);
      } else {
        await request.post(`/api/users/${encodeURIComponent(u.userId)}/disable`);
      }
      message.success(newStatus === 1 ? '已启用' : '已禁用');
      fetchList();
    } catch {
      message.error('操作失败');
    }
  };

  const handleResetPassword = async (u: User) => {
    Modal.confirm({
      title: '重置密码',
      content: '确定重置该用户密码？将生成随机新密码并仅显示一次。',
      onOk: async () => {
        try {
          const api = await post<string>(`/api/users/${encodeURIComponent(u.userId)}/reset-password`);
          const pwd = api.data;
          Modal.info({
            title: '新密码',
            content: (
              <div>
                <p>请复制并告知用户（关闭后无法再次查看）：</p>
                <Input.TextArea readOnly autoSize value={pwd || ''} />
              </div>
            ),
          });
        } catch {
          message.error('重置失败');
        }
      },
    });
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingUser) {
        await request.put(`/api/users/${encodeURIComponent(editingUser.userId)}`, values);
        message.success('更新成功');
        setModalVisible(false);
        fetchList();
      } else {
        const body: Record<string, unknown> = { ...values };
        const pw = body.password;
        if (pw == null || (typeof pw === 'string' && !pw.trim())) {
          delete body.password;
        }
        const api = await post<CreateUserResult>('/api/users', body);
        const payload = api.data;
        message.success('创建成功');
        setModalVisible(false);
        fetchList();
        if (payload?.initialPassword) {
          Modal.info({
            title: '初始密码',
            content: (
              <div>
                <p>
                  已为用户 <strong>{payload.user?.loginAccount ?? '-'}</strong> 生成随机密码，请复制告知（关闭后无法再次查看）：
                </p>
                <Input.TextArea readOnly autoSize value={payload.initialPassword} />
              </div>
            ),
          });
        } else {
          Modal.info({
            title: '创建成功',
            content: '已使用您填写的密码，请自行告知用户。',
          });
        }
      }
    } catch {
      message.error(editingUser ? '更新失败' : '创建失败');
    }
  };

  const columns: ColumnsType<User> = [
    { title: '登录账号', dataIndex: 'loginAccount', key: 'loginAccount', width: 120 },
    { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 140, ellipsis: true },
    { title: '显示名称', dataIndex: 'displayName', key: 'displayName' },
    {
      title: '全名',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name?: string) => name || '-',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (mobile?: string) => mobile || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (email?: string) => email || '-',
    },
    {
      title: '组织',
      dataIndex: 'orgId',
      key: 'orgId',
      render: (orgId?: number) => {
        const org = organizations.find((o) => o.id === orgId);
        return org ? <Tag>{org.orgName}</Tag> : '-';
      },
    },
    {
      title: '岗位',
      dataIndex: 'positionId',
      key: 'positionId',
      render: (positionId?: number) => {
        const pos = positions.find((p) => p.id === positionId);
        return pos ? <Tag color="blue">{pos.positionName}</Tag> : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number, record) =>
        can('USER_CENTER_USER_ENABLE') ? (
          <Switch
            checked={status === 1}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={() => handleToggleStatus(record)}
          />
        ) : (
          <Tag>{status === 1 ? '启用' : '禁用'}</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space wrap>
          {can('USER_CENTER_USER_EDIT') && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {can('USER_CENTER_USER_DELETE') && (
            <Popconfirm title="确定要删除此用户吗？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
          {can('USER_CENTER_USER_RESET_PWD') && (
            <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => handleResetPassword(record)}>
              重置密码
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Form form={searchForm} layout="vertical" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="loginAccount" label="登录账号">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="userId" label="用户ID">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="displayName" label="显示名称">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="mobile" label="手机号">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="email" label="邮箱">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label="状态">
              <Select placeholder="全部" allowClear style={{ width: '100%' }}>
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="orgId" label="组织">
              <Select placeholder="全部" allowClear showSearch optionFilterProp="children" style={{ width: '100%' }}>
                {organizations.map((org) => (
                  <Option key={org.id} value={org.id}>
                    {org.orgName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="positionId" label="岗位">
              <Select placeholder="全部" allowClear showSearch optionFilterProp="children" style={{ width: '100%' }}>
                {positions.map((pos) => (
                  <Option key={pos.id} value={pos.id}>
                    {pos.positionName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 24 }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleResetSearch}>重置</Button>
          </Col>
        </Row>
      </Form>

      {can('USER_CENTER_USER_CREATE') && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增用户
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={data}
        rowKey="userId"
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size || 10);
          },
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingUser && (
            <>
              <Form.Item
                name="loginAccount"
                label="登录账号"
                rules={[
                  { required: true, message: '请输入登录账号' },
                  { pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,63}$/, message: '字母开头，3-64位，仅字母数字下划线' },
                ]}
              >
                <Input placeholder="用于登录；用户ID 由服务端自动生成" autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="password"
                label="登录密码"
                extra="留空则系统自动生成随机密码，保存后在弹窗中展示一次"
              >
                <Input.Password placeholder="可选，至少6位" autoComplete="new-password" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="displayName"
            label="显示名称"
            rules={[
              { required: true, message: '请输入显示名称' },
              { max: 128, message: '名称最长128个字符' },
            ]}
          >
            <Input placeholder="请输入显示名称" />
          </Form.Item>
          <Form.Item name="fullName" label="全名">
            <Input placeholder="请输入全名" maxLength={128} />
          </Form.Item>
          <Form.Item
            name="mobile"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="orgId" label="组织">
            <Select placeholder="请选择组织" allowClear>
              {organizations.map((org) => (
                <Option key={org.id} value={org.id}>
                  {org.orgName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="positionId" label="岗位">
            <Select placeholder="请选择岗位" allowClear>
              {positions.map((pos) => (
                <Option key={pos.id} value={pos.id}>
                  {pos.positionName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserCenterUserPage;
