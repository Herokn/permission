<template>
  <t-drawer
    v-model:visible="drawerVisible"
    :header="drawerTitle"
    size="580px"
    :footer="true"
    :closeBtn="true"
    @close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <div class="user-info">
          <span class="user-name">{{ detailData?.user?.displayName }}</span>
          <span class="user-code">{{ detailData?.user?.userCode }}</span>
          <t-tag
            :theme="detailData?.user?.status === 1 ? 'success' : 'default'"
            variant="light"
            size="small"
          >
            {{ detailData?.user?.status === 1 ? 'ACTIVE' : 'DISABLED' }}
          </t-tag>
        </div>
        <div class="header-actions">
          <t-tag
            :theme="detailData?.user?.status === 1 ? 'success' : 'default'"
            variant="outline"
          >
            {{ detailData?.user?.status === 1 ? 'ACTIVE' : 'DISABLED' }}
          </t-tag>
          <t-button variant="outline" size="small" @click="handleEdit">
            <template #icon><t-icon name="edit" /></template>
            Edit
          </t-button>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="drawer-footer">
        <t-button variant="outline" @click="handleClose">Cancel</t-button>
      </div>
    </template>

    <t-loading :loading="loading" style="min-height: 200px">
      <t-tabs v-model="activeTab">
        <t-tab-panel value="basic" label="Basic">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">Employee No.</span>
              <span class="detail-value">{{
                detailData?.userTenant?.employeeNo || '-'
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Username</span>
              <span class="detail-value">{{
                detailData?.user?.userCode || '-'
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Name / Full name</span>
              <span class="detail-value">
                {{ detailData?.user?.displayName || '-' }} /
                {{ detailData?.user?.fullName || '-' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Gender</span>
              <span class="detail-value">{{ genderText }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Country</span>
              <span class="detail-value">{{
                detailData?.user?.countryCode || '-'
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ID number</span>
              <span class="detail-value">{{
                maskIdNumber(detailData?.user?.idNo)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Mobile</span>
              <span class="detail-value">{{
                maskMobile(detailData?.user?.mobile)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{
                detailData?.user?.email || '-'
              }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Hire Date</span>
              <span class="detail-value">{{
                formatUTCToLocal(detailData?.userTenant?.hireDate, 'date')
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Created/Updated (UTC)</span>
              <span class="detail-value">
                {{ formatDateTime(detailData?.user?.createdAt) }} /
                {{ formatDateTime(detailData?.user?.updatedAt) }}
              </span>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="org" label="Org & Position">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">Primary org</span>
              <span class="detail-value">{{
                getOrgTreePath(detailData?.mainOrgTree)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Position</span>
              <span class="detail-value">{{
                detailData?.userOrgRel?.positionTitle || '-'
              }}</span>
            </div>
            <div class="detail-row note-row">
              <span class="detail-note">
                Note: Position options come from org position configuration. If
                a position is disabled or removed, it shows as "(Position
                inactive)".
              </span>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel v-if="false" value="identities" label="Identities">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">Identity Source</span>
              <span class="detail-value">{{
                detailData?.user?.identitySource || '-'
              }}</span>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel v-if="false" value="audit" label="Audit">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">Created By</span>
              <span class="detail-value">{{
                detailData?.user?.createdBy || '-'
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Created At</span>
              <span class="detail-value">{{
                formatDateTime(detailData?.user?.createdAt)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Updated By</span>
              <span class="detail-value">{{
                detailData?.user?.updatedBy || '-'
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Updated At</span>
              <span class="detail-value">{{
                formatDateTime(detailData?.user?.updatedAt)
              }}</span>
            </div>
          </div>
        </t-tab-panel>
      </t-tabs>
    </t-loading>
  </t-drawer>
</template>

<script setup lang="ts">
import { getUserDetail_Api } from '@/api/modules/user'
import { userGenderOptions } from '@/constants/index'
import { formatUTCToLocal } from '@/utils/date'
import { getOrgTreePath } from '@/utils/tool'
import {
  Button as TButton,
  Drawer as TDrawer,
  Icon as TIcon,
  Loading as TLoading,
  TabPanel as TTabPanel,
  Tabs as TTabs,
  Tag as TTag,
} from 'tdesign-vue-next'
import { computed, ref } from 'vue'

const emit = defineEmits<{
  (e: 'edit', data: any): void
}>()

// 抽屉状态
const drawerVisible = ref(false)
const loading = ref(false)
const activeTab = ref('basic')
const detailData = ref<any>(null)

// 抽屉标题
const drawerTitle = computed(() => {
  return detailData.value?.user?.displayName || 'User Details'
})

// 性别文本
const genderText = computed(() => {
  const gender = detailData.value?.user?.gender
  const option = userGenderOptions.find((opt: any) => opt.value === gender)
  return option?.label || '-'
})

// 格式化日期时间
const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  return formatUTCToLocal(dateStr, 'datetime')
}

// 手机号脱敏
const maskMobile = (mobile: string | null | undefined) => {
  if (!mobile) return '-'
  if (mobile.length >= 7) {
    return mobile.slice(0, 3) + '****' + mobile.slice(-4)
  }
  return mobile
}

// 身份证号脱敏
const maskIdNumber = (idNo: string | null | undefined) => {
  if (!idNo) return '-'
  if (idNo.length >= 8) {
    return idNo.slice(0, 3) + '************' + idNo.slice(-4)
  }
  return idNo
}

// 打开抽屉
const open = async (userId: number) => {
  drawerVisible.value = true
  activeTab.value = 'basic'
  loading.value = true

  try {
    const res = await getUserDetail_Api(userId)
    detailData.value = res
  } catch (err) {
    console.error('Failed to load user detail:', err)
  } finally {
    loading.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  drawerVisible.value = false
  detailData.value = null
}

// 点击编辑
const handleEdit = () => {
  emit('edit', detailData.value)
  handleClose()
}

// 暴露方法
defineExpose({
  open,
})
</script>

<style scoped lang="less">
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .user-code {
      font-size: 14px;
      color: #666;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.detail-content {
  padding: 16px 0;
}

.detail-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .detail-label {
    flex: 0 0 160px;
    font-size: 14px;
    color: #666;
  }

  .detail-value {
    flex: 1;
    font-size: 14px;
    color: #333;
    word-break: break-word;
  }
}

.note-row {
  flex-direction: column;

  .detail-note {
    font-size: 12px;
    color: #999;
    line-height: 1.6;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-start;
  padding: 0;
}
</style>
