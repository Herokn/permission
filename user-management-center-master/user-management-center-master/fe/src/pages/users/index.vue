<template>
  <div class="users-layout">
    <div class="users-sidebar">
      <t-menu
        v-model:value="menuValue"
        theme="light"
        style="width: 100%"
        class="users-menu"
      >
        <t-submenu value="user-mgmt">
          <template #title>User Management</template>
          <t-menu-item value="user-mgmt-index">User Management</t-menu-item>
        </t-submenu>
      </t-menu>
    </div>
    <div class="users-content">
      <t-config-provider :global-config="componentsLocaleEn">
        <t-space direction="vertical" size="small">
          <!-- <t-alert theme="success" message="用户管理" /> -->
          <t-space>
            <!--<t-button theme="primary" @click="load">加载用户</t-button>-->
            <t-button @click="add">Add User</t-button>
            <t-input
              v-model="query.displayName"
              placeholder="Display Name"
              style="width: 160px"
            />
            <t-input
              v-model="query.mobile"
              placeholder="Mobile"
              style="width: 160px"
            />
            <t-input
              v-model="query.email"
              placeholder="Email"
              style="width: 200px"
            />
            <t-select
              v-model="query.status"
              :options="statusOpts"
              placeholder="Status"
              style="width: 140px"
            />
            <t-button @click="onSearch">Search</t-button>
            <t-button @click="onReset">Reset</t-button>
          </t-space>
          <t-table
            row-key="id"
            :data="rows"
            :columns="cols"
            size="small"
            bordered
            table-layout="fixed"
            :loading="tableLoading"
          />
          <t-pagination
            :total="total"
            v-model:current="pageCurrent"
            v-model:pageSize="pageSize"
            :show-jumper="true"
            :show-page-size="true"
          />
        </t-space>
      </t-config-provider>
    </div>
  </div>
  <t-dialog
    v-model:visible="visible"
    :header="isNew ? 'Add User' : 'Edit User'"
    :footer="false"
    width="900px"
  >
    <t-form label-width="120px">
      <t-form-item label="Display Name"
        ><t-input v-model="addForm.user.displayName"
      /></t-form-item>
      <t-form-item label="Legal Name"
        ><t-input v-model="addForm.user.fullName"
      /></t-form-item>
      <t-form-item label="Gender"
        ><t-select
          v-model="addForm.user.gender"
          :options="genderOpts"
          style="width: 160px"
      /></t-form-item>
      <t-form-item label="Mobile"
        ><t-input v-model="addForm.user.mobile"
      /></t-form-item>
      <t-form-item label="Email"
        ><t-input v-model="addForm.user.email"
      /></t-form-item>
      <t-form-item label="ID No"
        ><t-input v-model="addForm.user.idNo"
      /></t-form-item>
      <t-form-item label="Country Code"
        ><t-select
          v-model="addForm.user.countryCode"
          :options="countryCodeOpts"
          style="width: 160px"
      /></t-form-item>
      <t-form-item v-if="false" label="User Status"
        ><t-select
          v-model="addForm.user.status"
          :options="userStatusOpts"
          style="width: 160px"
      /></t-form-item>
      <t-form-item v-if="false" label="Primary Tenant ID"
        ><t-input v-model="addForm.user.primaryTenantId"
      /></t-form-item>
      <t-form-item v-if="false" label="Tenant ID"
        ><t-input v-model="addForm.userTenant.tenantId"
      /></t-form-item>
      <t-form-item v-if="false" label="Tenant Status"
        ><t-select
          v-model="addForm.userTenant.status"
          :options="tenantStatusOpts"
          style="width: 160px"
      /></t-form-item>
      <t-form-item label="Hire Date"
        ><t-date-picker
          v-model="addForm.userTenant.hireDate"
          :enable-time-picker="false"
          style="width: 200px"
      /></t-form-item>
      <t-form-item v-if="false" label="Leave Date"
        ><t-date-picker
          v-model="addForm.userTenant.leaveDate"
          :enable-time-picker="false"
          style="width: 200px"
      /></t-form-item>
      <t-form-item v-if="false" label="Org Tenant ID"
        ><t-input v-model="addForm.userOrgRel.tenantId"
      /></t-form-item>
      <t-form-item label="Organization">
        <t-tree-select
          v-model="addForm.userOrgRel.orgId"
          :data="orgTreeOptions"
          :loading="orgLoading"
          :keys="{ value: 'value', label: 'label', children: 'children' }"
          :tree-props="{
            expandOnClickNode: false,
            lazy: true,
            load: loadOrgNode,
          }"
          @change="onOrgTreeChange"
          placeholder="Select Organization"
          style="width: 260px"
        >
          <template #valueDisplay>
            {{
              addForm.userOrgRel.orgName ||
              findOrgLabelById(addForm.userOrgRel.orgId, orgTreeOptions) ||
              addForm.userOrgRel.orgId
            }}
          </template>
        </t-tree-select>
      </t-form-item>
      <t-form-item label="Position"
        ><t-select
          v-model="addForm.userOrgRel.positionId"
          :options="positionOptions"
          :loading="positionLoading"
          placeholder="Select Position"
          style="width: 260px"
      /></t-form-item>
      <t-form-item v-if="false" label="Position Title"
        ><t-input v-model="addForm.userOrgRel.positionTitle"
      /></t-form-item>
      <t-form-item v-if="false" label="Relation Type"
        ><t-select
          v-model="addForm.userOrgRel.relationType"
          :options="relationTypeOpts"
          style="width: 160px"
      /></t-form-item>
      <t-form-item v-if="false" label="Org Relation Status"
        ><t-select
          v-model="addForm.userOrgRel.status"
          :options="orgRelStatusOpts"
          style="width: 160px"
      /></t-form-item>
      <t-space :style="{ display: 'flex', justifyContent: 'center' }">
        <t-button theme="primary" @click="save">Save</t-button>
        <t-button variant="outline" @click="visible = false">Cancel</t-button>
      </t-space>
    </t-form>
  </t-dialog>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Space as TSpace,
  Alert as TAlert,
  Button as TButton,
  Table as TTable,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Select as TSelect,
  TreeSelect as TTreeSelect,
  Tag as TTag,
  DatePicker as TDatePicker,
  DialogPlugin,
  Pagination as TPagination,
  MessagePlugin,
  Menu as TMenu,
  Submenu as TSubmenu,
  MenuItem as TMenuItem,
  ConfigProvider as TConfigProvider,
} from 'tdesign-vue-next'
import { i18n } from '@/locales'
import type { User } from '@wb/shared'
import {
  queryUsersPage_Api as queryUsersPage,
  addUser_Api as addUser,
  modifyUserById_Api as modifyUserById,
  enableUserById_Api as enableUserById,
  disableUserById_Api as disableUserById,
  getUserDetail_Api as getUserDetail,
} from '@/api/modules/user'
import {
  queryAllUcOrgs_Api,
  queryUcOrgPositionsByOrgId,
} from '@/api/modules/org'

const rows = ref<any[]>([])
const tableLoading = ref(false)
const pageCurrent = ref(1)
const pageSize = ref(10)
const total = ref(0)
const menuValue = ref<string>('user-mgmt-index')
// 采用服务端分页，直接使用接口返回的当前页数据
const roles = [
  { label: 'admin', value: 'admin' },
  { label: 'user', value: 'user' },
]
const query = ref({
  displayName: '',
  mobile: '',
  email: '',
  status: undefined as number | undefined,
})
const statusOpts = [
  { label: 'ACTIVE', value: 1 },
  { label: 'DISABLED', value: 2 },
  { label: 'LEFT', value: 3 },
  { label: 'PENDING', value: 0 },
]
const cols = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'userCode', title: 'User Code', width: 140 },
  { colKey: 'displayName', title: 'Display Name', width: 140 },
  { colKey: 'fullName', title: 'Legal Name', width: 160 },
  {
    colKey: 'gender',
    title: 'Gender',
    width: 100,
    cell: (h: any, { row }: any) => {
      const g = row.gender
      const labelMap: Record<string, string> = {
        '0': 'UNKNOWN',
        '1': 'MALE',
        '2': 'FEMALE',
        UNKNOWN: 'UNKNOWN',
        MALE: 'MALE',
        FEMALE: 'FEMALE',
      }
      const theme =
        g === 1 || g === '1' || g === 'MALE'
          ? 'primary'
          : g === 2 || g === '2' || g === 'FEMALE'
            ? 'warning'
            : 'default'
      return h(TTag, { theme }, () => labelMap[String(g)] || 'UNKNOWN')
    },
  },
  { colKey: 'mobile', title: 'Mobile', width: 160 },
  { colKey: 'email', title: 'Email', width: 240 },
  { colKey: 'employeeNo', title: 'Employee No', width: 120 },
  { colKey: 'orgName', title: 'Organization', width: 160 },
  { colKey: 'positionTitle', title: 'Position', width: 140 },
  { colKey: 'createdBy', title: 'Created By', width: 140 },
  {
    colKey: 'createdAt',
    title: 'Created At',
    width: 140,
    cell: (_h: any, { row }: any) =>
      row.createdAt ? String(row.createdAt).slice(0, 10) : '',
  },
  {
    colKey: 'status',
    title: 'Status',
    width: 120,
    cell: (h: any, { row }: any) => {
      const s = row.status
      const labelMap: Record<string, string> = {
        '1': 'ACTIVE',
        '2': 'DISABLED',
        '3': 'LEFT',
        '0': 'PENDING',
        ACTIVE: 'ACTIVE',
        DISABLED: 'DISABLED',
        LEFT: 'LEFT',
        PENDING: 'PENDING',
      }
      const theme =
        s === 1 || s === '1' || s === 'ACTIVE'
          ? 'success'
          : s === 2 || s === '2' || s === 'DISABLED'
            ? 'default'
            : 'warning'
      return h(TTag, { theme }, () => labelMap[String(s)] || 'UNKNOWN')
    },
  },
  {
    colKey: 'op',
    title: 'Actions',
    width: 160,
    cell: (h: any, { row }: any) =>
      h(TSpace, { size: 'small' }, [
        h(TButton, { size: 'small', onClick: () => edit(row) }, () => 'Edit'),
        h(
          TButton,
          { size: 'small', onClick: () => enable(row) },
          () => 'Enable'
        ),
        h(
          TButton,
          { size: 'small', onClick: () => disable(row) },
          () => 'Disable'
        ),
      ]),
  },
]
const visible = ref(false)
const isNew = ref(true)
const addForm = ref<any>({
  user: {
    displayName: '',
    fullName: '',
    gender: '0',
    mobile: '',
    email: '',
    idNo: '',
    countryCode: 'CN',
    status: '1',
    primaryTenantId: 1,
    identitySource: '',
  },
  userTenant: { tenantId: 1, status: null as any, hireDate: '', leaveDate: '' },
  userOrgRel: {
    tenantId: 1,
    orgId: null as any,
    positionId: null as any,
    positionTitle: '',
    relationType: 'MAIN',
    status: '1',
    orgName: '',
  },
})
const genderOpts = [
  { label: 'UNKNOWN', value: '0' },
  { label: 'MALE', value: '1' },
  { label: 'FEMALE', value: '2' },
]
const userStatusOpts = [
  { label: 'ACTIVE', value: '1' },
  { label: 'DISABLED', value: '2' },
  { label: 'LEFT', value: '3' },
  { label: 'PENDING', value: '0' },
]
const countryCodeOpts = [
  { label: 'CN', value: 'CN' },
  { label: 'US', value: 'US' },
]
const tenantStatusOpts = [
  { label: 'ACTIVE', value: '1' },
  { label: 'DISABLED', value: '2' },
  { label: 'LEFT', value: '3' },
]
const relationTypeOpts = [{ label: 'MAIN', value: 'MAIN' }]
const orgRelStatusOpts = [
  { label: 'ACTIVE', value: '1' },
  { label: 'INACTIVE', value: '0' },
]

const orgOptions = ref<{ label: string; value: number }[]>([])
const orgStack = ref<
  { options: { label: string; value: number }[]; parentId: number }[]
>([])
const orgLoading = ref(false)
const positionOptions = ref<{ label: string; value: number }[]>([])
const positionLoading = ref(false)
const orgTreeOptions = ref<any[]>([])
const componentsLocaleEn = computed(
  () => i18n.global.getLocaleMessage('en_US').componentsLocale
)

async function initOrgData() {
  try {
    orgLoading.value = true
    const roots = await queryAllUcOrgs_Api({ tenantId: 1, parentId: 0 })
    const opts = roots.map((it: any) => ({ label: it.orgName, value: it.id }))
    orgOptions.value = opts
    orgStack.value = []
    orgTreeOptions.value = opts.map((it: any) => ({
      label: it.label,
      value: it.value,
      children: true,
    }))
    if (isNew.value && opts.length > 0) {
      addForm.value.userOrgRel.orgId = opts[0].value
    }
  } catch (e: any) {
    MessagePlugin.error(String(e?.message || e || 'Organization load failed'))
  } finally {
    orgLoading.value = false
  }
}
async function loadOrgChildren() {
  try {
    const pid = addForm.value.userOrgRel.orgId || 0
    if (!pid) return
    orgLoading.value = true
    const prev = { options: orgOptions.value.slice(), parentId: pid }
    const list = await queryAllUcOrgs_Api({ tenantId: 1, parentId: pid })
    const opts = list.map((it: any) => ({ label: it.orgName, value: it.id }))
    if (opts.length > 0) {
      orgStack.value.push(prev)
      orgOptions.value = opts
      addForm.value.userOrgRel.orgId = opts[0].value
    } else MessagePlugin.warning('No child nodes')
  } catch (e: any) {
    MessagePlugin.error(String(e?.message || e || '组织加载失败'))
  } finally {
    orgLoading.value = false
  }
}
function backOrgLevel() {
  if (orgStack.value.length === 0) return
  const prev = orgStack.value.pop()!
  orgOptions.value = prev.options
  addForm.value.userOrgRel.orgId = prev.parentId
}
function onOrgChange(_val: number) {
  // 用户可点击加载下级进行懒加载
}
function onOrgTreeChange(val: any, context: any) {
  addForm.value.userOrgRel.orgName =
    context?.node?.label || addForm.value.userOrgRel.orgName
}
async function loadPositionsByOrg() {
  try {
    const orgId = addForm.value.userOrgRel.orgId
    positionOptions.value = []
    if (!orgId || orgId === 0) return
    positionLoading.value = true
    const list = await queryUcOrgPositionsByOrgId(orgId)
    positionOptions.value = list.map((it: any) => ({
      label: it.positionName || String(it.positionId),
      value: it.positionId,
    }))
    if (
      addForm.value.userOrgRel.positionId == null &&
      positionOptions.value.length > 0
    ) {
      addForm.value.userOrgRel.positionId = positionOptions.value[0].value
    }
  } catch (e: any) {
    MessagePlugin.error(String(e?.message || e || 'Position load failed'))
  } finally {
    positionLoading.value = false
  }
}
async function load() {
  tableLoading.value = true
  try {
    const asNull = (v: any) => (v === '' || v === undefined ? null : v)
    const r = await queryUsersPage({
      user: {
        displayName: asNull(query.value.displayName),
        mobile: asNull(query.value.mobile),
        email: asNull(query.value.email),
        status: query.value.status ?? null,
        currentPage: pageCurrent.value,
        pageSize: pageSize.value,
      },
      userTenant: {},
      userOrgRel: {},
    })
    const list = Array.isArray(r.list)
      ? r.list.map((it: any) => {
          const u = it.user || {}
          const ut = it.userTenant || {}
          const or = it.userOrgRel || {}
          return {
            id: u.id,
            userCode: u.userCode,
            displayName: u.displayName,
            fullName: u.fullName,
            gender: u.gender,
            mobile: u.mobile,
            email: u.email,
            status: u.status,
            primaryTenantId: u.primaryTenantId,
            employeeNo: ut.employeeNo,
            tenantStatus: ut.status,
            hireDate: ut.hireDate,
            leaveDate: ut.leaveDate,
            orgName: or.orgName,
            positionTitle: or.positionTitle,
            orgStatus: or.status,
            createdBy: u.createdBy,
            createdAt: u.createdAt,
          }
        })
      : []
    rows.value = list
    total.value = Number(r.total ?? list.length)
  } catch (e: any) {
    MessagePlugin.error(String(e?.message || e || 'Failed to load'))
    rows.value = []
    total.value = 0
  } finally {
    tableLoading.value = false
  }
}
function findOrgLabelById(id: number, nodes: any[]): string | undefined {
  for (const n of nodes || []) {
    if (n?.value === id) return n.label
    const child = Array.isArray(n?.children)
      ? findOrgLabelById(id, n.children)
      : undefined
    if (child) return child
  }
}
async function loadOrgNode(node: any) {
  const pid = node?.value || 0
  return queryAllUcOrgs_Api({ tenantId: 1, parentId: pid }).then(
    (children: any[]) => {
      const mapped = (children || []).map((it: any) => ({
        label: it.orgName,
        value: it.id,
        children: true,
      }))
      return mapped
    }
  )
}
function onSearch() {
  pageCurrent.value = 1
  load()
}
function onReset() {
  query.value = { displayName: '', mobile: '', email: '', status: undefined }
  pageCurrent.value = 1
  load()
}
function add() {
  isNew.value = true
  addForm.value = {
    user: {
      displayName: '',
      fullName: '',
      gender: '0',
      mobile: '',
      email: '',
      idNo: '',
      countryCode: 'CN',
      status: '1',
      primaryTenantId: 1,
    },
    userTenant: {
      tenantId: 1,
      status: null as any,
      hireDate: '',
      leaveDate: '',
    },
    userOrgRel: {
      tenantId: 1,
      orgId: null as any,
      positionId: null as any,
      positionTitle: '',
      relationType: 'MAIN',
      status: '1',
    },
  }
  visible.value = true
}
async function edit(u: User) {
  isNew.value = false
  visible.value = true
  try {
    const detail = await getUserDetail((u as any).id)
    const du = (detail as any)?.user || {}
    const dt = (detail as any)?.userTenant || {}
    const dr = (detail as any)?.userOrgRel || {}
    addForm.value = {
      user: {
        displayName: du.displayName || '',
        fullName: du.fullName || '',
        gender: String(du.gender ?? '0'),
        mobile: du.mobile || '',
        email: du.email || '',
        idNo: du.idNo || '',
        countryCode: du.countryCode || 'CN',
        status: String(du.status ?? '1'),
        primaryTenantId: du.primaryTenantId ?? 1,
        id: du.id,
      },
      userTenant: {
        tenantId: dt.tenantId ?? 1,
        status: String(dt.status ?? '1'),
        hireDate: dt.hireDate || '',
        leaveDate: dt.leaveDate || '',
        id: dt.id,
      },
      userOrgRel: {
        tenantId: dr.tenantId ?? 1,
        orgId: dr.orgId ?? 0,
        positionId: dr.positionId ?? 0,
        positionTitle: dr.positionTitle || '',
        relationType: dr.relationType || 'MAIN',
        status: String(dr.status ?? '1'),
        id: dr.id,
        orgName: dr.orgName || '',
      },
    }
    addForm.value.user.primaryTenantId = 1
    addForm.value.user.status = null as any
    addForm.value.userTenant.tenantId = 1
    addForm.value.userTenant.status = null as any
    addForm.value.userTenant.leaveDate = null as any
    addForm.value.userOrgRel.tenantId = 1
    addForm.value.userOrgRel.status = null as any
    addForm.value.userOrgRel.relationType = null as any
  } catch (e: any) {
    MessagePlugin.error(String(e?.message || e || 'Failed to load details'))
  }
}
async function save() {
  try {
    const now = new Date().toISOString()
    addForm.value.user.identitySource =
      addForm.value.user.identitySource || 'HR'
    if (isNew.value) {
      ;(addForm.value.user as any).createdAt = now
      ;(addForm.value.user as any).createdBy = 'test'
    }
    ;(addForm.value.user as any).updatedAt = now
    ;(addForm.value.user as any).updatedBy = 'test'
    if (isNew.value) {
      ;(addForm.value.userTenant as any).createdAt = now
      ;(addForm.value.userTenant as any).createdBy = 'test'
    }
    ;(addForm.value.userTenant as any).updatedAt = now
    ;(addForm.value.userTenant as any).updatedBy = 'test'
    if (isNew.value) {
      ;(addForm.value.userOrgRel as any).createdAt = now
      ;(addForm.value.userOrgRel as any).createdBy = 'test'
    }
    ;(addForm.value.userOrgRel as any).updatedAt = now
    ;(addForm.value.userOrgRel as any).updatedBy = 'test'
    const p = positionOptions.value.find(
      (it) => it.value === addForm.value.userOrgRel.positionId
    )
    addForm.value.userOrgRel.positionTitle = p ? p.label : ''
    if (isNew.value) {
      await addUser(addForm.value)
    } else {
      await modifyUserById(addForm.value)
    }
    visible.value = false
    await load()
  } catch (e: any) {
    MessagePlugin.error(String(e?.message || e || 'Save failed'))
  }
}
async function del(u: any) {
  const dialog = DialogPlugin.confirm({
    header: 'Confirm Delete',
    body: `Are you sure to delete user [${u.displayName || u.fullName || u.userCode || ''}]?`,
    confirmBtn: 'Delete',
    cancelBtn: 'Cancel',
    theme: 'danger',
    onConfirm: async () => {
      await disableUserById({ id: u.id })
      await load()
      dialog.hide()
    },
  })
}

function enable(u: any) {
  const s = u?.status
  const isActive = s === 1 || s === '1' || s === 'ACTIVE'
  if (isActive) {
    MessagePlugin.info('User is already enabled')
    return
  }
  const dialog = DialogPlugin.confirm({
    header: 'Confirm Enable',
    body: `Are you sure to enable user [${u.displayName || u.fullName || u.userCode || ''}]?`,
    confirmBtn: 'OK',
    cancelBtn: 'Cancel',
    onConfirm: async () => {
      await enableUserById({ id: u.id })
      dialog.hide()
      load()
    },
  })
}
function disable(u: any) {
  const s = u?.status
  const isDisabled = s === 2 || s === '2' || s === 'DISABLED'
  if (isDisabled) {
    MessagePlugin.info('User is already disabled')
    return
  }
  const dialog = DialogPlugin.confirm({
    header: 'Confirm Disable',
    body: `Are you sure to disable user [${u.displayName || u.fullName || u.userCode || ''}]?`,
    confirmBtn: 'OK',
    cancelBtn: 'Cancel',
    onConfirm: async () => {
      await disableUserById({ id: u.id })
      dialog.hide()
      load()
    },
  })
}

load()
watch(menuValue, () => {
  pageCurrent.value = 1
  load()
})
watch([pageCurrent, pageSize], () => {
  load()
})
watch(visible, async (v) => {
  if (v) {
    await initOrgData()
  }
})
watch(
  () => addForm.value.userOrgRel.orgId,
  (nv, ov) => {
    if (ov && ov !== 0 && nv !== ov)
      addForm.value.userOrgRel.positionId = null as any
    addForm.value.userOrgRel.orgName =
      (findOrgLabelById(nv as any, orgTreeOptions.value) as any) ||
      addForm.value.userOrgRel.orgName
    loadPositionsByOrg()
  }
)
</script>
<style scoped lang="less">
.users-layout {
  display: flex;
  // padding: 16px;
  gap: 8px;
  align-items: flex-start;
  min-height: 100vh;
}
.users-sidebar {
  width: 220px;
  background: transparent;
  border-right: 1px solid #e5e6eb;
  border-radius: 0;
  padding: 0px 0 8px 0;
  box-shadow: none;
  align-self: stretch;
  position: sticky;
  top: 0;
}
.users-content {
  flex: 1;
  padding-top: 5px;
}
.users-sidebar :deep(.t-menu) {
  border: none;
  background: transparent;
  height: 100%;
}
.users-sidebar :deep(.t-submenu__title) {
  border-radius: 4px;
  padding: 4px 6px;
  margin-bottom: 2px;
}
.users-sidebar :deep(.t-menu__item) {
  border-radius: 4px;
  margin: 2px 0;
  padding: 2px 4px;
}
.users-sidebar :deep(.t-menu__item.is-active) {
  background-color: #e8f3ff;
  color: #0052d9;
}
.users-sidebar :deep(.t-submenu__content) {
  padding-top: 2px;
  padding-left: 20px;
}
.users-sidebar :deep(.t-submenu__content .t-menu__item) {
  margin-left: 8px;
  padding-left: 12px;
}
.users-sidebar :deep(.users-menu .t-submenu__content) {
  padding-left: 24px !important;
}
.users-sidebar :deep(.users-menu .t-submenu__content .t-menu__item) {
  margin-left: 12px !important;
  padding-left: 12px !important;
}
.users-sidebar :deep(.users-menu .t-submenu__content .t-menu__item-link) {
  margin-left: 16px !important;
}
</style>
