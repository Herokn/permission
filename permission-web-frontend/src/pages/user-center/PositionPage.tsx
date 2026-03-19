import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';

interface Position {
  id: number;
  positionCode: string;
  positionName: string;
  level?: number;
  description?: string;
  gmtCreate: string;
}

const PositionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Position[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request.get<Position[]>('/api/positions');
      setData(Array.isArray(response) ? response : []);
    } catch {
      message.error('加载岗位列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingPosition(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Position) => {
    setEditingPosition(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/positions/${id}`);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPosition) {
        await request.put(`/api/positions/${editingPosition.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/api/positions', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      message.error(editingPosition ? '更新失败' : '创建失败');
    }
  };

  const columns: ColumnsType<Position> = [
    {
      title: '岗位编码',
      dataIndex: 'positionCode',
      key: 'positionCode',
      width: 150,
    },
    {
      title: '岗位名称',
      dataIndex: 'positionName',
      key: 'positionName',
    },
    {
      title: '岗位级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level?: number) => level || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc?: string) => desc || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
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
          <Popconfirm title="确定要删除此岗位吗？" onConfirm={() => handleDelete(record.id)}>
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
          新增岗位
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingPosition ? '编辑岗位' : '新增岗位'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="positionCode"
            label="岗位编码"
            rules={[
              { required: true, message: '请输入岗位编码' },
              { max: 64, message: '编码最长64个字符' },
            ]}
          >
            <Input placeholder="请输入岗位编码" disabled={!!editingPosition} />
          </Form.Item>
          <Form.Item
            name="positionName"
            label="岗位名称"
            rules={[
              { required: true, message: '请输入岗位名称' },
              { max: 128, message: '名称最长128个字符' },
            ]}
          >
            <Input placeholder="请输入岗位名称" />
          </Form.Item>
          <Form.Item
            name="level"
            label="岗位级别"
          >
            <InputNumber placeholder="请输入岗位级别" style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入描述" maxLength={512} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PositionPage;
