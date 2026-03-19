<template>
  <div class="change-password">
    <t-form ref="formRef" :data="formData" :rules="rules" label-align="top" label-width="140px" @submit="onSubmit">
      <t-form-item :label="t('pages.user.form.oldPassword')" name="currentPassword">
        <t-input
          v-model="formData.currentPassword"
          type="password"
          :placeholder="t('pages.user.form.oldPasswordPlaceholder')"
          clearable
        />
      </t-form-item>

      <t-form-item class="password-form-item" :label="t('pages.user.form.newPassword')" name="newPassword">
        <t-input
          v-model="formData.newPassword"
          type="password"
          :placeholder="t('pages.user.form.newPasswordPlaceholder')"
          clearable
        />
      </t-form-item>

      <t-form-item :label="t('pages.user.form.confirmPassword')" name="confirmPassword">
        <t-input
          v-model="formData.confirmPassword"
          type="password"
          :placeholder="t('pages.user.form.confirmPasswordPlaceholder')"
          clearable
        />
      </t-form-item>

      <t-form-item>
        <t-space>
          <t-button theme="primary" type="submit" :loading="loading">
            {{ t('pages.user.form.submit') }}
          </t-button>
        </t-space>
      </t-form-item>
    </t-form>
    <div class="mt-3" style="margin-top: 24px;">
      <t-alert theme="warning" close-btn>
        <template #title>
          <h4>{{ t('pages.user.form.passwordRequirementsTitle') }}</h4>
        </template>
        <template #message>
          <ul>
            <li v-for="(_, index) in new Array(5).fill(0)" :key="index" class="text-xs">
              · {{ t('pages.user.form.passwordRequirementsDescList.' + index) }}
            </li>
          </ul>
        </template>
      </t-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin, SubmitContext } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { changePassword } from '@/api/modules/auth';
import { useUserStore } from '@/stores';

defineOptions({
  name: 'ChangePassword',
});

const { t } = useI18n();

const formRef = ref();
const loading = ref(false);

const emit = defineEmits(['success']);
// 表单数据
const formData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const userStore = useUserStore();

// 表单验证规则
const rules = {
  currentPassword: [{ required: true, message: t('pages.user.form.oldPasswordRequired'), type: 'error' as const }],
  newPassword: [
    { required: true, message: 'New password is required', type: 'error' as const },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long',
      type: 'error' as const
    },
  ],
  confirmPassword: [
    { required: true, message: t('pages.user.form.confirmPasswordRequired'), type: 'error' as const },
    {
      validator: (val: string) => val === formData.newPassword,
      message: t('pages.user.form.passwordMismatch'),
      type: 'error' as const
    },
  ],
};

// 提交表单
const onSubmit = async (ctx: SubmitContext) => {
  // validateResult === true 才是完全验证通过
  if (ctx.validateResult !== true) {
    MessagePlugin.error('Please fix form validation errors');
    return;
  }

  loading.value = true;
  try {
    const response = await changePassword({
      oldPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
      userId: userStore.userInfo.userId || '',
    });

    if (response?.success) {
      MessagePlugin.success(t('pages.user.message.passwordChangeSuccess'));
      emit('success');
      resetForm();
    } else {
      MessagePlugin.error(response?.message || t('pages.user.message.passwordChangeError'));
    }
  } catch (error: any) {
    console.error('修改密码失败:', error);
    MessagePlugin.error(error.message || t('pages.user.message.passwordChangeError'));
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.reset();
  formData.currentPassword = '';
  formData.newPassword = '';
  formData.confirmPassword = '';
};
</script>

<style lang="less" scoped>
.change-password {
  max-width: 600px;
  padding: 24px;
  background-color: #fff;
}
.password-form-item {
  margin-bottom: var(--td-size-10);
}
</style>
