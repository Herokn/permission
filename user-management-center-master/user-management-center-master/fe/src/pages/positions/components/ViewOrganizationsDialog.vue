<template>
  <t-dialog
    :visible="visible"
    :footer="false"
    :width="680"
    class="org-dialog"
    @close="handleCancel"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">
          Used by orgs: {{ props.position?.positionName || '' }}
        </h3>
        <div class="dialog-subtitle">
          Position code {{ props.position?.positionCode || '' }} · Total
          {{ orgCount }} orgs
        </div>
      </div>
    </template>

    <div class="org-dialog-content">
      <div class="org-description">
        Organizations that configured this position (sample):
      </div>

      <t-loading :loading="loading" size="medium">
        <t-list v-if="leafOrgs.length > 0" class="org-list" :split="true">
          <t-list-item v-for="org in leafOrgs" :key="org.id">
            <div class="org-item">
              <div class="org-header">
                <span class="org-name">{{ org.orgName }}</span>
                <span class="org-code-badge">{{ org.orgCode }}</span>
              </div>
              <div class="org-path">{{ org.path }}</div>
            </div>
          </t-list-item>
        </t-list>

        <div
          v-else-if="!loading"
          style="text-align: center; padding: 40px 0; color: #999"
        >
          No organizations configured for this position
        </div>
      </t-loading>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { queryOrgTreeByPositionId } from '@/api/modules/position'
import type { OrganizationTreeNode, Position } from '@/types/api/users/position'
import {
  MessagePlugin,
  Dialog as TDialog,
  List as TList,
  ListItem as TListItem,
  Loading as TLoading,
} from 'tdesign-vue-next'
import { computed, ref, watch } from 'vue'

interface Props {
  visible: boolean
  position: Position | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

// State
const loading = ref(false)
const orgTree = ref<OrganizationTreeNode[]>([])

// 存储叶子节点组织
interface LeafOrg {
  id: number
  orgName: string
  orgCode: string
  path: string
}

const leafOrgs = ref<LeafOrg[]>([])

// Computed
const orgCount = computed(() => leafOrgs.value.length)

// Methods
const fetchOrgTree = async () => {
  if (!props.position?.id) return

  try {
    loading.value = true
    const response = await queryOrgTreeByPositionId(props.position.id)
    orgTree.value = response
    leafOrgs.value = extractLeafOrgs(response)
  } catch (error) {
    MessagePlugin.error('Failed to fetch organization tree')
    console.error('Error fetching organization tree:', error)
  } finally {
    loading.value = false
  }
}

// 提取所有叶子节点组织（最末级组织）
const extractLeafOrgs = (
  nodes: OrganizationTreeNode[],
  parentPath: string[] = []
): LeafOrg[] => {
  const result: LeafOrg[] = []

  for (const node of nodes) {
    const currentPath = [...parentPath, node.orgName]

    // 如果没有子节点（或子节点为空），则为叶子节点
    if (!node.children || node.children.length === 0) {
      result.push({
        id: node.id,
        orgName: node.orgName,
        orgCode: node.orgCode,
        path: currentPath.join(' / '),
      })
    } else {
      // 如果有子节点，继续递归查找
      const childLeafs = extractLeafOrgs(node.children, currentPath)
      result.push(...childLeafs)
    }
  }

  return result
}

const handleCancel = () => {
  emit('update:visible', false)
}

// Watch
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.position) {
      fetchOrgTree()
    } else {
      orgTree.value = []
      leafOrgs.value = []
    }
  }
)
</script>

<style lang="less">
.org-dialog {
  .t-dialog {
    padding: 0 !important;
    padding-bottom: 36px !important;
  }
  .t-dialog__header {
    padding: 20px !important;
    padding-bottom: 10px !important;
    border-bottom: 1px solid var(--td-component-stroke) !important;
  }

  .t-dialog__body {
    padding: 20px !important;
    padding-top: 10px !important;
  }
}
</style>

<style scoped lang="less">
.dialog-header {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 8px 0;
  }

  .dialog-subtitle {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin: 0;
    font-weight: 400;
  }
}

.org-dialog-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;

  .org-description {
    margin: 0;
    font-size: 14px;
    flex-shrink: 0;
  }

  .org-list {
    flex: 1;
    padding: 0;
    margin: 0;

    :deep(.t-list-item) {
      padding: 0;
    }

    .org-item {
      padding: 10px 0;
      .org-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .org-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--td-text-color-primary);
        }

        .org-code-badge {
          padding: 2px 8px;
          background: var(--td-bg-color-component);
          color: var(--td-text-color-secondary);
          font-size: 12px;
          border-radius: 2px;
          font-weight: 500;
        }
      }

      .org-path {
        color: var(--td-text-color-placeholder);
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }
}
</style>
