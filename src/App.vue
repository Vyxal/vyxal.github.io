<script setup lang="ts">
import MainLayout from "@/components/MainLayout.vue";
import Sidebar from "@/components/VyxalSidebar.vue";
</script>

<template>
  <div class="main-flex">
    <Sidebar />
    <MainLayout />
  </div>
</template>

<style scoped>
.main-flex {
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: 30px;
}
</style>
