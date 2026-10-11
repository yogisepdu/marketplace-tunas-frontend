<script setup lang="ts">
import { Plus } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    actionLabel?: string;
    showAction?: boolean;
  }>(),
  {
    description: "",
    actionLabel: "Tambah Data",
    showAction: false,
  },
);

defineEmits<{
  action: [];
}>();
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-1 text-sm leading-6 text-slate-500">
        {{ description }}
      </p>
    </div>

    <button
      v-if="showAction"
      type="button"
      class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      @click="$emit('action')"
    >
      <Plus class="h-4 w-4" />
      {{ actionLabel }}
    </button>
  </div>
</template>
