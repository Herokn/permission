<template>
  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <!-- 当存在子路由组件时，渲染子组件；否则渲染插槽内容 -->
      <component :is="Component" v-if="Component" :key="'child:' + $route.fullPath" />
      <div v-else :key="'slot:' + $route.fullPath" class="nested-router-container">
        <slot />
      </div>
    </transition>
  </RouterView>
</template>

<script setup lang="ts"></script>

<style scoped>
.nested-router-container {
  display: block;
  width: 100%;
  height: 100%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
