<script setup lang="ts">
  import MainLayout from "@/components/MainLayout.vue";
  import Sidebar from "./components/Sidebar.vue";
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
  }
</style>