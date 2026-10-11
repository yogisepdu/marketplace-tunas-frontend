<script setup lang="ts">
import type { Component } from "vue";

withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon: Component;
    description?: string;
  }>(),
  {
    description: "",
  },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {{ value }}
        </p>
        <p v-if="description" class="mt-2 text-xs text-slate-500">
          {{ description }}
        </p>
      </div>
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <component :is="icon" class="h-5 w-5" />
      </div>
    </div>
  </div>
</template>
