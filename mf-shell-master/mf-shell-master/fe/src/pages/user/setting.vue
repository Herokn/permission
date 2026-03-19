<template>
  <div class="user-setting-page">
    <t-card :bordered="false">
      <t-tabs v-model="activeTab">
        <t-tab-panel value="profile" :label="t('pages.user.profileInformation')">
          <div style="padding: 24px;">
            <!-- Placeholder for Profile Information -->
            <div style="margin-bottom: 24px; font-size: 16px; font-weight: bold;">Basic Information</div>
             <t-form label-align="top" label-width="100px">
                <t-form-item label="Username">
                    <t-input :value="userStore.userInfo.username" disabled />
                </t-form-item>
                <t-form-item label="Nickname">
                    <t-input :value="userStore.userInfo.nickName" disabled />
                </t-form-item>
             </t-form>
          </div>
        </t-tab-panel>
        <t-tab-panel value="password" :label="t('pages.user.changePassword')">
          <ChangePassword />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ChangePassword from './components/ChangePassword.vue';
import { useUserStore } from '@/stores';

const { t } = useI18n();
const userStore = useUserStore();
const activeTab = ref('password'); // Default to password as per request focus
</script>

<style lang="less" scoped>
.user-setting-page {
  padding: 24px;
  
  :deep(.t-card) {
    min-height: 500px;
  }
}
</style>
