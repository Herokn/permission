import React, { useState, useEffect, useCallback } from 'react';
import { Tree, Button, Modal, Form, Input, Select, message, Popconfirm, Card, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '@/utils/request';

interface Organization {
  id: number;
  orgCode: string;
  orgName: string;
  orgType: string;
  parentId?: number;
  status: string;
  children?: Organization[];
}

interface TreeNode {
  key: number;
  title: string | React.ReactNode;
  children?: TreeNode[];
  org: Organization;
}

const { Option } = Select;
const ORG_TYPES = [
  { value: 'COMPANY', label: '公司' },
  { value: 'DEPARTMENT', label: '部门' },
  { value: 'TEAM', label: '团队' },
];

const OrganizationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Organization | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>();
  const [form] = Form.useForm();

  const loadTreeData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request.get<Organization[]>('/api/organizations/tree');
      const data = Array.isArray(response) ? response : [];
      setTreeData(transformToTreeData(data));
    } catch {
      message.error('加载组织树失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  const transformToTreeData = (orgs: Organization[]): TreeNode[] => {
    return orgs.map((org) => ({
      key: org.id,
      title: `${org.orgName} (${org.orgCode})`,
      org,
      children: org.children ? transformToTreeData(org.children) : undefined,
    }));
  };

  const handleAdd = (parentId?: number) => {
    setEditingNode(null);
    form.resetFields();
    setSelectedParentId(parentId);
    setModalVisible(true);
  };

  const handleEdit = (node: Organization) => {
    setEditingNode(node);
    form.setFieldsValue(node);
    setSelectedParentId(node.parentId);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/organizations/${id}`);
      message.success('删除成功');
      loadTreeData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        parentId: selectedParentId,
      };
      if (editingNode) {
        await request.put(`/api/organizations/${editingNode.id}`, submitData);
        message.success('更新成功');
      } else {
        await request.post('/api/organizations', submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadTreeData();
    } catch {
      message.error(editingNode ? '更新失败' : '创建失败');
    }
  };

  const onSelect = (_selectedKeys: any, info: any) => {
    if (info.node?.org) {
      // 可以在这里显示详情
    }
  };

  const renderTreeNodes = (data: TreeNode[]): TreeNode[] => {
    return data.map((node) => {
      const org = node.org;
      return {
        ...node,
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 8 }}>
            <span>{typeof node.title === 'string' ? node.title : ''}</span>
            <Space size="small">
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => { e.stopPropagation(); handleAdd(org.id); }}
              />
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => { e.stopPropagation(); handleEdit(org); }}
              />
              <Popconfirm
                title="确定要删除此组织吗？"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(org.id);
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </Space>
          </div>
        ),
        children: node.children ? renderTreeNodes(node.children) : undefined,
      };
    });
  };

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
          新增组织
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
      ) : (
        <Tree
          showLine
          defaultExpandAll
          onSelect={onSelect}
          treeData={renderTreeNodes(treeData)}
        />
      )}

      <Modal
        title={editingNode ? '编辑组织' : '新增组织'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="orgCode"
            label="组织编码"
            rules={[
              { required: true, message: '请输入组织编码' },
              { max: 64, message: '编码最长64个字符' },
            ]}
          >
            <Input placeholder="请输入组织编码" disabled={!!editingNode} />
          </Form.Item>
          <Form.Item
            name="orgName"
            label="组织名称"
            rules={[
              { required: true, message: '请输入组织名称' },
              { max: 128, message: '名称最长128个字符' },
            ]}
          >
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item
            name="orgType"
            label="组织类型"
            rules={[{ required: true, message: '请选择组织类型' }]}
          >
            <Select placeholder="请选择组织类型">
              {ORG_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {editingNode && (
            <Form.Item name="status" label="状态">
              <Select>
                <Option value="ENABLED">启用</Option>
                <Option value="DISABLED">禁用</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default OrganizationPage;
