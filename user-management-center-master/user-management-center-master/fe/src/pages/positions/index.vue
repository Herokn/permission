<template>
  <div class="positions-page">
    <!-- Header and Search Card -->
    <t-card class="header-search-card">
      <!-- Header Section -->
      <div class="page-header">
        <h1 class="page-title">Positions</h1>
        <p class="page-description">
          Maintain a position catalog and configure available positions per org
          (different departments can differ).
        </p>
        <div class="header-actions">
          <t-button theme="primary" @click="handleAddPosition">
            <template #icon>
              <add-icon />
            </template>
            Add position
          </t-button>
          <span class="total-count">Total {{ pagination.total }} items</span>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-section">
        <t-form layout="inline" labelWidth="0" class="search-form">
          <t-form-item>
            <t-input
              v-model="searchParams.search"
              placeholder="Search: position name / code"
              clearable
              style="width: 240px"
              @enter="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix-icon>
                <search-icon />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item>
            <t-select
              v-model="searchParams.status"
              placeholder="All statuses"
              clearable
              style="width: 160px"
              :options="statusOptions"
            />
            <t-button theme="primary" @click="handleSearch" class="ml-16px">
              <template #icon>
                <search-icon />
              </template>
              Search
            </t-button>
          </t-form-item>

          <!-- <t-form-item class="tip-form-item">
            <span class="tip-message">
              Tip: disabling positions does not delete them, preserving audit
              history and org configuration.
            </span>
          </t-form-item> -->
        </t-form>
      </div>
    </t-card>

    <!-- Positions List Card -->
    <t-card class="positions-list-card">
      <!-- Positions List Section -->
      <div class="positions-list">
        <div class="list-header">
          <h3>Positions list</h3>
          <t-tag theme="primary" variant="light" size="small" class="mvp-badge"
            >MVP</t-tag
          >
        </div>
        <p class="list-description">
          Fields: name/code/level/status/updatedAt. You can see which orgs are
          using a position.
        </p>

        <t-table
          :data="positionList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          max-height="500"
          row-key="id"
          @page-change="handlePageChange"
        >
          <template #positionName="{ row }">
            <div class="position-info">
              <div class="position-name-text">{{ row.positionName }}</div>
              <div class="position-meta">
                {{ row.id }} · created {{ formatDate(row.createdAt) }}
              </div>
            </div>
          </template>

          <template #status="{ row }">
            <t-tag
              :theme="row.status === 1 ? 'success' : 'default'"
              variant="light"
            >
              {{ row.status === 1 ? 'Active' : 'Disabled' }}
            </t-tag>
          </template>

          <template #updatedAt="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>

          <template #usedByOrgs="{ row }">
            <t-link theme="primary" @click="handleViewOrgs(row)">
              View details{{ row.orgCount ? `(${row.orgCount})` : '' }}
            </t-link>
          </template>

          <template #actions="{ row }">
            <t-space>
              <t-link theme="primary" @click="handleEdit(row)">Edit</t-link>
              <t-popconfirm
                :content="
                  row.status === 1
                    ? 'Are you sure you want to disable this position?'
                    : 'Are you sure you want to enable this position?'
                "
                @confirm="handleToggleStatus(row)"
              >
                <t-link :theme="row.status === 1 ? 'danger' : 'primary'">
                  {{ row.status === 1 ? 'Disable' : 'Enable' }}
                </t-link>
              </t-popconfirm>
            </t-space>
          </template>
        </t-table>
      </div>
    </t-card>

    <!-- Dialogs -->
    <add-edit-position-dialog
      v-model:visible="dialogVisible"
      :position="currentPosition"
      :is-edit="isEditMode"
      @success="fetchData"
    />

    <view-organizations-dialog
      v-model:visible="orgDialogVisible"
      :position="currentPosition"
    />
  </div>
</template>

<script setup lang="ts">
import {
  disablePositionById,
  enablePositionById,
  queryPagePositions,
  queryPositionById,
} from '@/api/modules/position'
import type { Position, PositionQueryRequest } from '@/types/api/users/position'
import { formatUTCToLocal } from '@/utils/date'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import type { PageInfo, PrimaryTableCol } from 'tdesign-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { onMounted, reactive, ref } from 'vue'
import AddEditPositionDialog from './components/AddEditPositionDialog.vue'
import ViewOrganizationsDialog from './components/ViewOrganizationsDialog.vue'

// State
const loading = ref(false)
const positionList = ref<Position[]>([])

const searchParams = reactive({
  search: '',
  status: '' as number | '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
})

// Dialog State
const dialogVisible = ref(false)
const orgDialogVisible = ref(false)
const isEditMode = ref(false)
const currentPosition = ref<Position | null>(null)

// Constants
const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 1 },
  { label: 'Disabled', value: 0 },
]

const columns: PrimaryTableCol<Position>[] = [
  {
    colKey: 'positionName',
    title: 'Position',
    width: 250,
  },
  {
    colKey: 'positionCode',
    title: 'Code',
    width: 100,
  },
  {
    colKey: 'positionLevel',
    title: 'Level',
    width: 80,
  },
  {
    colKey: 'status',
    title: 'Status',
    width: 80,
  },
  {
    colKey: 'updatedAt',
    title: 'Updated at',
    width: 200,
  },
  {
    colKey: 'usedByOrgs',
    title: 'Used by orgs',
    width: 130,
  },
  {
    colKey: 'actions',
    title: 'Actions',
    width: 150,
    fixed: 'right',
  },
]

// Methods
const fetchData = async () => {
  loading.value = true
  try {
    const params: PositionQueryRequest = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      search: searchParams.search,
      status: searchParams.status,
    }
    const res = await queryPagePositions(params)
    positionList.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('Failed to fetch positions:', error)
    MessagePlugin.error('Failed to load positions')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handlePageChange = (pageInfo: PageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

const handleAddPosition = () => {
  isEditMode.value = false
  currentPosition.value = null
  dialogVisible.value = true
}

const handleEdit = async (row: Position) => {
  try {
    isEditMode.value = true
    loading.value = true
    const res = await queryPositionById(row.id!)
    currentPosition.value = res
    dialogVisible.value = true
  } catch (error) {
    console.error('Failed to fetch position details:', error)
    MessagePlugin.error('Failed to load position details')
  } finally {
    loading.value = false
  }
}

const handleToggleStatus = async (row: Position) => {
  try {
    if (row.status === 1) {
      await disablePositionById(row.id!)
      MessagePlugin.success('Position disabled successfully')
    } else {
      await enablePositionById(row.id!)
      MessagePlugin.success('Position enabled successfully')
    }
    fetchData()
  } catch (error) {
    console.error('Failed to update status:', error)
    MessagePlugin.error('Failed to update status')
  }
}

const handleViewOrgs = (row: Position) => {
  currentPosition.value = row
  orgDialogVisible.value = true
}

const formatDate = (dateStr?: string) => {
  return formatUTCToLocal(dateStr, 'datetime')
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.positions-page {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .header-search-card {
    :deep(.t-card__body) {
      padding: 16px 24px 0px 24px;
    }
  }

  .positions-list-card {
    :deep(.t-card__body) {
      padding: 24px;
    }
  }

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--td-text-color-primary);
    }

    .page-description {
      color: var(--td-text-color-secondary);
      margin: 0 0 16px;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .total-count {
        color: var(--td-text-color-secondary);
        font-size: 14px;
      }
    }
  }

  .search-section {
    margin-bottom: 0;

    :deep(.search-form) {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;

      .t-form__item {
        margin-bottom: 0;
      }

      .tip-form-item {
        flex: 1;
        margin-left: auto;
        display: flex;
        margin-right: 0;
        justify-content: flex-end;
        min-width: 0;
      }
    }

    .tip-message {
      font-size: 12px;
      color: var(--td-text-color-placeholder);
      white-space: nowrap;
    }
  }

  :deep(.t-button) {
    border-radius: 6px;
  }

  .positions-list {
    .list-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .mvp-badge {
        font-size: 12px;
      }
    }

    .list-description {
      color: var(--td-text-color-placeholder);
      font-size: 12px;
      margin: 0 0 16px;
    }

    .position-info {
      .position-name-text {
        font-weight: 500;
        color: var(--td-text-color-primary);
      }

      .position-meta {
        font-size: 12px;
        color: var(--td-text-color-placeholder);
        margin-top: 4px;
      }
    }
  }
}
</style>
