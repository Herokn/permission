<template>
  <div class="organization-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">Organization</h1>
      <p class="page-desc">
        Maintain the org tree: create/edit/disable/re-parent orgs, and view
        users by organization.
      </p>
      <div class="header-actions">
        <t-button theme="primary" @click="handleAddOrg">
          <template #icon><t-icon name="add" /></template>
          Add organization
        </t-button>
        <t-button variant="outline" @click="handleEditOrg">
          <template #icon><t-icon name="edit" /></template>
          Edit selected organization
        </t-button>
        <t-button
          :loading="positionLoading"
          variant="outline"
          @click="handleConfigPositions"
        >
          <template #icon><t-icon name="edit" /></template>
          Configure positions
        </t-button>
      </div>
      <p v-if="false" class="header-tip">
        Tip: Org tree and user primary org are used as permission attributes
        (department/team, etc.).
      </p>
    </div>

    <!-- 主体内容区域 -->
    <div class="page-content">
      <!-- 左侧组织树面板 -->
      <div class="org-tree-panel">
        <div class="panel-header">
          <span class="panel-title">Org tree</span>
          <t-tag size="small" variant="outline">Tree</t-tag>
        </div>
        <div class="tree-container">
          <t-tree
            v-model:actived="activeNode"
            :data="orgTreeData"
            :keys="{ value: 'id', label: 'orgName', children: 'children' }"
            activable
            hover
            transition
            @active="handleNodeActive"
          >
            <template #label="{ node }">
              <div class="tree-node-label">
                <t-icon name="folder-open" class="node-icon" />
                <span class="node-name">{{ node.data.orgName }}</span>
                <span class="node-code">{{ node.data.orgCode }}</span>
                <t-tag size="small" variant="light" class="node-type">{{
                  node.data.orgType
                }}</t-tag>
              </div>
            </template>
          </t-tree>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div class="detail-panel">
        <template v-if="selectedOrg">
          <!-- 组织信息头部 -->
          <div class="detail-header">
            <div class="org-info-row">
              <span class="org-code">{{ selectedOrg.name }}</span>
              <t-tag
                :theme="selectedOrg.status == 1 ? 'success' : 'default'"
                variant="light"
              >
                {{ selectedOrg.status == 1 ? 'ACTIVE' : 'DISABLED' }}
              </t-tag>
              <!-- <span v-if="false" class="user-count">{{
                selectedOrg.userCount || 0
              }}</span> -->
            </div>

            <div class="org-detail-grid">
              <div class="detail-item">
                <span class="detail-label">Org path</span>
                <span class="detail-value">{{ selectedOrg.path }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created/Updated (UTC)</span>
                <span class="detail-value"
                  >{{
                    selectedOrg.createdAt
                      ? formatDate(selectedOrg.createdAt)
                      : '-'
                  }}
                  /
                  {{
                    selectedOrg.updatedAt
                      ? formatDate(selectedOrg.updatedAt)
                      : '-'
                  }}</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label">Position configuration</span>
                <div class="position-tags">
                  <t-tag
                    v-for="pos in positionList"
                    :key="pos"
                    variant="outline"
                  >
                    {{ pos.positionName }}
                  </t-tag>
                </div>
              </div>
            </div>
            <p v-if="false" class="position-hint">
              Different orgs can have different position lists; the user form
              position dropdown follows org settings.
            </p>
          </div>

          <!-- 用户列表 -->
          <div class="users-section">
            <h3 class="section-title">Users in this org</h3>
            <t-table
              :data="usersInOrg"
              :columns="userColumns"
              row-key="id"
              hover
              :max-height="520"
              :bordered="false"
              :loading="loading"
              size="medium"
              :pagination="tablePagination"
              @page-change="handleTablePageChange"
            >
              <template #user="{ row }">
                <div class="user-cell">
                  <span class="user-name">{{ row.user?.displayName }}</span>
                </div>
              </template>

              <template #empNo="{ row }">
                <div class="user-cell">
                  <span class="user-name">{{
                    row.userTenant?.employeeNo
                  }}</span>
                </div>
              </template>

              <template #position="{ row }">
                <div class="user-cell">
                  <span class="user-name">{{
                    row.userOrgRel?.positionTitle
                  }}</span>
                </div>
              </template>
              <template #status="{ row }">
                <div class="user-cell">
                  <span class="user-name">{{
                    userStatusOptions.find(
                      (option: any) => option.value == row.user?.status
                    )?.label
                  }}</span>
                </div>
              </template>
              <template #actions="{ row }">
                <t-button
                  variant="text"
                  theme="primary"
                  size="small"
                  @click="handleViewUserDetail(row)"
                  >Detail</t-button
                >
              </template>
              <template #empty>
                <div class="empty-users">None</div>
              </template>
            </t-table>
            <p v-if="false" class="mvp-note">
              MVP: create/edit/disable/re-parent orgs + view users by org.
            </p>
          </div>
        </template>

        <template v-else>
          <div class="no-selection">
            <t-icon name="info-circle" size="48px" />
            <p>Please select an organization from the tree</p>
          </div>
        </template>
      </div>
    </div>

    <!-- 添加/编辑组织弹窗 -->
    <t-dialog
      v-model:visible="editDialogVisible"
      :header="editDialogTitle"
      width="680px"
      :footer="true"
      placement="center"
      :destroy-on-close="true"
      @close="handleEditDialogClose"
    >
      <edit-popup
        ref="editPopupRef"
        v-model="editFormData"
        :org-tree-data="orgTreeData"
        :is-edit="isEditMode"
        @submit="handleEditSubmit"
      />
      <template #footer>
        <div class="dialog-footer">
          <t-button variant="outline" @click="editDialogVisible = false">
            Cancel
          </t-button>
          <t-button theme="primary" @click="handleSaveOrg">
            {{ isEditMode ? 'Save' : 'Add' }}
          </t-button>
        </div>
      </template>
    </t-dialog>

    <!-- 配置岗位弹窗 -->
    <t-dialog
      v-model:visible="configDialogVisible"
      header="Org position configuration"
      width="800px"
      :footer="true"
      :destroy-on-close="true"
      @close="handleConfigDialogClose"
      placement="center"
    >
      <config-popup
        ref="configPopupRef"
        v-model="configPositions"
        :org-path="selectedOrgPath"
        :org-id="selectedOrg?.id"
        @submit="handleConfigSubmit"
      />
      <template #footer>
        <div class="dialog-footer">
          <t-button variant="outline" @click="configDialogVisible = false">
            Cancel
          </t-button>
          <t-button
            theme="primary"
            :loading="configSaving"
            @click="handleSaveConfig"
          >
            Save configuration
          </t-button>
        </div>
      </template>
    </t-dialog>

    <!-- 用户详情抽屉 -->
    <DetailDrawl ref="detailDrawlRef" />
  </div>
</template>

<script setup lang="ts">
import {
  addUcOrg_Api,
  batchUpdateOrgPositions_Api,
  modifyUcOrgById_Api,
} from '@/api/modules/org'
import { queryUsersPage_Api } from '@/api/modules/user'
import { userStatusOptions } from '@/constants/index'

import { queryUcOrgPositionsByOrgId } from '@/api/modules/org'
import { useOrgStore } from '@/stores/modules/organization'
import { formatUTCToLocal } from '@/utils/date'
import { findOrgPath } from '@/utils/tool'
import {
  MessagePlugin,
  Button as TButton,
  Dialog as TDialog,
  Icon as TIcon,
  Table as TTable,
  Tag as TTag,
  Tree as TTree,
  type PageInfo,
  type TreeNodeModel,
  type TreeNodeValue,
  type TreeOptionData,
} from 'tdesign-vue-next'
import { computed, onMounted, ref } from 'vue'
import DetailDrawl from '../user-management/components/DetailDrawl.vue'
import ConfigPopup from './components/ConfigPopup.vue'
import EditPopup from './components/EditPopup.vue'

const formatDate = (dateStr?: string) => {
  return formatUTCToLocal(dateStr, 'datetime')
}
// 组织树引用

const positionList = ref<any[]>([])
// 用于取消请求的 AbortController
let positionsAbortController: AbortController | null = null
let usersAbortController: AbortController | null = null
// 使用 Pinia store
const orgStore = useOrgStore()

// 从 store 获取组织树数据
const orgTreeData = computed(() => orgStore.getOrgTreeList)

// 当前选中节点
const activeNode = ref<TreeNodeValue[]>([])

// 选中的组织原始数据
const selectedOrgData = ref<any>(null)

const loading = ref(false)

const positionLoading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

// 选中的组织信息（转换后的格式，用于显示）
const selectedOrg = computed(() => {
  if (!selectedOrgData.value) return null
  const org = selectedOrgData.value
  return {
    id: org.id || undefined,
    //  code: org.orgCode || undefined,
    name: org.orgName || undefined,
    type: org.orgType || undefined,
    status: org.status || undefined,
    path: buildOrgPath(org),
    createdAt: org.createdAt || undefined,
    updatedAt: org.updatedAt || undefined,
    userCount: 0, // 用户数量需要另外获取
  }
})

// 构建组织路径
const buildOrgPath = (org: any): string => {
  if (!org || !org.id) return '-'
  const path = findOrgPath(orgTreeData.value, org.id)
  return path || org.orgName || '-'
}

// 用户表格列配置
const userColumns = [
  {
    colKey: 'user',
    title: 'User',
    width: 200,
  },
  {
    colKey: 'empNo',
    title: 'Emp No.',
    width: 150,
  },
  {
    colKey: 'position',
    title: 'Position',
    width: 150,
  },
  {
    colKey: 'status',
    title: 'Status',
    width: 100,
  },
  {
    colKey: 'actions',
    title: 'Actions',
    width: 100,
    fixed: 'right' as const,
  },
]

// 示例用户数据
const usersInOrg = ref<any[]>([])

// 节点激活事件
const handleNodeActive = async (
  value: TreeNodeValue[],
  context: {
    node: TreeNodeModel<TreeOptionData>
    e?: MouseEvent
    trigger: 'node-click' | 'setItem'
  }
) => {
  console.log('Node activated:', value, context)
  // 保存选中的组织数据
  if (value.length && context.node) {
    selectedOrgData.value = context.node.data
    // 这里可以调用 API 获取用户列表
    usersInOrg.value = [] // 暂时为空
    loading.value = true
    await Promise.all([
      // 加载岗位列表
      loadPositions(selectedOrgData.value.id as number),
      loadUserList(selectedOrgData.value.id as number),
    ])
  } else {
    selectedOrgData.value = null
  }
  loading.value = false
}

// ========== 弹窗相关 ==========

// 添加/编辑组织弹窗
const editDialogVisible = ref(false)
const isEditMode = ref(false)
const editFormData = ref<any>(null)
const editPopupRef = ref()

const editDialogTitle = computed(() => {
  return isEditMode.value ? 'Edit organization' : 'Add organization'
})

// 打开添加组织弹窗
const handleAddOrg = () => {
  isEditMode.value = false
  editFormData.value = null
  editDialogVisible.value = true
}

// 打开编辑组织弹窗
const handleEditOrg = () => {
  if (!selectedOrg.value) {
    MessagePlugin.warning('Please select an organization first')
    return
  }
  isEditMode.value = true
  editFormData.value = { ...selectedOrg.value }
  editDialogVisible.value = true
}

// 关闭编辑弹窗
const handleEditDialogClose = () => {
  // 不做处理，由 destroyOnClose 自动销毁组件
}

// 保存组织
const handleSaveOrg = async () => {
  const valid = await editPopupRef.value?.validate()
  if (valid) {
    editPopupRef.value?.handleSubmit()
  }
}

// 提交组织表单
const handleEditSubmit = async (formData: any) => {
  console.log('Submit org data:', formData)

  try {
    // 构建请求参数
    const params: any = {
      // orgCode: formData.code,
      orgName: formData.name,
      orgType: formData.type,
      status: formData.status,
      parentId: formData.parentId,
      tenantId: 1,
    }

    if (isEditMode.value) {
      // 编辑模式，添加 id
      params.id = selectedOrgData.value?.id
      await modifyUcOrgById_Api(params)
      // TODO: 调用编辑接口
      MessagePlugin.success('Organization updated successfully')
    } else {
      // 添加模式
      await addUcOrg_Api(params)
      MessagePlugin.success('Organization created successfully')
      // 刷新组织树
    }

    editDialogVisible.value = false
  } catch (err: any) {
    MessagePlugin.error(err.message || 'Failed to save organization')
  } finally {
    // 刷新组织树
    orgStore.setOrgTreeList()
  }
}

// 配置岗位弹窗
const configDialogVisible = ref(false)
const configPositions = ref<number[]>([])
const configPopupRef = ref()
const configSaving = ref(false)

const selectedOrgPath = computed(() => {
  return selectedOrg.value?.path || ''
})

// 打开配置岗位弹窗
const handleConfigPositions = () => {
  if (!selectedOrg.value) {
    MessagePlugin.warning('Please select an organization first')
    return
  }
  // 从 positions 对象数组中提取 positionId
  configPositions.value = (positionList.value || []).map(
    (pos: any) => pos.positionId
  )
  console.log('configPositions', configPositions.value)
  configDialogVisible.value = true
}

// 关闭配置弹窗
const handleConfigDialogClose = () => {
  configPositions.value = []
}

// 保存岗位配置
const handleSaveConfig = () => {
  configPopupRef.value?.submit()
}

// 提交岗位配置
const handleConfigSubmit = async (_positionIds: any[]) => {
  if (!selectedOrg.value?.id) {
    MessagePlugin.warning('Please select an organization first')
    return
  }
  let params: any = {
    orgId: selectedOrg.value?.id,
    positionIds: _positionIds,
  }

  configSaving.value = true
  try {
    await batchUpdateOrgPositions_Api(params)
    MessagePlugin.success('Position configuration saved successfully')
    configDialogVisible.value = false
    // 重新加载岗位列表
    await loadPositions(selectedOrg.value.id)
  } catch (err: any) {
    MessagePlugin.error(err.message || 'Failed to save position configuration')
  } finally {
    configSaving.value = false
  }
}

// 加载岗位列表
const loadPositions = async (orgId: string | number) => {
  // 取消上一次请求
  if (positionsAbortController) {
    positionsAbortController.abort()
  }
  // 创建新的 AbortController
  positionsAbortController = new AbortController()
  const { signal } = positionsAbortController

  try {
    positionLoading.value = true
    const res = await queryUcOrgPositionsByOrgId(Number(orgId), signal)
    positionList.value = res || []
  } catch (err: any) {
    // 如果是取消请求导致的错误，忽略它
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
      console.log('Position request cancelled')
      return
    }

    positionList.value = []
  } finally {
    positionLoading.value = false
  }
}

// 加载用户列表
const loadUserList = async (orgId: number) => {
  // 取消上一次请求
  if (usersAbortController) {
    usersAbortController.abort()
  }
  // 创建新的 AbortController
  usersAbortController = new AbortController()
  const { signal } = usersAbortController

  try {
    const res = await queryUsersPage_Api(
      {
        user: {},
        userTenant: {},
        userOrgRel: { orgId },
        pageNum: pagination.value.current,
        pageSize: pagination.value.pageSize,
      },
      signal
    )

    pagination.value.total = res?.total || 0
    usersInOrg.value = res?.list || []
  } catch (err: any) {
    // 如果是取消请求导致的错误，忽略它
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
      console.log('User list request cancelled')
      return
    }
    console.error('Failed to load user list:', err)
  }
}

// 分页变化处理
const handleTablePageChange = (pageInfo: PageInfo) => {
  pagination.value.current = pageInfo.current
  pagination.value.pageSize = pageInfo.pageSize
  if (selectedOrgData.value?.id) {
    loadUserList(selectedOrgData.value.id)
  }
}

// 表格分页配置
const tablePagination = computed(() => ({
  current: pagination.value.current,
  pageSize: pagination.value.pageSize,
  total: pagination.value.total,
  pageSizeOptions: [10, 20, 50],
  showJumper: true,
  size: 'small' as const,
}))

// 用户详情抽屉
const detailDrawlRef = ref()

// 查看用户详情
const handleViewUserDetail = (row: any) => {
  const userId = row.user?.id
  if (userId) {
    detailDrawlRef.value?.open(userId)
  }
}

onMounted(() => {
  // 从 store 加载完整组织树
  orgStore.setOrgTreeList()
})
</script>

<style scoped lang="less">
.organization-page {
  padding: 4px;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-header {
  margin-bottom: 16px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .page-desc {
    font-size: 14px;
    color: #666;
    margin: 0 0 16px 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .header-tip {
    font-size: 12px;
    color: #666;
    margin: 0;
    text-align: right;
  }
}

.page-content {
  display: flex;
  gap: 16px;
  min-height: calc(100vh - 200px);
}

.org-tree-panel {
  width: 320px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }

  .tree-container {
    flex: 1;
    overflow: auto;
    padding: 8px;
  }
}

.tree-node-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;

  .node-icon {
    color: #666;
    font-size: 14px;
  }

  .node-name {
    font-size: 14px;
    color: #333;
  }

  .node-code {
    font-size: 12px;
    color: #666;
  }

  .node-type {
    margin-left: auto;
    font-size: 10px;
  }
}

.detail-panel {
  flex: 1;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 20px;
  overflow: auto;
}

.detail-header {
  margin-bottom: 24px;

  .org-info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .org-code {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .user-count {
      margin-left: auto;
      font-size: 14px;
      color: #666;
    }
  }

  .org-detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .detail-item {
    display: flex;
    gap: 10px;

    .detail-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
      width: 140px;
      flex-shrink: 0;
      white-space: nowrap;
    }

    .detail-value {
      display: block;
      font-size: 14px;
      color: #333;
    }
  }

  .position-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .position-hint {
    font-size: 12px;
    color: #666;
    margin: 12px 0 0 0;
  }
}

.users-section {
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px 0;
  }

  .mvp-note {
    font-size: 12px;
    color: #666;
    margin: 16px 0 0 0;
  }
}

.user-cell {
  display: flex;
  flex-direction: column;

  .user-name {
    font-size: 14px;
    color: #333;
  }

  .user-username {
    font-size: 12px;
    color: #666;
  }
}

.empty-users {
  padding: 20px;
  text-align: center;
  color: #666;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

// 树节点激活样式
:deep(.t-tree__item--active) {
  background-color: #e6f2ff;
}

:deep(.t-tree__label) {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}
</style>
