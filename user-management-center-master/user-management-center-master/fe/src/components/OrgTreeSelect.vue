<template>
  <t-tree-select
    :model-value="modelValue"
    :data="orgTreeList"
    clearable
    :placeholder="placeholder"
    filterable
    :tree-props="{
      keys: { value: 'id', label: 'orgName', children: 'children' },
    }"
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { TreeSelect as TTreeSelect } from 'tdesign-vue-next'
import { useOrgStore } from '@/stores/modules/organization'

interface Props {
  modelValue?: string | number | undefined
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: 'Select organization',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | undefined): void
  (e: 'change', value: string | number | undefined): void
}>()

const orgStore = useOrgStore()

// 使用 store 中的组织树数据
const orgTreeList = computed(() => orgStore.getOrgTreeList)

// 组件挂载时加载数据
onMounted(() => {
  orgStore.setOrgTreeList(true)
})

// 更新值
const handleUpdate = (value: string | number | undefined) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
