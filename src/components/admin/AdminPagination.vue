<script setup lang="ts">
defineProps<{
  page: number;
  totalPages: number;
}>();

defineEmits<{
  change: [page: number];
}>();
</script>

<template>
  <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
    <button
      type="button"
      class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="page <= 1"
      @click="$emit('change', page - 1)"
    >
      Sebelumnya
    </button>

    <span class="text-sm text-slate-500">
      Halaman {{ page }} / {{ totalPages }}
    </span>

    <button
      type="button"
      class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="page >= totalPages"
      @click="$emit('change', page + 1)"
    >
      Berikutnya
    </button>
  </div>
</template>
