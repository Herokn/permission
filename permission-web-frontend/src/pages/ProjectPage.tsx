import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Card, Tag, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listProjects, createProject, updateProject, deleteProject } from '@/services/api';
import type { Project, ProjectRequest, SystemModule } from '@/types';

const ProjectPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [systems, setSystems] = useState<SystemModule[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listProjects({ pageNum, pageSize });
      const result = response.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      message.error('加载项目列表失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setSystems([]);
    setModalVisible(true);
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    form.setFieldsValue(record);
    setSystems(record.systems || []);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: ProjectRequest) => {
    try {
      const submitData = { ...values, systems };
      if (editingProject) {
        await updateProject(editingProject.id, submitData);
        message.success('更新成功');
      } else {
        await createProject(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      message.error(editingProject ? '更新失败' : '创建失败');
    }
  };

  // 添加系统模块
  const handleAddSystem = () => {
    setSystems([...systems, { code: '', name: '' }]);
  };

  // 删除系统模块
  const handleRemoveSystem = (index: number) => {
    const newSystems = [...systems];
    newSystems.splice(index, 1);
    setSystems(newSystems);
  };

  // 更新系统模块
  const handleUpdateSystem = (index: number, field: 'code' | 'name', value: string) => {
    const newSystems = [...systems];
    newSystems[index] = { ...newSystems[index], [field]: value };
    setSystems(newSystems);
  };

  const columns: ColumnsType<Project> = [
    {
      title: '项目编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '系统模块',
      dataIndex: 'systems',
      key: 'systems',
      width: 300,
      render: (systems: SystemModule[]) => (
        <>
          {systems && systems.length > 0 ? (
            systems.map((s, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                {s.name}
              </Tag>
            ))
          ) : (
            <span style={{ color: '#999' }}>暂无</span>
          )}
        </>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span style={{ color: status === 'ENABLED' ? '#52c41a' : '#ff4d4f' }}>
          {status === 'ENABLED' ? '启用' : '禁用'}
        </span>
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
          <Popconfirm title="确定要删除此项目吗？" onConfirm={() => handleDelete(record.id)}>
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
          新增项目
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
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
          },
        }}
      />

      <Modal
        title={editingProject ? '编辑项目' : '新增项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="项目编码"
            rules={[
              { required: true, message: '请输入项目编码' },
              { max: 64, message: '编码最长64个字符' },
            ]}
          >
            <Input placeholder="请输入项目编码" disabled={!!editingProject} />
          </Form.Item>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[
              { required: true, message: '请输入项目名称' },
              { max: 128, message: '名称最长128个字符' },
            ]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" maxLength={256} />
          </Form.Item>
          
          <Divider orientation="left">系统模块配置</Divider>
          <div style={{ marginBottom: 16, color: '#666', fontSize: 12 }}>
            系统模块用于权限分类，如：用户中心、订单中心等。配置后可在权限管理中选择。
          </div>
          
          {systems.map((system, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input
                style={{ flex: 1 }}
                placeholder="模块编码（如 USER_CENTER）"
                value={system.code}
                onChange={(e) => handleUpdateSystem(index, 'code', e.target.value)}
              />
              <Input
                style={{ flex: 1 }}
                placeholder="模块名称（如 用户中心）"
                value={system.name}
                onChange={(e) => handleUpdateSystem(index, 'name', e.target.value)}
              />
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleRemoveSystem(index)}
              />
            </div>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSystem} block>
            添加系统模块
          </Button>
          
          {editingProject && (
            <>
              <Divider />
              <Form.Item name="status" label="状态">
                <Select>
                  <Select.Option value="ENABLED">启用</Select.Option>
                  <Select.Option value="DISABLED">禁用</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default ProjectPage;
