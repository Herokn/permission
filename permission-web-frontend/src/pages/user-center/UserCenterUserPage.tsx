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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';

interface User {
  id: number;
  userId: string;
  displayName: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  status: number;
  orgId?: number;
  positionId?: number;
  gmtCreate: string;
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/users', {
        params: { pageNum, pageSize },
      });
      const result = (response as any).data || response;
      setData(result.list || result.data || []);
      setTotal(result.total || 0);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  const loadOrganizations = async () => {
    try {
      const response = await request.get<Organization[]>('/api/organizations/tree');
      const flattenOrgs = (orgs: any[]): Organization[] => {
        const result: Organization[] = [];
        orgs.forEach((org) => {
          result.push({ id: org.id, orgCode: org.orgCode, orgName: org.orgName });
          if (org.children) {
            result.push(...flattenOrgs(org.children));
          }
        });
        return result;
      };
      setOrganizations(flattenOrgs(Array.isArray(response) ? response : []));
    } catch {
      console.error('加载组织列表失败');
    }
  };

  const loadPositions = async () => {
    try {
      const response = await request.get<Position[]>('/api/positions');
      setPositions(Array.isArray(response) ? response : []);
    } catch {
      console.error('加载岗位列表失败');
    }
  };

  useEffect(() => {
    loadData();
    loadOrganizations();
    loadPositions();
  }, [loadData]);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      orgId: record.orgId,
      positionId: record.positionId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/users/${id}`);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 1 ? 0 : 1;
      await request.put(`/api/users/${user.id}/status`, { status: newStatus });
      message.success(newStatus === 1 ? '已启用' : '已禁用');
      loadData();
    } catch {
      message.error('操作失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await request.put(`/api/users/${editingUser.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/api/users', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      message.error(editingUser ? '更新失败' : '创建失败');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '显示名称',
      dataIndex: 'displayName',
      key: 'displayName',
    },
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
      width: 80,
      render: (status: number, record) => (
        <Switch
          checked={status === 1}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除此用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
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
          <Form.Item
            name="userId"
            label="用户ID"
            rules={[
              { required: true, message: '请输入用户ID' },
              { max: 64, message: 'ID最长64个字符' },
            ]}
          >
            <Input placeholder="请输入用户ID" disabled={!!editingUser} />
          </Form.Item>
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
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
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
