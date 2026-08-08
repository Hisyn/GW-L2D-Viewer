<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" @click.self="onClose">
    <div class="w-full max-w-lg rounded-lg bg-gray-900 text-gray-100 shadow-xl border border-gray-700">
      <header class="flex items-center justify-between border-b border-gray-700 px-5 py-4">
        <h2 class="text-lg font-semibold">Custom Background</h2>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-300 leading-none hover:text-white hover:bg-gray-700/60 transition-colors cursor-pointer"
          @click="onClose"
          aria-label="Close"
        >
          &times;
        </button>
      </header>
      <div class="px-5 py-4 space-y-4">
        <p class="text-sm text-gray-300">
          You can upload your own background image to place behind the character. The image will be draggable and
          resizable just like the built-in editor. Recommended formats: PNG or JPG.
        </p>
        <label
          class="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/60 px-8 py-10 text-center text-sm text-gray-300 hover:border-indigo-400 hover:text-white transition-colors cursor-pointer"
        >
          <span class="text-base font-medium">Click to select an image</span>
          <span class="text-xs text-gray-400">Maximum file size depends on your browser</span>
          <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
        </label>
      </div>
      <footer class="flex items-center justify-end gap-3 border-t border-gray-700 px-5 py-4">
        <button class="text-sm text-gray-300 hover:text-white" @click="onReset" v-if="showReset">Reset background</button>
        <button class="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500" @click="onClose">
          Close
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits(['close', 'upload-bg', 'reset-bg'])
const props = defineProps<{ showReset?: boolean }>()
const showReset = computed(() => !!props.showReset)

function onClose() {
  emit('close')
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      emit('upload-bg', reader.result)
    }
  }
  reader.readAsDataURL(file)
  ;(event.target as HTMLInputElement).value = ''
}

function onReset() {
  emit('reset-bg')
  emit('close')
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.4);
  border-radius: 9999px;
}
</style>
