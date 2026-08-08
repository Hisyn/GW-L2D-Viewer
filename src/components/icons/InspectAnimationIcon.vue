<template>
  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M2.5 12c2.5 4 6.5 7 9.5 7s7-3 9.5-7c-2.5-4-6.5-7-9.5-7S5 8 2.5 12z"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle v-if="active" cx="12" cy="12" r="3" fill="currentColor" />
    <path
      v-else
      d="M3 3l18 18"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>
