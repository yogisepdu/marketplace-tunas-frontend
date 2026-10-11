<script setup lang="ts">
import { X } from "lucide-vue-next";

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    maxWidth?: string;
  }>(),
  {
    maxWidth: "max-w-lg",
  },
);

defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl"
        :class="maxWidth"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            @click="$emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="p-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
