<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean;
    empty?: boolean;
    emptyText?: string;
  }>(),
  {
    loading: false,
    empty: false,
    emptyText: "Belum ada data.",
  },
);
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div v-if="loading" class="space-y-3 p-5">
      <div v-for="n in 5" :key="n" class="h-12 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <div v-else-if="empty" class="px-6 py-14 text-center">
      <p class="text-sm font-medium text-slate-600">{{ emptyText }}</p>
      <p class="mt-1 text-xs text-slate-400">
        Gunakan tombol tambah untuk membuat data baru.
      </p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            <slot name="head" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <slot />
        </tbody>
      </table>
    </div>
  </div>
</template>
