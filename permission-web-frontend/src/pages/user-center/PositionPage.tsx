import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Card, Tag, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import styles from './PositionPage.module.css';

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
      const response = await request.get('/api/positions');
      const apiResponse = (response as any).data;
      const positionList = apiResponse?.data || [];
      setData(Array.isArray(positionList) ? positionList : []);
    } catch (error) {
      console.error('加载岗位列表失败:', error);
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

  // 根据 level 获取等级标签
  const getLevelTag = (level?: number) => {
    if (!level) return null;
    if (level <= 3) return <Tag color="red">L{level} 高级</Tag>;
    if (level <= 6) return <Tag color="orange">L{level} 中级</Tag>;
    return <Tag color="blue">L{level} 初级</Tag>;
  };

  const columns: ColumnsType<Position> = [
    {
      title: '岗位编码',
      dataIndex: 'positionCode',
      key: 'positionCode',
      width: 160,
      render: (code: string) => (
        <span className={styles.codeText}>{code}</span>
      ),
    },
    {
      title: '岗位名称',
      dataIndex: 'positionName',
      key: 'positionName',
      render: (name: string, record: Position) => (
        <Space>
          <TrophyOutlined style={{ color: '#faad14' }} />
          <strong>{name}</strong>
        </Space>
      ),
    },
    {
      title: '岗位级别',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      align: 'center',
      render: (level?: number) => (
        level ? (
          getLevelTag(level)
        ) : (
          <span className={styles.emptyText}>-</span>
        )
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc?: string) => desc || <span className={styles.emptyText}>-</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      width: 180,
      render: (date: string) => (
        <span style={{ color: '#999', fontSize: 12 }}>
          {new Date(date).toLocaleString('zh-CN')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className={styles.actionBtn}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此岗位吗？"
            description="删除后该岗位将不可用"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <div className={styles.toolbar}>
        <Space className={styles.statistics}>
          <Badge count={data.length} showZero>
            <span style={{ fontSize: 14, color: '#666' }}>岗位数量</span>
          </Badge>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增岗位
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        className={styles.dataTable}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? styles.evenRow : styles.oddRow
        }
      />

      <Modal
        title={
          <div className={styles.modalTitle}>
            {editingPosition ? '编辑岗位' : '新增岗位'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
        className={styles.editModal}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.editForm}
        >
          <Form.Item
            name="positionCode"
            label="岗位编码"
            tooltip="岗位的唯一标识"
            rules={[
              { required: true, message: '请输入岗位编码' },
              { max: 64, message: '编码最长64个字符' },
              { pattern: /^[A-Z0-9_]+$/, message: '只能包含大写字母、数字和下划线' },
            ]}
          >
            <Input placeholder="如：SENIOR_ENGINEER" disabled={!!editingPosition} />
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
            tooltip="数值越小级别越高，1为最高级别"
          >
            <InputNumber
              placeholder="请输入岗位级别"
              style={{ width: '100%' }}
              min={1}
              max={99}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入岗位描述" maxLength={512} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PositionPage;
