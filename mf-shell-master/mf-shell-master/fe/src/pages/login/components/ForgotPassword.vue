<template>
  <t-dialog
    v-model:visible="visible"
    header="Forgot Password"
    :close-on-overlay-click="false"
    destroy-on-close
    placement="center"
    width="480px"
    :footer="false"
    class="forgot-password-dialog"
    @close="handleClose"
  >
    <t-form
      ref="form"
      class="forgot-password-form"
      :data="formData"
      :rules="FORM_RULES"
      required-mark
      label-align="top"
      @submit="onSubmit"
    >
      <!-- 邮箱输入 -->
      <t-form-item label="Email" name="email">
        <t-input v-model="formData.email" size="large" placeholder="Please enter" type="text" />
      </t-form-item>

      <!-- 验证码输入 -->
      <t-form-item label="Verification code" name="verifyCode" class="verification-code">
        <div class="verification-code-item" style="display: flex; width: 100%; gap: 8px;">
          <t-input v-model="formData.verifyCode" size="large" placeholder="Please enter" style="flex: 1;" />
          <t-button
            class="verification-code-button"
            variant="text"
            theme="primary"
            :disabled="countDown > 0"
            :loading="sendLoading"
            @click="sendCode"
          >
            {{ countDown === 0 ? 'Send' : `${countDown}s` }}
          </t-button>
        </div>
      </t-form-item>

      <!-- 新密码输入 -->
      <t-form-item label="New Password" name="newPassword" class="password-form-item">
        <t-input
          v-model="formData.newPassword"
          size="large"
          :type="showNewPsw ? 'text' : 'password'"
          placeholder="Please enter"
        >
          <template #suffix-icon>
            <t-icon :name="showNewPsw ? 'browse' : 'browse-off'" @click="showNewPsw = !showNewPsw" />
          </template>
        </t-input>
      </t-form-item>

      <!-- 确认密码输入 -->
      <t-form-item label="Confirmed password" name="confirmPassword">
        <t-input
          v-model="formData.confirmPassword"
          size="large"
          :type="showConfirmPsw ? 'text' : 'password'"
          placeholder="Please enter"
        >
          <template #suffix-icon>
            <t-icon :name="showConfirmPsw ? 'browse' : 'browse-off'" @click="showConfirmPsw = !showConfirmPsw" />
          </template>
        </t-input>
      </t-form-item>

      <!-- 按钮组 -->
      <t-form-item class="btn-container" label-width="0">
        <t-space direction="horizontal" size="small" style="width: 100%; justify-content: flex-end;">
            <t-button size="large" variant="outline" @click="handleCancel"> Cancel </t-button>
            <t-button size="large" type="submit" :loading="loading"> Confirm </t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { BrowseIcon, BrowseOffIcon } from 'tdesign-icons-vue-next';
import { forgotPasswordSendEmail, forgotPasswordUpdate } from '@/api/modules/auth';
import { useCounter } from '@/hooks';

// 定义组件名称
defineOptions({
  name: 'ForgotPassword',
});

// Props 定义
interface Props {
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

// Emits 定义
const emit = defineEmits<{
  'update:visible': [value: boolean];
  close: [];
}>();

// 表单初始数据
const INITIAL_DATA = {
  email: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: '',
};

// 响应式数据
const form = ref();
const formData = ref({ ...INITIAL_DATA });
const loading = ref(false);
const sendLoading = ref(false);
const showNewPsw = ref(false);
const showConfirmPsw = ref(false);

// 表单验证规则
const FORM_RULES = {
  email: [
    { required: true, message: 'Email is required', type: 'error' as const },
    { email: true, message: 'Please enter a valid email', type: 'error' as const },
  ],
  verifyCode: [
    { required: true, message: 'Verification code is required', type: 'error' as const },
    { len: 6, message: 'Verification code must be 6 digits', type: 'error' as const },
  ],
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
    { required: true, message: 'Confirm password is required', type: 'error' as const },
    {
      validator: (val: string) => {
        return val === formData.value.newPassword;
      },
      message: 'Passwords do not match',
      type: 'error' as const,
    },
  ],
};

// 验证码倒计时
const [countDown, handleCounter] = useCounter(300);

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value);
  },
});

/**
 * 发送验证码
 */
const sendCode = async () => {
  try {
    const validateResult = await form.value?.validate({ fields: ['email'] });
    if (validateResult === true) {
      sendLoading.value = true;
      const email = formData.value.email.trim();
      const res = await forgotPasswordSendEmail({ email });
      if (res) {
        handleCounter();
        await MessagePlugin.success('Verification code sent successfully');
      }
    }
  } catch (error) {
    console.error('Send code error:', error);
  } finally {
    sendLoading.value = false;
  }
};

/**
 * 表单提交处理
 */
const onSubmit = async (ctx: any) => {
  if (ctx.validateResult === true) {
    loading.value = true;
    try {
      const email = formData.value.email.trim();
      // const codeNumber = Number(String(formData.value.verifyCode).trim());
      // if (Number.isNaN(codeNumber)) {
      //   MessagePlugin.error('Verification code must be a number');
      //   return;
      // }
      
      const res = await forgotPasswordUpdate({
        email,
        verificationCode: formData.value.verifyCode,
        newPassword: formData.value.newPassword,
        confirmPassword: formData.value.confirmPassword,
      });

      if (res?.success) {
        MessagePlugin.success('Password reset successfully');
        handleClose();
      } else {
        MessagePlugin.error(res?.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      MessagePlugin.error(error.message || 'Failed to reset password');
    } finally {
      loading.value = false;
    }
  }
};

const handleClose = () => {
  visible.value = false;
  emit('close');
  // Reset form
  formData.value = { ...INITIAL_DATA };
  form.value?.reset();
};

const handleCancel = () => {
  handleClose();
};
</script>

<style lang="less" scoped>
.verification-code-item {
  display: flex;
  align-items: center;
  width: 100%;
  
  .verification-code-button {
    margin-left: 8px;
    width: 80px;
  }
}
</style>
