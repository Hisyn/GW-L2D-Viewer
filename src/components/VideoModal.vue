<template>
  <div class="fixed inset-0 z-60 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/70" @click="close"></div>
    <div class="relative z-70 max-w-4xl w-full mx-4 bg-gray-900 rounded-md overflow-hidden shadow-lg">
      <div class="flex items-center justify-between gap-3 p-2 border-b border-gray-800">
        <div class="text-sm text-white">Ultimate Ability Cutscene</div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2 text-xs text-gray-200 select-none">
            <input v-model="loopEnabled" type="checkbox" class="h-3.5 w-3.5 accent-indigo-500" />
            Loop
          </label>
          <button type="button" class="text-white p-1 hover:text-gray-300" @click="close">✕</button>
        </div>
      </div>
      <div class="p-4 bg-black">
        <video
          v-if="src"
          :src="src"
          :loop="loopEnabled"
          controls
          autoplay
          playsinline
          class="w-full h-auto max-h-[70vh] bg-black"
        />
        <div v-else class="text-white p-4">No video available.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ src: string | null; characterId?: string | null; animation?: string | null }>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const loopEnabled = ref(true)

function close() {
  emit('close')
}
</script>

<style scoped>
.z-60 { z-index: 60; }
.z-70 { z-index: 70; }
</style>
