import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Select, message, Popconfirm, Card, Space, Tabs, Tag, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ApartmentOutlined, UnorderedListOutlined, BuildingOutlined, TeamOutlined, ApartmentOutlined as OrgIcon } from '@ant-design/icons';
import request from '@/utils/request';
import styles from './OrganizationPage.module.css';

interface Organization {
  id: number;
  orgCode: string;
  orgName: string;
  orgType: string;
  parentId?: number;
  status: string;
  sortOrder?: number;
  description?: string;
  level?: number;
  children?: Organization[];
  parentName?: string;
}

interface TreeNode {
  key: number;
  title: string | React.ReactNode;
  children?: TreeNode[];
  org: Organization;
}

const { Option } = Select;
const { TextArea } = Input;

const ORG_TYPES = [
  { value: 'COMPANY', label: '公司', icon: '🏢', color: '#1890ff' },
  { value: 'DEPARTMENT', label: '部门', icon: '🏛️', color: '#52c41a' },
  { value: 'TEAM', label: '团队', icon: '👥', color: '#faad14' },
];

const OrganizationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Organization | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>();
  const [selectedNode, setSelectedNode] = useState<Organization | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('tree');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTreeData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/organizations/tree');
      const apiResponse = (response as any).data;
      const rawData = apiResponse?.data || [];
      const formattedData = transformToTreeData(Array.isArray(rawData) ? rawData : []);
      setTreeData(formattedData);
    } catch (error) {
      console.error('加载组织树失败:', error);
      message.error('加载组织树失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData, refreshKey]);

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
      setRefreshKey(k => k + 1);
      setSelectedNode(null);
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
      setRefreshKey(k => k + 1);
      if (selectedNode?.id === editingNode?.id) {
        setSelectedNode(null);
      }
    } catch {
      message.error(editingNode ? '更新失败' : '创建失败');
    }
  };

  // 构建卡片式树形结构
  const buildOrgCards = () => {
    const buildCard = (org: Organization, level: number = 0): React.ReactNode => {
      const typeInfo = ORG_TYPES.find(t => t.value === org.orgType);
      const hasChildren = org.children && org.children.length > 0;

      return (
        <div key={org.id} style={{ marginBottom: hasChildren ? 16 : 0 }}>
          <Card
            size="small"
            className={styles.orgCard}
            style={{
              marginLeft: level * 24,
              borderColor: selectedNode?.id === org.id ? '#1890ff' : undefined,
              boxShadow: selectedNode?.id === org.id ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : undefined,
            }}
            hoverable
            onClick={() => setSelectedNode(selectedNode?.id === org.id ? null : org)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Tag color={typeInfo?.color} style={{ margin: 0 }}>
                  {typeInfo?.icon} {typeInfo?.label}
                </Tag>
                <strong>{org.orgName}</strong>
                <span className={styles.orgCode}>({org.orgCode})</span>
                {org.status === 'DISABLED' && (
                  <Tag color="red" style={{ marginLeft: 8 }}>已禁用</Tag>
                )}
              </div>
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(e) => { e.stopPropagation(); handleAdd(org.id); }}
                  className={styles.iconBtn}
                >
                  添加子组织
                </Button>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => { e.stopPropagation(); handleEdit(org); }}
                  className={styles.iconBtn}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除此组织吗？"
                  description="删除后将同时删除所有子组织"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(org.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.iconBtn}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>
            {org.description && (
              <div className={styles.cardDescription}>{org.description}</div>
            )}
            {org.parentName && (
              <div className={styles.cardMeta}>
                上级: <Tag>{org.parentName}</Tag>
              </div>
            )}
          </Card>
          {hasChildren && (
            <div className={styles.childrenContainer}>
              {org.children!.map(child => buildCard(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return treeData.map(node => {
      const org = node.org;
      return buildCard(org);
    });
  };

  // 渲染树形视图（使用 Ant Design Tree 组件）
  const renderTreeView = () => {
    const renderTreeNodes = (data: TreeNode[]): any[] => {
      return data.map((node) => {
        const org = node.org;
        const typeInfo = ORG_TYPES.find(t => t.value === org.orgType);
        return {
          ...node,
          title: (
            <div className={styles.treeNode}>
              <Tag color={typeInfo?.color} style={{ margin: 0 }}>
                {typeInfo?.icon}
              </Tag>
              <span className={styles.treeNodeTitle}>{org.orgName}</span>
              <span className={styles.treeNodeCode}>({org.orgCode})</span>
              {org.status === 'DISABLED' && (
                <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>已禁用</Tag>
              )}
            </div>
          ),
          children: node.children ? renderTreeNodes(node.children) : undefined,
        };
      });
    };

    return (
      <>
        <div className={styles.statistics}>
          共 <span className={styles.count}>{treeData.length}</span> 个顶级组织
        </div>
        <Card className={styles.treeCard}>
          {treeData.length === 0 ? (
            <div className={styles.emptyState}>
              <BuildingOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <p>暂无组织数据，请点击上方"新增组织"按钮创建</p>
            </div>
          ) : (
            <div className={styles.treeContainer}>
              {treeData.map(node => {
                const org = node.org;
                const typeInfo = ORG_TYPES.find(t => t.value === org.orgType);

                return (
                  <div key={node.key} className={styles.treeItem}>
                    <Card
                      size="small"
                      className={styles.treeNodeCard}
                    >
                      <div className={styles.treeNodeHeader}>
                        <Space>
                          <Tag color={typeInfo?.color}>{typeInfo?.icon} {typeInfo?.label}</Tag>
                          <strong>{org.orgName}</strong>
                          <span className={styles.orgCode}>({org.orgCode})</span>
                          {org.status === 'DISABLED' && <Tag color="red">已禁用</Tag>}
                        </Space>
                        <Space size="small">
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleAdd(org.id)}
                          >
                            添加子组织
                          </Button>
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(org)}
                          >
                            编辑
                          </Button>
                          <Popconfirm
                            title="确定要删除此组织吗？"
                            onConfirm={() => handleDelete(org.id)}
                          >
                            <Button size="small" danger icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                      {org.description && (
                        <div className={styles.cardDescription}>{org.description}</div>
                      )}
                    </Card>
                    {org.children && org.children.length > 0 && (
                      <div className={styles.subTree}>
                        {renderSubTree(org.children, 1)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </>
    );
  };

  // 渲染子树
  const renderSubTree = (orgs: Organization[], level: number): React.ReactNode => {
    return orgs.map(org => {
      const typeInfo = ORG_TYPES.find(t => t.value === org.orgType);
      const hasChildren = org.children && org.children.length > 0;

      return (
        <div key={org.id} className={styles.treeItem} style={{ marginLeft: level * 20 }}>
          <Card
            size="small"
            className={styles.treeNodeCard}
          >
            <div className={styles.treeNodeHeader}>
              <Space>
                <Tag color={typeInfo?.color}>{typeInfo?.icon} {typeInfo?.label}</Tag>
                <span>{org.orgName}</span>
                <span className={styles.orgCode}>({org.orgCode})</span>
                {org.status === 'DISABLED' && <Tag color="red">已禁用</Tag>}
              </Space>
              <Space size="small">
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleAdd(org.id)}
                >
                  添加子组织
                </Button>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(org)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除此组织吗？"
                  onConfirm={() => handleDelete(org.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>
            {org.description && (
              <div className={styles.cardDescription}>{org.description}</div>
            )}
          </Card>
          {hasChildren && renderSubTree(org.children!, level + 1)}
        </div>
      );
    });
  };

  return (
    <Card className={styles.pageCard}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
              新增组织
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadTreeData} loading={loading}>
              刷新
            </Button>
          </Space>
        }
        items={[
          {
            key: 'tree',
            label: (
              <span>
                <ApartmentOutlined />
                树形视图
              </span>
            ),
            children: renderTreeView(),
          },
        ]}
      />

      <Modal
        title={
          <div className={styles.modalTitle}>
            {editingNode ? '编辑组织' : '新增组织'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={520}
        className={styles.editModal}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ sortOrder: 1 }}
          className={styles.editForm}
        >
          <Form.Item
            name="orgCode"
            label="组织编码"
            tooltip="组织的唯一标识，建议使用大写字母和下划线"
            rules={[
              { required: true, message: '请输入组织编码' },
              { max: 64, message: '编码最长64个字符' },
              { pattern: /^[A-Z0-9_]+$/, message: '只能包含大写字母、数字和下划线' },
            ]}
          >
            <Input placeholder="如：HQ、TECH_DEPT" disabled={!!editingNode} />
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
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序"
            tooltip="数值越小排序越靠前"
          >
            <InputNumber min={1} max={9999} placeholder="排序号" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入组织描述" />
          </Form.Item>

          {editingNode && (
            <Form.Item
              name="status"
              label="状态"
            >
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
