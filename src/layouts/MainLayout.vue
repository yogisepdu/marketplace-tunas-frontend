<script setup lang="ts">
import AppBottomNav from "../components/layout/AppBottomNav.vue";
import AppFooter from "../components/layout/AppFooter.vue";
import AppHeader from "../components/layout/AppHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppHeader />

    <main class="pb-20 lg:pb-0">
      <slot />
    </main>

    <AppFooter />

    <AppBottomNav />
  </div>
</template>
