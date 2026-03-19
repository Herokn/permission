<template>
  <t-dialog
    :visible="visible"
    :header="isEdit ? 'Edit position' : 'Add position'"
    width="800px"
    @close="handleCancel"
  >
    <t-form
      ref="formRef"
      :data="formData"
      :rules="rules"
      label-align="top"
      @submit="handleSubmit"
    >
      <div class="form-row">
        <t-form-item
          label="Position name"
          name="positionName"
          class="form-item"
        >
          <t-input
            v-model="formData.positionName"
            placeholder="e.g., Java Backend Engineer"
          />
        </t-form-item>
        <t-form-item
          v-if="isEdit"
          label="Position code (unique within tenant)"
          name="positionCode"
          class="form-item"
        >
          <t-input
            v-model="formData.positionCode"
            placeholder="e.g., JAVA_DEV"
            disabled
          />
        </t-form-item>
      </div>

      <div class="form-row">
        <t-form-item
          label="Level (optional)"
          name="positionLevel"
          class="form-item"
        >
          <t-input
            v-model="formData.positionLevel"
            placeholder="e.g., P6 / P7 / L2"
          />
        </t-form-item>
        <t-form-item label="Status" name="status" class="form-item">
          <t-select v-model="formData.status" :options="statusOptions" />
        </t-form-item>
      </div>

      <t-form-item label="Notes" name="description">
        <t-textarea
          v-model="formData.description"
          placeholder="Optional"
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </t-form-item>

      <div class="time-format-tip">
        Time format: UTC + ISO8601 string (suffix Z), e.g.,
        {{ currentTimeExample }}
      </div>
    </t-form>

    <template #footer>
      <div style="text-align: right">
        <t-button theme="default" @click="handleCancel">Cancel</t-button>
        <t-button theme="primary" :loading="saving" @click="handleSubmit"
          >Save</t-button
        >
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { addPosition, modifyPositionById } from '@/api/modules/position'
import type { Position, PositionFormRequest } from '@/types/api/users/position'
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next'
import {
  MessagePlugin,
  Button as TButton,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Select as TSelect,
  Textarea as TTextarea,
} from 'tdesign-vue-next'

interface Props {
  visible: boolean
  position: Position | null
  isEdit: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

// State
const formRef = ref<FormInstanceFunctions>()
const saving = ref(false)

const formData = reactive<PositionFormRequest>({
  positionCode: '',
  positionName: '',
  positionLevel: '',
  description: '',
  status: 1, // 1=ACTIVE, 0=DISABLED
})

// Status options
const statusOptions = [
  { label: 'ACTIVE', value: 1 },
  { label: 'DISABLED', value: 0 },
]

// Validation rules - dynamic based on isEdit
const getRules = () => {
  const baseRules: Record<string, FormRule[]> = {
    positionName: [
      { required: true, message: 'Please input position name', type: 'error' },
    ],
    status: [
      { required: true, message: 'Please select status', type: 'error' },
    ],
  }

  // Only require positionCode when adding (not editing)
  if (!props.isEdit) {
    baseRules.positionCode = [
      { required: true, message: 'Please input position code', type: 'error' },
      {
        pattern: /^[A-Z0-9_]+$/,
        message:
          'Position code should contain only uppercase letters, numbers and underscores',
        type: 'error',
      },
    ]
  }

  return baseRules
}

const rules = computed(() => getRules())

// Computed
const currentTimeExample = computed(() => {
  return new Date().toISOString()
})

// Methods
const resetForm = () => {
  formData.id = undefined
  formData.positionCode = ''
  formData.positionName = ''
  formData.positionLevel = ''
  formData.description = ''
  formData.status = 1 // 1=ACTIVE
  formRef.value?.clearValidate()
}

const loadPositionData = () => {
  if (props.position) {
    formData.id = props.position.id
    formData.positionCode = props.position.positionCode
    formData.positionName = props.position.positionName
    formData.positionLevel = props.position.positionLevel || ''
    formData.description = props.position.description || ''
    formData.status = props.position.status
  } else {
    resetForm()
  }
}

const handleCancel = () => {
  emit('update:visible', false)
  resetForm()
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    saving.value = true

    if (props.isEdit) {
      await modifyPositionById(formData)
      MessagePlugin.success('Position updated successfully')
    } else {
      await addPosition({ ...formData, tenantId: 1 })
      MessagePlugin.success('Position added successfully')
    }

    emit('success')
    handleCancel()
  } catch (error: any) {
    if (error.errorFields) {
      // Form validation error
      return
    }
    MessagePlugin.error(
      props.isEdit ? 'Failed to update position' : 'Failed to add position'
    )
    console.error('Error saving position:', error)
  } finally {
    saving.value = false
  }
}

// Watch
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadPositionData()
    }
  }
)
</script>

<style scoped lang="less">
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 0;

  .form-item {
    flex: 1;
    min-width: 0;
  }
}

.time-format-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}
</style>
