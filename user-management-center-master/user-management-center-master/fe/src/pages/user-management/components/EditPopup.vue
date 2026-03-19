<template>
  <div class="edit-popup">
    <t-loading :loading="loading" style="min-height: 400px">
      <t-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        label-align="top"
        class="user-form"
        style="overflow-x: hidden"
      >
        <t-row :gutter="16">
          <t-col :span="6">
            <t-form-item label="Display name" name="displayName">
              <t-input
                v-model="formData.displayName"
                placeholder="e.g., John Doe"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Full name" name="fullName" required>
              <t-input
                v-model="formData.fullName"
                placeholder="e.g., John Doe (can be same as display name)"
              />
            </t-form-item>
          </t-col>
          <!-- <t-col v-if="false" :span="6">
            <t-form-item label="Username" name="username">
              <t-input
                v-model="formData.username"
                placeholder="e.g., johndoe"
              />
            </t-form-item>
          </t-col> -->
          <!-- <t-col :span="6">
          <t-form-item label="Employee No." name="empNo">
            <t-input v-model="formData.empNo" placeholder="e.g., WB0123" />
          </t-form-item>
        </t-col> -->
          <t-col :span="6">
            <t-form-item label="Gender" name="gender">
              <t-select v-model="formData.gender" placeholder="Select gender">
                <t-option
                  v-for="option in userGenderOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Country" name="country">
              <t-select
                v-model="formData.country"
                placeholder="Select country"
                :disabled="!!userType"
              >
                <t-option value="CN" label="CN" />
                <t-option value="US" label="US" />
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="ID number (masked)" name="idNumber">
              <t-input
                v-model="formData.idNumber"
                placeholder="e.g., 110xxxxxxxxxxxx1234"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Mobile" name="mobile">
              <t-input
                v-model="formData.mobile"
                placeholder="e.g., +86 13800000000 (sample)"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Email" name="email">
              <t-input
                v-model="formData.email"
                placeholder="e.g., name@wanbridge.com"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="User status" name="status">
              <t-select v-model="formData.status" placeholder="Select status">
                <t-option
                  v-for="option in userStatusOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Primary org" name="primaryOrgId">
              <OrgTreeSelect
                v-model="formData.primaryOrgId"
                placeholder="Select organization"
                @change="handleOrgChange"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Position" name="positionId">
              <t-select
                v-model="formData.positionId"
                placeholder="(Not selected)"
                clearable
                :disabled="!formData.primaryOrgId"
              >
                <t-option
                  v-for="pos in positionList"
                  :key="pos.positionId"
                  :value="pos.positionId"
                  :label="pos.positionName"
                />
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Source" name="identitySource">
              <t-select
                v-model="formData.identitySource"
                placeholder="Select  source"
                :disabled="!!userType"
              >
                <t-option value="LOCAL" label="LOCAL" />
                <t-option value="EXTERNAL_PARTNER" label="EXTERNAL_PARTNER" />
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="Hire date" name="hireDate">
              <t-date-picker
                style="width: 100%"
                v-model="formData.hireDate"
                placeholder="Select hire date"
                mode="date"
                clearable
              />
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </t-loading>
  </div>
</template>

<script setup lang="ts">
import { queryUcOrgPositionsByOrgId } from '@/api/modules/org'
import OrgTreeSelect from '@/components/OrgTreeSelect.vue'
import { userGenderOptions, userStatusOptions } from '@/constants/index'
import type { FormInstanceFunctions, FormRules } from 'tdesign-vue-next'
import {
  Col as TCol,
  DatePicker as TDatePicker,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Option as TOption,
  Row as TRow,
  Select as TSelect,
} from 'tdesign-vue-next'
import { computed, reactive, ref, watch } from 'vue'
interface UserFormData {
  id?: string
  displayName: string | undefined
  fullName: string | undefined
  //username: string | undefined
  //   empNo: string | undefined
  gender: string | undefined
  country: string | undefined
  idNumber: string | undefined
  mobile: string | undefined
  email: string | undefined
  status: string | undefined
  primaryOrgId: string | undefined
  positionId: string | undefined

  identitySource: string | undefined
  hireDate: string | undefined
}

interface Props {
  isEdit?: boolean
  userType?: string // 用户类型：domestic/overseas/external
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  userType: '',
})

const emit = defineEmits(['submit'])
const loading = ref(false)
const formRef = ref<FormInstanceFunctions>()

// userType 预设配置
const userTypePresets: Record<
  string,
  { country: string; identitySource: string }
> = {
  domestic: { country: 'CN', identitySource: 'LOCAL' },
  overseas: { country: 'US', identitySource: 'LOCAL' },
  external: { country: 'US', identitySource: 'EXTERNAL_PARTNER' },
}

// 根据 userType 计算默认值
const defaultCountry = computed(() => {
  if (props.userType && userTypePresets[props.userType]) {
    return userTypePresets[props.userType].country
  }
  return undefined
})

const defaultIdentitySource = computed(() => {
  if (props.userType && userTypePresets[props.userType]) {
    return userTypePresets[props.userType].identitySource
  }
  return undefined
})

// 表单数据
const formData = reactive<UserFormData>({
  displayName: undefined,
  fullName: undefined,
  // username: undefined,
  //   empNo: undefined,
  gender: undefined,
  country: undefined,
  idNumber: undefined,
  mobile: undefined,
  email: undefined,
  status: undefined,
  primaryOrgId: undefined,
  positionId: undefined,
  identitySource: undefined,
  hireDate: undefined,
})

// 表单校验规则
const formRules: FormRules<UserFormData> = {
  displayName: [{ required: true, message: 'Display name is required' }],
  fullName: [{ required: true, message: 'Full name is required' }],
  email: [{ email: true, message: 'Please enter a valid email address' }],
  mobile: [
    {
      pattern: /^\+?[\d\s\-()+]{7,20}$/,
      message: 'Please enter a valid phone number',
    },
  ],
  // username: [{ required: true, message: 'Username is required' }],
}

// 岗位列表
const positionList = ref<any[]>([])

// 重置表单
const resetForm = () => {
  formData.displayName = undefined
  formData.fullName = undefined
  //formData.username = undefined
  //   formData.empNo = undefined
  formData.gender = undefined
  // 如果有 userType，使用默认值；否则清空
  formData.country = defaultCountry.value
  formData.idNumber = undefined
  formData.mobile = undefined
  formData.email = undefined
  formData.status = undefined
  formData.primaryOrgId = undefined
  formData.positionId = undefined
  // 如果有 userType，使用默认值；否则清空
  formData.identitySource = defaultIdentitySource.value
  formData.hireDate = undefined
  positionList.value = []
}

// 监听 userType 变化，更新默认值
watch(
  () => props.userType,
  (newUserType) => {
    if (newUserType && userTypePresets[newUserType]) {
      formData.country = userTypePresets[newUserType].country
      formData.identitySource = userTypePresets[newUserType].identitySource
    }
  },
  { immediate: true }
)

// 设置表单数据（支持部分更新）
const setFormData = async (data: any, isPartialUpdate = false) => {
  loading.value = true
  if (data) {
    // 部分更新模式：只更新传入的字段
    if (isPartialUpdate) {
      if (data.country !== undefined) formData.country = data.country
      if (data.identitySource !== undefined)
        formData.identitySource = data.identitySource
      if (data.displayName !== undefined)
        formData.displayName = data.displayName
      if (data.fullName !== undefined) formData.fullName = data.fullName
      if (data.gender !== undefined) formData.gender = data.gender
      if (data.idNumber !== undefined) formData.idNumber = data.idNumber
      if (data.mobile !== undefined) formData.mobile = data.mobile
      if (data.email !== undefined) formData.email = data.email
      if (data.status !== undefined) formData.status = data.status
      if (data.primaryOrgId !== undefined)
        formData.primaryOrgId = data.primaryOrgId
      if (data.positionId !== undefined) formData.positionId = data.positionId
      if (data.hireDate !== undefined) formData.hireDate = data.hireDate
    } else {
      // 完整更新模式：设置所有字段
      formData.displayName = data.displayName || undefined
      formData.fullName = data.fullName || undefined
      formData.gender = data.gender || undefined
      formData.country = data.country || undefined
      formData.idNumber = data.idNumber || ''
      formData.mobile = data.mobile || ''
      formData.email = data.email || ''
      formData.status = data.status || undefined
      formData.primaryOrgId = data.primaryOrgId || ''
      formData.identitySource = data.identitySource || undefined
      formData.hireDate = data.hireDate || undefined
      // 先加载 position 列表，再设置 positionId
      if (formData.primaryOrgId) {
        await loadPositions(formData.primaryOrgId)
      }
      formData.positionId = data.positionId || undefined
    }
  } else {
    resetForm()
  }
  loading.value = false
}

// 组织变化时加载岗位
const handleOrgChange = (value: string | number | undefined) => {
  formData.positionId = undefined

  if (value) {
    loadPositions(value)
  } else {
    positionList.value = []
  }
}

// 加载岗位列表
const loadPositions = async (orgId: string | number) => {
  try {
    const res = await queryUcOrgPositionsByOrgId(Number(orgId))
    positionList.value = res || []
  } catch (err) {
    console.error('Failed to load positions:', err)
    positionList.value = []
  }
}

// 提交表单
const handleSubmit = () => {
  let positionTitle =
    positionList.value.find((pos) => pos.positionId === formData.positionId)
      ?.positionName || undefined

  let data = { ...formData, positionTitle }

  emit('submit', data)
}

const validate = () => {
  return formRef.value?.validate()
}

defineExpose({
  validate,
  handleSubmit,
  resetForm,
  setFormData,
})
</script>

<style scoped lang="less">
.edit-popup {
  padding: 8px 0;
}

.user-form {
  .form-tip {
    font-size: 12px;
    color: #999;
    margin: 4px 0 0 0;
    line-height: 1.4;
  }

  .notes-content {
    font-size: 12px;
    color: #666;
    line-height: 1.6;

    p {
      margin: 0 0 4px 0;
    }

    strong {
      color: #333;
    }
  }
}
</style>
