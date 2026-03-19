<template>
  <div class="edit-popup">
    <t-form
      ref="formRef"
      :data="formData"
      :rules="rules"
      label-width="170px"
      @submit="handleSubmit"
    >
      <t-form-item label="Organization name" name="name">
        <t-input
          v-model="formData.name"
          placeholder="e.g., R&D Dept 1"
          clearable
        />
      </t-form-item>

      <!-- <t-form-item label="Org code" name="code">
        <t-input v-model="formData.code" placeholder="e.g., RND1" clearable />
      </t-form-item> -->

      <t-form-item label="Org type" name="type">
        <t-select v-model="formData.type" clearable>
          <t-option value="COMPANY" label="COMPANY" />
          <t-option value="BU" label="BU" />
          <t-option value="DEPT" label="DEPT" />
          <t-option value="TEAM" label="TEAM" />
        </t-select>
      </t-form-item>

      <t-form-item label="Status" name="status">
        <t-select v-model="formData.status" clearable>
          <t-option :value="1" label="ACTIVE" />
          <t-option :value="0" label="DISABLED" />
        </t-select>
      </t-form-item>

      <t-form-item label="Parent organization" name="parentId">
        <OrgTreeSelect
          v-model="formData.parentId"
          placeholder="(None, as root)"
        />
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { queryUcOrgPositionsByOrgId } from '@/api/modules/org'
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import {
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Select as TSelect,
  Option as TOption,
} from 'tdesign-vue-next'
import OrgTreeSelect from '@/components/OrgTreeSelect.vue'

interface OrgFormData {
  name: string | undefined
  code: string | undefined
  type: string | undefined
  status: number | undefined
  parentId: string | number | undefined
}

interface Props {
  modelValue?: any
  orgTreeData?: any[]
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  isEdit: false,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref()
const formData = reactive<OrgFormData>({
  name: undefined,
  code: undefined,
  type: undefined,
  status: undefined,
  parentId: undefined,
})

// 延迟赋值 rules，避免组件初始化时触发校验
const rules: any = {
  name: [
    {
      required: true,
      message: 'Organization name is required',
      trigger: 'blur',
    },
  ],
  //   code: [{ required: true, message: 'Org code is required', trigger: 'blur' }],
  type: [
    { required: true, message: 'Org type is required', trigger: 'change' },
  ],
  status: [
    {
      required: true,
      message: 'Status is required',
      trigger: 'change',
    },
  ],
}

onMounted(() => {
  // 延迟启用校验规则
})

// 重置表单函数
const resetForm = () => {
  formData.name = undefined
  formData.code = undefined
  formData.type = undefined
  formData.status = undefined
  formData.parentId = undefined
  // 使用 nextTick 确保 DOM 更新后再清除校验
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 监听外部传入的数据，用于编辑模式
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      formData.name = newValue.name || undefined
      formData.code = newValue.code || undefined
      formData.type = newValue.type || undefined
      formData.status =
        newValue.status !== undefined ? Number(newValue.status) : undefined
      formData.parentId = newValue.parentId || undefined
    } else {
      // 重置表单
      resetForm()
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  formRef.value.validate().then((result: any) => {
    if (result === true) {
      emit('submit', { ...formData })
    }
  })
}

const validate = () => {
  return formRef.value.validate()
}

defineExpose({
  validate,
  handleSubmit,
  resetForm,
})
</script>

<style scoped lang="less">
.edit-popup {
  padding: 8px 0;

  .form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

:deep(.t-form__item) {
  margin-bottom: 20px;
}
</style>
