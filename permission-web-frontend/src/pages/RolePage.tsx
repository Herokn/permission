import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Select,
  Tree,
  Radio,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, ReloadOutlined, UnorderedListOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode, TreeProps } from 'antd/es/tree';
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleDetail,
  grantPermissionsToRole,
  listPermissions,
  listAllProjects,
} from '@/services/api';
import type { Role, RoleRequest, Permission, Project } from '@/types';
import styles from './RolePage.module.css';

const RolePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [permissionViewMode, setPermissionViewMode] = useState<'list' | 'tree'>('list');
  const [form] = Form.useForm();

  // 加载角色列表
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listRoles({ pageNum, pageSize });
      setData(res.data.list);
      setTotal(res.data.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  // 加载所有权限点（分页加载）
  const loadAllPermissions = useCallback(async () => {
    try {
      const allData: Permission[] = [];
      let currentPage = 1;
      const pageSize = 100;
      let hasMore = true;
      
      while (hasMore) {
        const res = await listPermissions({ pageNum: currentPage, pageSize });
        allData.push(...res.data.list);
        hasMore = res.data.list.length === pageSize;
        currentPage++;
      }
      
      setAllPermissions(allData);
    } catch (error) {
      console.error('加载权限点失败', error);
      message.error('加载权限点失败，请刷新重试');
    }
  }, []);

  // 加载项目列表
  const loadProjects = useCallback(async () => {
    try {
      const res = await listAllProjects();
      setProjects(res.data || []);
    } catch (error) {
      console.error('加载项目列表失败', error);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadAllPermissions();
    loadProjects();
  }, [loadData, loadAllPermissions, loadProjects]);

  // 打开新建弹窗
  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 删除角色
  const handleDelete = async (roleId: number) => {
    try {
      await deleteRole(roleId);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async (values: RoleRequest) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, values);
        message.success('更新成功');
      } else {
        await createRole(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  // 打开权限配置弹窗
  const handleConfigPermissions = async (role: Role) => {
    setSelectedRole(role);
    try {
      const res = await getRoleDetail(role.id);
      setSelectedPermissionCodes(res.data.permissionCodes || []);
    } catch {
      setSelectedPermissionCodes([]);
    }
    setPermissionModalVisible(true);
  };

  // 保存权限配置
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      await grantPermissionsToRole(selectedRole.id, selectedPermissionCodes);
      message.success('权限配置成功');
      setPermissionModalVisible(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '权限配置失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<Role> = [
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      className: styles.codeCell,
      render: (text: string) => <span className={styles.codeText}>{text}</span>,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '范围',
      dataIndex: 'roleScope',
      key: 'roleScope',
      width: 100,
      align: 'center',
      render: (scope: string) => {
        const isGlobal = scope === 'GLOBAL';
        return (
          <Tag 
            className={styles.scopeTag}
            style={{ 
              backgroundColor: isGlobal ? '#e6f7ff' : '#f6ffed',
              color: isGlobal ? '#1890ff' : '#52c41a',
              border: `1px solid ${isGlobal ? '#91d5ff' : '#b7eb8f'}`,
            }}
          >
            {isGlobal ? '全局' : '项目'}
          </Tag>
        );
      },
    },
    {
      title: '角色域',
      dataIndex: 'roleDomain',
      key: 'roleDomain',
      width: 150,
      render: (text: string) => {
        if (!text) return <span className={styles.emptyText}>-</span>;
        const isPermCenter = text === 'PERM_CENTER';
        return (
          <Tag 
            style={{ 
              backgroundColor: isPermCenter ? '#f9f0ff' : '#e6f7ff',
              color: isPermCenter ? '#722ed1' : '#1890ff',
              border: `1px solid ${isPermCenter ? '#d3adf7' : '#91d5ff'}`,
            }}
          >
            {isPermCenter ? '权限中心' : '业务系统'}
          </Tag>
        );
      },
    },
    {
      title: '所属项目',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 120,
      render: (projectId: string) => {
        if (!projectId) return <Tag color="blue">全局</Tag>;
        return <Tag color="green">{projectId}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || <span className={styles.emptyText}>-</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: string) => (
        <Tag className={styles.statusTag} data-status={status}>
          {status === 'ENABLED' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleConfigPermissions(record)}
            className={styles.permissionBtn}
          >
            权限
          </Button>
          <Popconfirm
            title="确定要删除该角色吗？"
            description="此操作不可恢复"
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

  const permissionColumns: ColumnsType<Permission> = [
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (text: string) => <span className={styles.codeText}>{text}</span>,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          MENU: '#1890ff',
          PAGE: '#13c2c2',
          ACTION: '#52c41a',
        };
        return (
          <Tag style={{ backgroundColor: colorMap[type] || '#d9d9d9', color: '#fff', border: 'none' }}>
            {type}
          </Tag>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedPermissionCodes,
    onChange: (keys: React.Key[]) => {
      setSelectedPermissionCodes(keys as string[]);
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const buildPermissionTree = useMemo((): DataNode[] => {
    const systemMap = new Map<string, DataNode>();
    const pageMap = new Map<string, DataNode>();
    
    allPermissions.forEach(perm => {
      const systemCode = perm.systemCode || 'OTHER';
      if (!systemMap.has(systemCode)) {
        systemMap.set(systemCode, {
          key: `system_${systemCode}`,
          title: systemCode,
          children: [],
        });
      }
    });
    
    allPermissions.forEach(perm => {
      if (perm.type === 'PAGE') {
        const pageNode: DataNode = {
          key: perm.code,
          title: `${perm.name} (${perm.code})`,
          children: [],
        };
        pageMap.set(perm.code, pageNode);
        
        const systemCode = perm.systemCode || 'OTHER';
        const system = systemMap.get(systemCode);
        if (system && system.children) {
          system.children.push(pageNode);
        }
      }
    });
    
    allPermissions.forEach(perm => {
      if (perm.type === 'ACTION' && perm.parentCode) {
        const page = pageMap.get(perm.parentCode);
        if (page && page.children) {
          page.children.push({
            key: perm.code,
            title: `${perm.name} (${perm.code})`,
          });
        } else {
          const systemCode = perm.systemCode || 'OTHER';
          const system = systemMap.get(systemCode);
          if (system && system.children) {
            system.children.push({
              key: perm.code,
              title: `${perm.name} (${perm.code})`,
            });
          }
        }
      }
    });
    
    return Array.from(systemMap.values()).filter(node => node.children && node.children.length > 0);
  }, [allPermissions]);

  const handleTreeCheck: TreeProps['onCheck'] = (checkedKeys) => {
    setSelectedPermissionCodes(checkedKeys as string[]);
  };

  return (
    <Card className={styles.pageCard}>
      <div className={styles.toolbar}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建角色
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
        </Space>
        <div className={styles.statistics}>
          共 <span className={styles.count}>{total}</span> 条数据
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        className={styles.dataTable}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPageNum(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1000 }}
        rowClassName={(_, index) => index % 2 === 0 ? styles.evenRow : styles.oddRow}
      />

      {/* 新建/编辑角色弹窗 */}
      <Modal
        title={<div className={styles.modalTitle}>{editingRole ? '编辑角色' : '新建角色'}</div>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
        className={styles.editModal}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className={styles.editForm}>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              { pattern: /^[A-Z_]+$/, message: '只能包含大写字母和下划线' },
            ]}
          >
            <Input placeholder="如：ADMIN" disabled={!!editingRole} />
          </Form.Item>

          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item name="roleScope" label="角色范围">
            <Select placeholder="选择角色范围" allowClear>
              <Select.Option value="GLOBAL">全局</Select.Option>
              <Select.Option value="PROJECT">项目</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="roleDomain" 
            label="角色域"
            tooltip="角色域用于区分角色所属的管理范围：APP 为业务系统角色，PERM_CENTER 为权限中心管理角色"
          >
            <Select placeholder="选择角色域" allowClear>
              <Select.Option value="APP">APP - 业务角色</Select.Option>
              <Select.Option value="PERM_CENTER">PERM_CENTER - 权限中心管理角色</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="projectId" 
            label="所属项目"
            tooltip="留空表示全局角色，所有项目可用；选择项目则只有该项目下的用户可用"
          >
            <Select placeholder="留空表示全局角色" allowClear showSearch optionFilterProp="label">
              {projects.map(p => (
                <Select.Option key={p.code} value={p.code} label={p.name}>
                  {p.name} ({p.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限配置弹窗 */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            配置权限 - <span className={styles.roleName}>{selectedRole?.name || ''}</span>
          </div>
        }
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onOk={handleSavePermissions}
        width={permissionViewMode === 'list' ? 800 : 600}
        className={styles.permissionModal}
      >
        <div className={styles.permissionHeader}>
          <div className={styles.permissionTip}>
            已选择 <span className={styles.selectedCount}>{selectedPermissionCodes.length}</span> 个权限
          </div>
          <Radio.Group
            value={permissionViewMode}
            onChange={(e) => setPermissionViewMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="list"><UnorderedListOutlined /> 列表</Radio.Button>
            <Radio.Button value="tree"><ApartmentOutlined /> 树形</Radio.Button>
          </Radio.Group>
        </div>
        {permissionViewMode === 'list' ? (
          <Table
            columns={permissionColumns}
            dataSource={allPermissions}
            rowKey="code"
            rowSelection={rowSelection}
            size="small"
            pagination={{ pageSize: 10 }}
            className={styles.permissionTable}
          />
        ) : (
          <div className={styles.permissionTreeContainer}>
            <Tree
              checkable
              checkedKeys={selectedPermissionCodes}
              onCheck={handleTreeCheck}
              treeData={buildPermissionTree}
              defaultExpandAll
              style={{ padding: '12px 0' }}
            />
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default RolePage;
