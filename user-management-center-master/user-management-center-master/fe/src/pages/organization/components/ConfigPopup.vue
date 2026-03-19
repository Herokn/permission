<template>
  <div class="config-popup">
    <div class="org-path">{{ orgPath }}</div>

    <div class="config-content">
      <div class="positions-list">
        <h3 class="list-title">Positions list</h3>
        <div class="checkbox-list">
          <t-loading :loading="loading">
            <t-checkbox-group v-model="selectedPositionIds">
              <t-checkbox
                v-for="position in availablePositions"
                :key="position.id"
                :value="position.id"
                :label="position.positionName"
              />
            </t-checkbox-group>
          </t-loading>
        </div>
      </div>

      <div class="selected-panel">
        <h3 class="panel-title">Selected positions</h3>
        <p class="panel-subtitle">
          Used for the position dropdown and permission attributes.
        </p>
        <div class="selected-tags">
          <t-tag
            v-for="pos in selectedPositionsList"
            :key="pos.id"
            closable
            variant="outline"
            @close="handleRemovePosition(pos)"
          >
            {{ pos.positionName }}
          </t-tag>
          <div v-if="!selectedPositionsList.length" class="empty-hint">
            No positions selected
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  CheckboxGroup as TCheckboxGroup,
  Checkbox as TCheckbox,
  Tag as TTag,
  Loading as TLoading,
} from 'tdesign-vue-next'
import { listPositionsWithOrgFlag_Api } from '@/api/modules/org'

// 岗位接口数据类型
interface PositionItem {
  id: number
  tenantId?: number
  positionCode?: string
  positionName: string
  positionLevel?: string
  description?: string
  status?: string
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  extJson?: string
  belongsToOrg?: boolean
}

interface Props {
  orgPath?: string
  orgId?: number
}

const props = withDefaults(defineProps<Props>(), {
  orgPath: '',
  orgId: 0,
})

const emit = defineEmits(['submit'])

// 使用 defineModel 简化双向绑定
const selectedPositionIds = defineModel<number[]>({ default: [] })

const loading = ref(false)

// 可用岗位列表（从接口获取）
const availablePositions = ref<PositionItem[]>([])

// 加载岗位列表
const loadPositions = async (orgId: number) => {
  if (!orgId) return
  loading.value = true
  try {
    const res = await listPositionsWithOrgFlag_Api({ orgId })
    availablePositions.value = res || []
  } catch (err) {
    console.error('Failed to load positions:', err)
    availablePositions.value = []
  } finally {
    loading.value = false
  }
}

// 监听 orgId 变化，加载岗位列表
watch(
  () => props.orgId,
  (newOrgId) => {
    if (newOrgId) {
      loadPositions(newOrgId)
    }
  },
  { immediate: true }
)

// 已选岗位列表（完整对象）
const selectedPositionsList = computed<PositionItem[]>(() => {
  return availablePositions.value.filter((pos) =>
    selectedPositionIds.value.includes(pos.id)
  )
})

// 移除岗位
const handleRemovePosition = (position: PositionItem) => {
  selectedPositionIds.value = selectedPositionIds.value.filter(
    (id) => id !== position.id
  )
}

const submit = () => {
  // 提交选中的岗位 ID 列表
  emit('submit', selectedPositionIds.value)
}

defineExpose({
  submit,
})
</script>

<style scoped lang="less">
.config-popup {
  padding: 8px 0;

  .org-path {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .config-content {
    display: flex;
    gap: 24px;
    min-height: 400px;
  }

  .positions-list {
    flex: 1;
    border-right: 1px solid #eee;
    padding-right: 24px;

    .list-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px 0;
    }

    .checkbox-list {
      max-height: 400px;
      overflow-y: auto;

      :deep(.t-checkbox-group) {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    }
  }

  .selected-panel {
    flex: 1;

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0 0 4px 0;
    }

    .panel-subtitle {
      font-size: 12px;
      color: #999;
      margin: 0 0 16px 0;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      min-height: 100px;

      .empty-hint {
        color: #999;
        font-size: 12px;
      }
    }
  }
}
</style>
