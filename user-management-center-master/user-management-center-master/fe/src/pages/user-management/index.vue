<template>
  <div class="user-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">Users</h1>
      <p class="page-desc">
        Manage user profiles, primary org, positions, and identities
        (USERNAME/MOBILE/EMAIL, etc.). Status changes trigger audit and events.
      </p>
      <div class="header-actions">
        <t-button theme="primary" @click="handleCreateUser">
          <template #icon><t-icon name="add" /></template>
          Create user
        </t-button>
        <span class="total-count">Total {{ pagination.total }} items</span>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-left">
        <t-input
          v-model="searchParams.displayName"
          placeholder="Disaplay Name"
          clearable
          style="width: 180px"
        >
        </t-input>
        <t-input
          v-model="searchParams.mobile"
          placeholder="Mobile"
          clearable
          style="width: 180px"
        >
        </t-input>
        <t-input
          v-model="searchParams.email"
          placeholder="Email"
          clearable
          style="width: 200px"
        >
        </t-input>
        <t-select
          v-model="searchParams.status"
          placeholder="Select Status"
          clearable
          style="width: 150px"
        >
          <t-option
            v-for="option in userStatusOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </t-select>

        <OrgTreeSelect
          v-if="false"
          style="width: 260px"
          v-model="searchParams.orgId"
          placeholder="(None, as root)"
        />
        <t-button variant="outline" @click="handleReset"> Reset </t-button>
        <t-button theme="primary" @click="handleSearch" :loading="loading">
          Search
        </t-button>
      </div>
    </div>

    <!-- 用户列表表格 -->
    <div class="table-section">
      <t-table
        :data="userList"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        hover
        size="small"
        :max-height="560"
        @page-change="handlePageChange"
      >
        <!-- Name 列 -->
        <template #name="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ row.user?.displayName }}</span>
            <span class="updated-time"
              >updated {{ formatDate(row.user?.updatedAt) }}</span
            >
          </div>
        </template>
        <template #user.id="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ row.user?.id }}</span>
          </div>
        </template>

        <template #empNo="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ row.userTenant?.employeeNo }}</span>
          </div>
        </template>

        <template #username="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ row.user?.fullName }}</span>
          </div>
        </template>

        <template #mobile="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ row.user?.mobile }}</span>
          </div>
        </template>

        <template #email="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ row.user?.email }}</span>
          </div>
        </template>

        <template #primaryOrg="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ getOrgTreePath(row.mainOrgTree) }}</span>
          </div>
        </template>
        <template #position="{ row }">
          <div class="name-cell">
            <span class="user-name">{{ row.userOrgRel?.positionTitle }}</span>
          </div>
        </template>

        <template #status="{ row }">
          <div class="name-cell">
            <span class="user-name">{{
              userStatusOptions.find(
                (option: any) => option.value == row.user?.status
              )?.label
            }}</span>
          </div>
        </template>
        <!-- Status 列 -->
        <!-- <template #status="{ row }">
          <t-tag
            :theme="row.status === 'ACTIVE' ? 'success' : 'default'"
            variant="light"
            size="small"
          >
            {{ row.status }}
          </t-tag>
        </template> -->

        <!-- Actions 列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <t-button
              variant="text"
              theme="primary"
              size="small"
              @click="handleViewDetails(row)"
            >
              Details
            </t-button>
            <t-button
              variant="text"
              theme="primary"
              size="small"
              @click="handleEditUser(row)"
            >
              Edit
            </t-button>
            <t-dropdown :min-column-width="135">
              <t-button variant="text" theme="primary" size="small">
                More
                <template #suffix>
                  <t-icon name="chevron-down" size="14" />
                </template>
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item @click="handleResetPassword(row)">
                  Reset Password
                </t-dropdown-item>

                <t-dropdown-item
                  @click="handleToggleStatus(row)"
                  :class="{ 'danger-item': row.user?.status == 1 }"
                >
                  {{ row.user?.status == 1 ? 'Disable' : 'Enable' }}
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </template>
      </t-table>
    </div>

    <!-- 新增/编辑用户弹窗 -->
    <t-dialog
      v-model:visible="editPopupVisible"
      :header="isEditMode ? 'Edit user' : 'Add user'"
      width="800px"
      @close="handleEditDialogClose"
      :destroyOnClose="true"
    >
      <EditPopup
        ref="editPopupRef"
        :is-edit="isEditMode"
        :user-type="isEditMode ? '' : currentUserType"
        @submit="handleEditSubmit"
      />
      <template #footer>
        <div class="dialog-footer">
          <t-button variant="outline" @click="editPopupVisible = false">
            Cancel
          </t-button>
          <t-button
            :loading="submitLoading"
            theme="primary"
            @click="handleSaveUser"
          >
            {{ isEditMode ? 'Save' : 'Create' }}
          </t-button>
        </div>
      </template>
    </t-dialog>

    <!-- 用户详情抽屉 -->
    <DetailDrawl ref="detailDrawlRef" @edit="handleEditFromDetail" />
  </div>
</template>

<script setup lang="ts">
import {
  addUser_Api,
  disableUserById_Api,
  enableUserById_Api,
  modifyUserById_Api,
  queryUsersPage_Api,
  resetPasswordByUserId_Api,
} from '@/api/modules/user'
import OrgTreeSelect from '@/components/OrgTreeSelect.vue'
import { userStatusOptions } from '@/constants/index'
import { formatUTCToLocal } from '@/utils/date'
import { getOrgTreePath } from '@/utils/tool'
import type { TableProps } from 'tdesign-vue-next'
import {
  DialogPlugin,
  MessagePlugin,
  Button as TButton,
  Dialog as TDialog,
  Dropdown as TDropdown,
  DropdownItem as TDropdownItem,
  DropdownMenu as TDropdownMenu,
  Icon as TIcon,
  Input as TInput,
  Option as TOption,
  Select as TSelect,
  Table as TTable,
} from 'tdesign-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DetailDrawl from './components/DetailDrawl.vue'
import EditPopup from './components/EditPopup.vue'

// 路由
const route = useRoute()
const router = useRouter()
const formatDate = (dateStr?: string) => {
  return formatUTCToLocal(dateStr, 'datetime')
}
// 搜索参数
const searchParams = reactive({
  displayName: undefined,
  mobile: undefined,
  email: undefined,
  status: undefined,
  orgId: undefined,
})
const submitLoading = ref(false)
// 加载状态
const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3,
  showJumper: true,
  showPageSize: true,
})

// 表格列配置
const columns: TableProps['columns'] = [
  {
    colKey: 'name',
    title: 'Name',
    width: 200,
  },
  {
    colKey: 'user.id',
    title: 'User Id',
    width: 100,
  },
  {
    colKey: 'empNo',
    title: 'Emp No.',
    width: 100,
  },
  //   {
  //     colKey: 'username',
  //     title: 'Username',
  //     width: 120,
  //   },

  { colKey: 'mobile', title: 'Mobile', width: 160 },
  { colKey: 'email', title: 'Email', width: 230 },
  {
    colKey: 'primaryOrg',
    title: 'Primary org',
    width: 220,
  },
  {
    colKey: 'position',
    title: 'Position',
    width: 130,
  },
  {
    colKey: 'status',
    title: 'Status',
    width: 100,
  },
  {
    colKey: 'actions',
    title: 'Actions',
    width: 160,
    fixed: 'right',
  },
]

// 用户列表数据
const userList = ref([])

// 重置搜索
const handleReset = () => {
  searchParams.displayName = undefined
  searchParams.mobile = undefined
  searchParams.email = undefined
  searchParams.status = undefined
  searchParams.orgId = undefined
  pagination.current = 1
  loadUserList()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadUserList()
}

// 分页变化
const handlePageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadUserList()
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const { displayName, mobile, email, status, orgId } = searchParams
    // TODO: 调用 API 获取用户列表

    const res = await queryUsersPage_Api({
      user: {
        displayName: displayName || undefined,
        mobile: mobile || undefined,
        email: email || undefined,
        status: status || undefined,
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
      },

      userTenant: {},
      userOrgRel: {},
    })

    pagination.total = res?.total || 0
    userList.value = res?.list || []
  } catch (err) {
    console.error('Failed to load user list:', err)
  } finally {
    loading.value = false
  }
}

// 编辑弹窗状态
const editPopupVisible = ref(false)
const currentEditData = ref<any>(null)
const editPopupRef = ref()
const isEditMode = ref(false)

// 详情抽屉
const detailDrawlRef = ref()

// 查看用户详情
const handleViewDetails = (row: any) => {
  const userId = row.user?.id
  if (userId) {
    detailDrawlRef.value?.open(userId)
  }
}

// 从详情抽屉点击编辑
const handleEditFromDetail = (data: any) => {
  handleEditUser(data)
}

// userType 预设配置
const userTypePresets: Record<
  string,
  { country: string; identitySource: string }
> = {
  domestic: { country: 'CN', identitySource: 'LOCAL' }, // 国内用户
  overseas: { country: 'US', identitySource: 'LOCAL' }, // 海外用户
  external: { country: 'US', identitySource: 'EXTERNAL_PARTNER' }, // 外部用户
}

// 检测 URL 是否包含 userType 参数（不管值是什么）
const hasUserTypeParam = computed(() => {
  return 'userType' in route.query
})

// 从 URL 获取当前 userType（仅当值在预设列表中时才返回）
const currentUserType = computed(() => {
  const userType = route.query.userType as string
  return userType && userTypePresets[userType] ? userType : ''
})

// 创建用户
const handleCreateUser = () => {
  currentEditData.value = null
  isEditMode.value = false
  editPopupVisible.value = true
  // 等待下一帧再调用 resetForm，确保 ref 已经挂载
  setTimeout(() => {
    editPopupRef.value?.resetForm()
  }, 0)
}

// 编辑用户
const handleEditUser = (row: any) => {
  currentEditData.value = { ...row }
  isEditMode.value = true
  editPopupVisible.value = true

  // 等待下一帧再调用 setFormData，确保 ref 已经挂载
  setTimeout(() => {
    // 将 API 返回的数据结构映射到表单字段
    const formattedData = {
      displayName: row.user?.displayName || undefined,
      fullName: row.user?.fullName || undefined,
      username: row.user?.userCode || undefined,
      gender: row.user?.gender || undefined,
      country: row.user?.countryCode || undefined,
      idNumber: row.user?.idNo || undefined,
      mobile: row.user?.mobile || undefined,
      email: row.user?.email || undefined,
      status: row.userOrgRel?.status || undefined,
      primaryOrgId: row.userOrgRel?.orgId || null,
      positionId: row.userOrgRel?.positionId || null,
      identitySource: row.user?.identitySource || undefined,
    }
    editPopupRef.value?.setFormData(formattedData)
  }, 0)
}

// 编辑成功回调
const handleEditSuccess = () => {
  loadUserList()
}

// 弹窗关闭
const handleEditDialogClose = () => {
  // 不需要清空，因为打开时会调用 resetForm 或 setFormData
}

// 保存用户
const handleSaveUser = async () => {
  const valid = await editPopupRef.value?.validate()
  if (valid === true) {
    submitLoading.value = true
    await editPopupRef.value?.handleSubmit()
  } else {
    MessagePlugin.error('Please fix the form errors before saving.')
    return
  }
}
// const addForm = ref<any>({
//   user: {
//     displayName: '',
//     fullName: '',
//     gender: '0',
//     mobile: '',
//     email: '',
//     idNo: '',
//     countryCode: 'CN',
//     status: '1',
//     primaryTenantId: 1,
//     identitySource: '',
//   },
//   userTenant: { tenantId: 1, status: null as any, hireDate: '', leaveDate: '' },
//   userOrgRel: {
//     tenantId: 1,
//     orgId: null as any,
//     positionId: null as any,
//     positionTitle: '',
//     relationType: 'MAIN',
//     status: '1',
//     orgName: '',
//   },
// })
// 表单提交
const handleEditSubmit = async (formData: any) => {
  try {
    const {
      displayName,
      fullName,
      username,
      gender,
      country,
      idNumber,
      mobile,
      email,
      status,
      primaryOrgId,
      positionId,
      positionTitle,
      identitySource,
      hireDate,
    } = formData

    const postData: any = {
      user: {
        displayName: displayName || undefined,
        fullName: fullName || undefined,
        username: username || undefined,
        gender: gender || undefined,
        mobile: mobile || undefined,
        email: email || undefined,
        idNo: idNumber || undefined,
        countryCode: country || undefined,
        status: status || undefined,
        primaryTenantId: 1,
        identitySource: identitySource || undefined,
      },
      userTenant: {
        tenantId: 1,
        status: status || undefined,
        hireDate: hireDate || undefined,
      },
      userOrgRel: {
        tenantId: 1,
        orgId: primaryOrgId ? Number(primaryOrgId) : null,
        positionId: positionId ? Number(positionId) : null,
        positionTitle: positionTitle || undefined,
        relationType: 'MAIN',
        status: status || undefined,
      },
    }

    if (isEditMode.value) {
      postData.user['id'] = currentEditData.value?.user?.id
      postData.userTenant['id'] = currentEditData.value?.userTenant?.id
      postData.userOrgRel['id'] = currentEditData.value?.userOrgRel?.id
    }

    const res = await (isEditMode.value
      ? modifyUserById_Api(postData)
      : addUser_Api(postData))

    MessagePlugin.success(isEditMode.value ? 'User updated' : 'User created')
    editPopupVisible.value = false
    loadUserList()
  } catch (err) {
    console.error('Save user error:', err)
    MessagePlugin.error('Failed to save user')
  } finally {
    submitLoading.value = false
  }
}

// 切换用户状态
const handleToggleStatus = (row: any) => {
  const action = row.user?.status == 1 ? 'disable' : 'enable'
  const dialogInstance = DialogPlugin.confirm({
    header: `${action === 'disable' ? 'Disable' : 'Enable'} User`,
    body: `Are you sure you want to ${action} this user "${row.user?.displayName}"?`,
    confirmBtn: 'Confirm',
    cancelBtn: 'Cancel',
    onConfirm: async () => {
      try {
        if (action === 'enable') {
          await enableUserById_Api({ id: row.user?.id })
        } else {
          await disableUserById_Api({ id: row.user?.id })
        }
        // TODO: 调用 API 切换状态
        row.user.status = row.user?.status == 1 ? 2 : 1
        MessagePlugin.success(
          `User ${action === 'disable' ? 'disabled' : 'enabled'} successfully`
        )
        dialogInstance.destroy()
      } catch (err) {
        MessagePlugin.error(`Failed to ${action} user`)
      }
    },
  })
}

// 重置密码
const handleResetPassword = (row: any) => {
  const dialogInstance = DialogPlugin.confirm({
    header: 'Reset Password',
    body: `Are you sure you want to reset the password for user "${row.user?.displayName}"?`,
    confirmBtn: 'Confirm',
    cancelBtn: 'Cancel',
    onConfirm: async () => {
      try {
        await resetPasswordByUserId_Api({ userId: row.user?.id })
        MessagePlugin.success('Password reset successfully')
        dialogInstance.destroy()
      } catch (err) {
        console.error('Reset password error:', err)
        MessagePlugin.error('Failed to reset password')
      }
    },
  })
}

onMounted(() => {
  loadUserList()

  // 只有从 token-bridge 跳转过来，并且携带了 userType 参数，才自动打开添加用户弹框
  if (hasUserTypeParam.value && route.query.fromTokenBridge === '1') {
    handleCreateUser()
    // 打开弹框后，清除 fromTokenBridge 标记（可选，保持 URL 干净）
    router.replace({
      query: { ...route.query, fromTokenBridge: undefined },
    })
  }
})
</script>

<style scoped lang="less">
.user-management-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;

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
    justify-content: space-between;
    align-items: center;
  }
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .search-left {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-right {
    .total-count {
      font-size: 14px;
      color: #666;
    }
  }
}

.search-tip {
  font-size: 12px;
  color: #999;
  margin: 0 0 16px 0;
  text-align: right;
}

.table-section {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 16px;
}

.name-cell {
  display: flex;
  flex-direction: column;

  .user-name {
    font-size: 14px;
    color: #333;
    font-weight: 400;
  }

  .updated-time {
    font-size: 12px;
    color: #999;
  }
}

.action-buttons {
  display: flex;
  gap: 0;
  align-items: center;
}

.danger-item {
  color: var(--td-error-color) !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}
</style>
