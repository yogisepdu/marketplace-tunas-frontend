<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import Footer from "./components/layout/AppFooter.vue";
import Navbar from "./components/layout/AppHeader.vue";

const route = useRoute();

const isAdminPage = computed(() => {
  return route.path.startsWith("/admin");
});
</script>

<template>
  <template v-if="isAdminPage">
    <RouterView />
  </template>

  <template v-else>
    <Navbar />

    <main>
      <RouterView />
    </main>

    <Footer />
  </template>
</template>
