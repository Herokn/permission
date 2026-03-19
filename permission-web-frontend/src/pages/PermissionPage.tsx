import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tag,
  Card,
  InputNumber,
  Tabs,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UnorderedListOutlined, ApartmentOutlined, FolderOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  listPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  listAllPermissions,
  listAllProjects,
} from '@/services/api';
import type { Permission, PermissionRequest, Project } from '@/types';
import styles from './PermissionPage.module.css';

const permissionTypes = [
  { value: 'MENU', label: '菜单', icon: '📁', color: '#1890ff' },
  { value: 'PAGE', label: '页面', icon: '📄', color: '#13c2c2' },
  { value: 'ACTION', label: '操作', icon: '⚡', color: '#52c41a' },
];

const PermissionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Permission[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('tree');
  const [refreshKey, setRefreshKey] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);

  // 根据表单中选中的项目获取系统模块列表（从项目配置读取）
  const selectedProjectId = Form.useWatch('projectId', form);
  const systemOptions = useMemo(() => {
    const project = projects.find(p => p.code === selectedProjectId);
    if (project?.systems && project.systems.length > 0) {
      return project.systems.map(s => ({
        value: s.code,
        label: `${s.name} (${s.code})`,
      }));
    }
    // 如果没有配置系统模块，返回默认选项
    return [{ value: 'DEFAULT', label: '默认模块 (DEFAULT)' }];
  }, [projects, selectedProjectId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPermissions({ pageNum, pageSize });
      setData(res.data.list);
      setTotal(res.data.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  useEffect(() => {
    if (activeTab === 'table') {
      loadData();
    }
  }, [activeTab, loadData]);

  // 加载项目列表用于下拉选择
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await listAllProjects();
        setProjects(res.data || []);
      } catch {
        // ignore
      }
    };
    loadProjects();
  }, []);

  const selectedSystemCode = Form.useWatch('systemCode', form);
  const selectedType = Form.useWatch('type', form);
  
  // 加载选中项目的权限，用于父级选择
  const [projectPermissions, setProjectPermissions] = useState<Permission[]>([]);
  useEffect(() => {
    if (selectedProjectId) {
      listAllPermissions(selectedProjectId).then(res => {
        setProjectPermissions(res.data || []);
      }).catch(() => {
        setProjectPermissions([]);
      });
    } else {
      setProjectPermissions([]);
    }
  }, [selectedProjectId]);
  
  // 根据类型和系统过滤可选的父级
  const parentOptions = useMemo(() => {
    if (!selectedSystemCode) return [];
    
    // 根据类型确定可选的父级类型
    // MENU -> 无父级（顶级菜单）
    // PAGE -> 父级必须是 MENU
    // ACTION -> 父级必须是 PAGE
    let allowedParentType: string | null = null;
    if (selectedType === 'PAGE') {
      allowedParentType = 'MENU';
    } else if (selectedType === 'ACTION') {
      allowedParentType = 'PAGE';
    } else {
      // MENU 类型不需要父级
      return [];
    }
    
    // 过滤：同一系统下、类型匹配的权限
    return projectPermissions
      .filter(p => p.systemCode === selectedSystemCode && p.type === allowedParentType)
      .map(p => ({
        value: p.code,
        label: `${p.name} (${p.code})`,
      }));
  }, [projectPermissions, selectedSystemCode, selectedType]);

  const handleCreate = (projectId?: string, parentCode?: string) => {
    setEditingPermission(null);
    form.resetFields();
    // 如果传入了项目ID，设置到表单
    if (projectId) {
      form.setFieldsValue({ projectId });
    }
    // 如果传入了父级编码，设置到表单
    if (parentCode) {
      form.setFieldsValue({ parentCode });
    }
    setModalVisible(true);
  };

  const handleEdit = (record: Permission) => {
    setEditingPermission(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePermission(id);
      message.success('删除成功');
      loadData();
      setRefreshKey((k) => k + 1);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleSubmit = async (values: PermissionRequest) => {
    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, values);
        message.success('更新成功');
      } else {
        await createPermission(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
      setRefreshKey((k) => k + 1);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  const columns: ColumnsType<Permission> = [
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      className: styles.codeCell,
      render: (text: string) => <span className={styles.codeText}>{text}</span>,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 140,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: string) => {
        const item = permissionTypes.find((t) => t.value === type);
        return (
          <Tag
            className={styles.typeTag}
            style={{ backgroundColor: item?.color || '#d9d9d9', color: '#fff', border: 'none' }}
          >
            {item?.icon} {item?.label || type}
          </Tag>
        );
      },
    },
    {
      title: '所属系统',
      dataIndex: 'systemCode',
      key: 'systemCode',
      width: 140,
      render: (systemCode: string, record: Permission) => {
        // 根据权限点的 projectId 查找对应项目的系统模块
        const project = projects.find(p => p.code === record.projectId);
        const system = project?.systems?.find(s => s.code === systemCode);
        return <Tag color="geekblue">{system?.name || systemCode}</Tag>;
      },
    },
    {
      title: '项目隔离',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 100,
      render: (projectId: string) => {
        if (!projectId) return <Tag color="blue">全局</Tag>;
        const project = projects.find(p => p.code === projectId);
        return <Tag color="green">{project?.name || projectId}</Tag>;
      },
    },
    {
      title: '父级',
      dataIndex: 'parentCode',
      key: 'parentCode',
      width: 120,
      render: (text: string) => text || <span className={styles.emptyText}>-</span>,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      align: 'center',
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
      width: 160,
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
            title="确定要删除该权限点吗？"
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

  return (
    <Card className={styles.pageCard}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <Space>
            {activeTab === 'table' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
                新建权限点
              </Button>
            )}
            {activeTab === 'table' && (
              <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
                刷新
              </Button>
            )}
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
            children: <PermissionTreeView onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} refreshKey={refreshKey} />,
          },
          {
            key: 'table',
            label: (
              <span>
                <UnorderedListOutlined />
                列表视图
              </span>
            ),
            children: (
              <>
                <div className={styles.statistics}>
                  共 <span className={styles.count}>{total}</span> 条数据
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
                  scroll={{ x: 1100 }}
                  rowClassName={(_, index) =>
                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                  }
                />
              </>
            ),
          },
        ]}
      />

      <Modal
        title={
          <div className={styles.modalTitle}>
            {editingPermission ? '编辑权限点' : '新建权限点'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={560}
        className={styles.editModal}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ type: 'ACTION', sortOrder: 1 }}
          className={styles.editForm}
        >
          <Form.Item
            name="code"
            label="权限编码"
            rules={[
              { required: true, message: '请输入权限编码' },
              { pattern: /^[A-Z0-9_]+$/, message: '只能包含大写字母、数字和下划线' },
            ]}
          >
            <Input placeholder="如：USER_CREATE" disabled={!!editingPermission} />
          </Form.Item>

          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item 
            name="projectId" 
            label="所属项目"
            tooltip="选择该项目后，下方的系统模块会根据项目动态显示"
            rules={[{ required: true, message: '请选择所属项目' }]}
          >
            <Select 
              placeholder="请选择所属项目" 
              showSearch 
              optionFilterProp="label"
            >
              {projects.map(p => (
                <Select.Option key={p.code} value={p.code} label={p.name}>
                  {p.name} ({p.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="systemCode"
            label="所属系统"
            tooltip="该权限点所属的业务系统模块，需要先选择项目"
            rules={[{ required: true, message: '请选择所属系统' }]}
          >
            <Select
              showSearch
              placeholder={selectedProjectId ? "请选择所属系统" : "请先选择项目"}
              optionFilterProp="label"
              options={systemOptions}
              disabled={!selectedProjectId}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select options={permissionTypes} />
          </Form.Item>

          <Form.Item 
            name="parentCode" 
            label="父级权限" 
            tooltip="MENU类型无父级；PAGE类型父级为MENU；ACTION类型父级为PAGE"
            rules={[
              { required: selectedType !== 'MENU', message: '请选择父级权限' },
            ]}
          >
            <Select
              placeholder={selectedType === 'MENU' ? "顶级菜单无需选择父级" : "请选择父级权限"}
              options={parentOptions}
              disabled={selectedType === 'MENU' || parentOptions.length === 0}
              allowClear
            />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={1} max={999} placeholder="排序号" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

interface PermissionTreeViewProps {
  onEdit: (record: Permission) => void;
  onDelete: (id: number) => void;
  onCreate: (projectId: string, parentCode?: string) => void;
  refreshKey: number;
}

const PermissionTreeView: React.FC<PermissionTreeViewProps> = ({ onEdit, onDelete, onCreate, refreshKey }) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>(''); // 选中的项目

  const loadData = async () => {
    setLoading(true);
    try {
      const projectRes = await listAllProjects();
      setProjects(projectRes.data || []);
    } catch {
      message.error('加载项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据选中的项目加载权限
  const loadPermissions = async () => {
    if (!selectedProject) {
      setPermissions([]);
      return;
    }
    setLoading(true);
    try {
      const permRes = await listAllPermissions(selectedProject);
      setPermissions(permRes.data || []);
    } catch {
      message.error('加载权限数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  useEffect(() => {
    loadPermissions();
  }, [selectedProject, refreshKey]);

  // 构建分组卡片数据：一级菜单 -> 二级页面 -> 三级操作
  // 同时支持游离的权限（没有完整层级结构的权限）
  const buildGroupedCards = () => {
    const menuMap = new Map<string, { menu: Permission; pages: Map<string, { page: Permission; actions: Permission[] }> }>();
    const codeMap = new Map<string, Permission>();
    
    // 先建立 code -> permission 映射
    permissions.forEach(perm => codeMap.set(perm.code, perm));

    // 找出所有一级菜单
    permissions.filter(p => p.type === 'MENU' && !p.parentCode).forEach(menu => {
      menuMap.set(menu.code, { menu, pages: new Map() });
    });

    // 找出所有二级页面，归属到对应菜单
    permissions.filter(p => p.type === 'PAGE').forEach(page => {
      // 找父级菜单
      let parentCode = page.parentCode;
      while (parentCode) {
        const parent = codeMap.get(parentCode);
        if (parent?.type === 'MENU') {
          if (menuMap.has(parentCode)) {
            menuMap.get(parentCode)!.pages.set(page.code, { page, actions: [] });
          }
          break;
        }
        parentCode = parent?.parentCode;
      }
    });

    // 独立页面（没有父菜单）也加到列表
    permissions.filter(p => p.type === 'PAGE').forEach(page => {
      const hasMenu = Array.from(menuMap.values()).some(m => m.pages.has(page.code));
      if (!hasMenu) {
        // 创建一个虚拟菜单
        const virtualMenu: Permission = {
          ...page,
          type: 'MENU',
          name: page.parentCode ? `${page.name}（游离页面）` : `${page.name}模块`,
          code: `${page.code}_MODULE`,
        };
        menuMap.set(virtualMenu.code, { 
          menu: virtualMenu, 
          pages: new Map([[page.code, { page, actions: [] }]]) 
        });
      }
    });

    // 找出所有三级操作，归属到对应页面
    const assignedActions = new Set<string>();
    permissions.filter(p => p.type === 'ACTION').forEach(action => {
      // 找父级页面
      let parentCode: string | undefined = action.parentCode;
      while (parentCode) {
        const parent = codeMap.get(parentCode);
        if (parent?.type === 'PAGE') {
          // 遍历所有菜单，找到包含这个页面的
          const pageCode = parentCode;
          menuMap.forEach(m => {
            if (m.pages.has(pageCode)) {
              m.pages.get(pageCode)!.actions.push(action);
              assignedActions.add(action.code);
            }
          });
          break;
        }
        parentCode = parent?.parentCode;
      }
    });

    // 处理游离的操作（没有父页面的 ACTION）
    const orphanActions = permissions.filter(p => p.type === 'ACTION' && !assignedActions.has(p.code));
    if (orphanActions.length > 0) {
      // 创建一个统一的"游离权限"模块，包含所有游离操作
      const virtualMenuCode = 'VIRTUAL_ORPHAN_MODULE';
      const orphanPages = new Map<string, { page: Permission; actions: Permission[] }>();
      
      orphanActions.forEach(action => {
        const virtualPageCode = `VIRTUAL_PAGE_${action.code}`;
        const virtualPage: Permission = {
          ...action,
          id: -1,
          type: 'PAGE',
          name: `${action.name}（游离操作）`,
          code: virtualPageCode,
          parentCode: undefined,
        };
        orphanPages.set(virtualPageCode, { page: virtualPage, actions: [action] });
      });
      
      const virtualMenu: Permission = {
        id: -1,
        code: virtualMenuCode,
        name: '游离权限',
        systemCode: '',
        type: 'MENU',
        status: 'ENABLED',
      };
      menuMap.set(virtualMenuCode, {
        menu: virtualMenu,
        pages: orphanPages,
      });
    }

    return menuMap;
  };

  const groupedCards = buildGroupedCards();

  // 左侧导航菜单列表
  const moduleList = Array.from(groupedCards.entries())
    .map(([code, data]) => ({
      code,
      name: data.menu.name,
      count: Array.from(data.pages.values()).reduce((sum, p) => sum + 1 + p.actions.length, 0),
    }));

  // 当前选中的模块
  const [selectedModule, setSelectedModule] = useState<string>('');

  // 初始化默认选中第一个模块
  useEffect(() => {
    if (!selectedModule && moduleList.length > 0) {
      setSelectedModule(moduleList[0].code);
    }
  }, [selectedModule, moduleList]);

  // 搜索过滤逻辑
  const searchMatches = (keyword: string, data: { menu: Permission; pages: Map<string, { page: Permission; actions: Permission[] }> }): boolean => {
    const kw = keyword.toLowerCase();
    // 匹配菜单名
    if (data.menu.name.toLowerCase().includes(kw)) return true;
    // 匹配页面名或编码
    for (const [, pageData] of data.pages) {
      if (pageData.page.name.toLowerCase().includes(kw)) return true;
      if (pageData.page.code.toLowerCase().includes(kw)) return true;
      // 匹配操作名或编码
      if (pageData.actions.some(a => a.name.toLowerCase().includes(kw) || a.code.toLowerCase().includes(kw))) return true;
    }
    return false;
  };

  // 过滤逻辑：搜索时展示所有匹配的模块，否则只展示选中的模块
  const filteredModules = Array.from(groupedCards.entries()).filter(([menuCode, data]) => {
    // 有搜索关键词时，全局搜索
    if (searchKeyword) {
      return searchMatches(searchKeyword, data);
    }
    // 无搜索时，只展示选中的模块
    return menuCode === selectedModule;
  });

  // 左侧导航高亮：搜索时不高亮任何项
  const highlightModule = searchKeyword ? '' : selectedModule;

  return (
    <div>
      {/* 项目选择器 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 500 }}>选择项目：</span>
          <Select
            style={{ width: 200 }}
            placeholder="请选择项目"
            value={selectedProject || undefined}
            onChange={(value) => {
              setSelectedProject(value);
              setSelectedModule('');
              setSearchKeyword('');
            }}
            allowClear
          >
            {projects.map(p => (
              <Select.Option key={p.code} value={p.code}>
                {p.name} ({p.code})
              </Select.Option>
            ))}
          </Select>
          {selectedProject && (
            <>
              <Tag color="blue">
                当前项目：{projects.find(p => p.code === selectedProject)?.name || selectedProject}
              </Tag>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => onCreate(selectedProject)}>
                新建权限点
              </Button>
            </>
          )}
        </div>
      </Card>

      {!selectedProject ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
          <FolderOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }} />
          <div style={{ fontSize: 16, marginBottom: 8 }}>请先选择一个项目</div>
          <div style={{ fontSize: 12 }}>选择项目后将展示该项目的权限配置</div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
      ) : permissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          该项目暂无权限数据，请先创建
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, minHeight: 500 }}>
          {/* 左侧导航栏 */}
          <div style={{ width: 200, flexShrink: 0 }}>
            <Card size="small" style={{ marginBottom: 8 }}>
              <Input.Search
                placeholder="搜索权限..."
                allowClear
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ marginBottom: 8 }}
              />
            </Card>
            <Card size="small" style={{ padding: 0 }}>
              {moduleList.map(mod => (
                <div
                  key={mod.code}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: highlightModule === mod.code ? '#e6f7ff' : 'transparent',
                    borderRadius: 4,
                    marginBottom: 4,
                    borderLeft: highlightModule === mod.code ? '3px solid #1890ff' : '3px solid transparent',
                  }}
                  onClick={() => {
                    setSelectedModule(mod.code);
                    setSearchKeyword(''); // 切换模块时清空搜索
                  }}
                >
                  <span>{mod.name}</span>
                  <span style={{ float: 'right', color: '#999', fontSize: 12 }}>{mod.count}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* 右侧卡片区域 */}
          <div style={{ flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
            {filteredModules.map(([menuCode, data]) => (
              <div key={menuCode} style={{ marginBottom: 24 }}>
                {/* 模块标题 */}
                <div style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <FolderOutlined style={{ color: '#1890ff' }} />
                  {data.menu.name}
                  <span style={{ color: '#999', fontWeight: 'normal', fontSize: 12 }}>
                    ({data.pages.size} 个页面)
                  </span>
                </div>

                {/* 页面卡片网格 */}
                {data.pages.size > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {Array.from(data.pages.entries()).map(([pageCode, pageData]) => (
                      <PermissionCard
                        key={pageCode}
                        page={pageData.page}
                        actions={pageData.actions}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        selectedPermission={selectedPermission}
                        onSelect={setSelectedPermission}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 40, 
                    color: '#999', 
                    backgroundColor: '#fafafa',
                    borderRadius: 8,
                    border: '1px dashed #d9d9d9',
                  }}>
                    <FolderOutlined style={{ fontSize: 32, marginBottom: 8, color: '#d9d9d9' }} />
                    <div>暂无子权限，点击上方"添加子权限"按钮创建</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 权限卡片组件
interface PermissionCardProps {
  page: Permission;
  actions: Permission[];
  onEdit: (perm: Permission) => void;
  onDelete: (id: number) => void;
  selectedPermission: Permission | null;
  onSelect: (perm: Permission | null) => void;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ 
  page, 
  actions, 
  onEdit, 
  onDelete, 
  selectedPermission,
  onSelect,
}) => {
  const isSelected = selectedPermission?.code === page.code;
  const [expanded, setExpanded] = useState(true);

  return (
    <Card
      size="small"
      hoverable
      style={{ 
        width: 280,
        borderColor: isSelected ? '#1890ff' : undefined,
        boxShadow: isSelected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : undefined,
      }}
      onClick={() => onSelect(isSelected ? null : page)}
    >
      {/* 卡片标题栏 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color="cyan" style={{ margin: 0 }}>📄 页面</Tag>
          <strong>{page.name}</strong>
        </div>
        <Space size={0}>
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            onClick={(e) => { e.stopPropagation(); onEdit(page); }}
          />
        </Space>
      </div>

      {/* 操作列表 */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: 4,
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <span style={{ color: '#666', fontSize: 12 }}>
            操作权限 ({actions.length + 1})
          </span>
          {expanded ? <span style={{ fontSize: 10 }}>▼</span> : <span style={{ fontSize: 10 }}>▶</span>}
        </div>

        {expanded && (
          <>
            {/* 页面访问权限 */}
            <div
              style={{
                padding: '6px 8px',
                margin: '4px 0',
                backgroundColor: selectedPermission?.code === page.code ? '#e6f7ff' : '#fafafa',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => onSelect(isSelected ? null : page)}
            >
              <span>
                <Tag color="green" style={{ margin: 0, marginRight: 4 }}>⚡</Tag>
                页面访问
                <span style={{ color: '#999', fontSize: 11, marginLeft: 4 }} title={page.code}>
                  ({page.code})
                </span>
              </span>
              <Button 
                type="link" 
                size="small"
                onClick={(e) => { e.stopPropagation(); onEdit(page); }}
              >
                编辑
              </Button>
            </div>

            {/* 其他操作权限 */}
            {actions.map(action => (
              <div
                key={action.code}
                style={{
                  padding: '6px 8px',
                  margin: '4px 0',
                  backgroundColor: selectedPermission?.code === action.code ? '#e6f7ff' : '#fafafa',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={() => onSelect(selectedPermission?.code === action.code ? null : action)}
              >
                <span>
                  <Tag color="orange" style={{ margin: 0, marginRight: 4 }}>⚡</Tag>
                  {action.name}
                  <span style={{ color: '#999', fontSize: 11, marginLeft: 4 }} title={action.code}>
                    ({action.code})
                  </span>
                </span>
                <Space size={0}>
                  <Button 
                    type="link" 
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onEdit(action); }}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定删除该权限?"
                    onConfirm={(e) => { e?.stopPropagation(); onDelete(action.id); }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button 
                      type="link" 
                      size="small" 
                      danger
                      onClick={(e) => e.stopPropagation()}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
};

export default PermissionPage;
