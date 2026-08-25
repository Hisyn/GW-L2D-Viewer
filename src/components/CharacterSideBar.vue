<template>
  <div style="margin-top: 9px;margin-bottom: 9px;" class="w-full lg:w-full h-full bg-gray-800 text-white flex flex-col min-h-0 rounded-lg border border-gray-700">
    <div class="flex items-center gap-2 mb-2 rounded-lg bg-gray-800 px-2 py-1">
      <input
        v-model="filter"
        type="text"
        placeholder="Search..."
        class="bg-gray-700 text-white p-2 outline-none flex-1 min-w-0 rounded-md placeholder-gray-400 focus:ring-2 focus:ring-slate-900/70 focus:border-slate-900/70"
      />
      <button
        type="button"
        class="relative w-10 h-10 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 transition-colors"
        :class="hasActiveFilters ? 'text-indigo-300' : 'text-white'"
        aria-label="Filter characters"
        @click="filterModalOpen = true"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 5h18" />
          <path d="M6 12h12" />
          <path d="M10 19h4" />
        </svg>
        <span
          v-if="hasActiveFilters"
          class="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-indigo-300"
        />
      </button>
    </div>
    <div class="overflow-y-auto flex-1 px-2 sidebar-scroll space-y-1">
      <div
        v-for="char in filteredCharacters"
        :key="char.id"
        class="flex items-center py-2 cursor-pointer rounded-lg transition-colors hover:bg-slate-900/70"
        :class="{ 'bg-slate-900/70': char.id === store.selectedCharacterId }"
        @click="select(char.id)"
      >
        <img
          :src="icons[char.icon] || icons['unknown']"
          :alt="char.costumeName"
          class="w-30 h-30 object-cover object-top rounded-[50%] transition-transform duration-200 ease-out hover:scale-125"
        />
        <div class="flex-grow pl-2">
          <img
            v-if="rarityIcons[char.costumeName]"
            :src="rarityIcons[char.costumeName]"
            :alt="char.costumeName"
            :title="char.costumeName"
            class="h-8 align-text-bottom"
          />
          <span v-else class="text-lg">{{ char.costumeName }}</span>
          <span class="text-lg">{{ char.charName }}</span>

        </div>
        <div class="flex flex-shrink-0 gap-1 pl-2 pr-2">
          <img
            v-if="char.dating"
            src="@/assets/other_icons/ring.png"
            alt="Bride Animations"
            title="Bride Animations"
            class="w-10 h-10 object-contain"
          />
          <!-- <div
            v-if="char.cutscene"
            class="w-auto h-6 px-2 bg-purple-500 text-white flex items-center justify-center text-xs font-bold rounded"
          >
            U
          </div> -->
        </div>
      </div>
      <div v-if="!filteredCharacters.length" class="text-sm text-gray-400 px-2 py-3">
        No characters found.
      </div>
    </div>
    <div
      v-if="filterModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      @click.self="filterModalOpen = false"
    >
      <div class="w-full max-w-sm rounded bg-gray-800 border border-gray-700 shadow-xl p-4">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold">Filters</h2>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
            aria-label="Close filters"
            @click="filterModalOpen = false"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <button
            type="button"
            class="w-full flex items-center justify-between gap-3 rounded border px-3 py-3 text-left transition-colors"
            :class="showFatedGuestOnly ? 'border-blue-400 bg-blue-500/15' : 'border-gray-700 hover:bg-slate-900/70'"
            :aria-pressed="showFatedGuestOnly"
            @click="showFatedGuestOnly = !showFatedGuestOnly"
          >
            <span class="text-sm text-gray-100">Bride Animations</span>
            <img src="@/assets/other_icons/ring.png" alt="Bride Animations" class="w-6 h-6 object-contain" />
          </button>

          <div class="rounded border border-gray-700 px-3 py-3">
            <span class="text-sm text-gray-100 block mb-2">Rarity</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="rarity in rarityOptions"
                :key="rarity"
                type="button"
                class="flex items-center justify-center rounded border px-2 py-1 transition-colors"
                :class="selectedRarities.has(rarity) ? 'border-indigo-400 bg-indigo-500/15' : 'border-gray-700 hover:bg-slate-900/70'"
                :aria-pressed="selectedRarities.has(rarity)"
                @click="toggleRarity(rarity)"
              >
                <img :src="rarityIcons[rarity]" :alt="rarity" :title="rarity" class="h-5" />
              </button>
            </div>
          </div>

          <!-- <button
            type="button"
            class="w-full flex items-center justify-between gap-3 rounded border px-3 py-3 text-left transition-colors"
            :class="showUltimateOnly ? 'border-purple-400 bg-purple-500/15' : 'border-gray-700 hover:bg-gray-700/70'"
            :aria-pressed="showUltimateOnly"
            @click="showUltimateOnly = !showUltimateOnly"
          >
            <span class="text-sm text-gray-100">Ultimate animations</span>
            <span class="h-6 px-2 bg-purple-500 text-white flex items-center justify-center text-xs font-bold rounded">U</span>
          </button> -->

          <!-- <button
            type="button"
            class="w-full flex items-center justify-between gap-3 rounded border px-3 py-3 text-left transition-colors"
            :class="characterTypeFilter === 'playable' ? 'border-emerald-400 bg-emerald-500/15' : 'border-gray-700 hover:bg-gray-700/70'"
            :aria-pressed="characterTypeFilter === 'playable'"
            @click="characterTypeFilter = characterTypeFilter === 'playable' ? 'all' : 'playable'"
          >
            <span class="text-sm text-gray-100">Playable characters</span>
            <span class="h-6 px-2 bg-emerald-500 text-white flex items-center justify-center text-xs font-bold rounded">PC</span>
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between gap-3 rounded border px-3 py-3 text-left transition-colors"
            :class="characterTypeFilter === 'npc' ? 'border-amber-400 bg-amber-500/15' : 'border-gray-700 hover:bg-gray-700/70'"
            :aria-pressed="characterTypeFilter === 'npc'"
            @click="characterTypeFilter = characterTypeFilter === 'npc' ? 'all' : 'npc'"
          >
            <span class="text-sm text-gray-100">NPCs</span>
            <span class="h-6 px-2 bg-amber-500 text-white flex items-center justify-center text-xs font-bold rounded">NPC</span>
          </button> -->
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <button
            type="button"
            class="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!hasActiveFilters"
            @click="resetFilters"
          >
            Reset filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import icons from '@/utils/charIcons';
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import urExIcon from '@/assets/other_icons/ur_ex.png'
import ssrIcon from '@/assets/other_icons/ssr.png'
import srIcon from '@/assets/other_icons/sr.png'
import urIcon from '@/assets/other_icons/ur.png'

const rarityIcons: Record<string, string> = {
  'UR EX': urExIcon,
  SSR: ssrIcon,
  SR: srIcon,
  UR: urIcon,
}
const rarityOptions = ['SR', 'SSR', 'UR', 'UR EX'] as const

const emit = defineEmits(['select'])
const store = useCharacterStore()

const filter = ref('')
const filterModalOpen = ref(false)
const showFatedGuestOnly = ref(false)
const showUltimateOnly = ref(false)
const characterTypeFilter = ref<'all' | 'playable' | 'npc'>('all')
const selectedRarities = ref<Set<string>>(new Set())
const hasActiveFilters = computed(
  () => showFatedGuestOnly.value || showUltimateOnly.value || characterTypeFilter.value !== 'all' || selectedRarities.value.size > 0,
)

const filteredCharacters = computed(() =>
  store.characters.filter((c) => {
    const query = filter.value.trim().toLowerCase()
    const matchesSearch = !query || (c.charName + ' ' + c.costumeName).toLowerCase().includes(query)
    const matchesFatedGuest = !showFatedGuestOnly.value || !!c.dating
    const matchesUltimate = !showUltimateOnly.value || !!c.cutscene
    const isNpc = c.charName.includes('(Npc)')
    const matchesCharacterType =
      characterTypeFilter.value === 'all' ||
      (characterTypeFilter.value === 'npc' && isNpc) ||
      (characterTypeFilter.value === 'playable' && !isNpc)
    const matchesRarity = selectedRarities.value.size === 0 || selectedRarities.value.has(c.costumeName)
    return matchesSearch && matchesFatedGuest && matchesUltimate && matchesCharacterType && matchesRarity
  })
)

function toggleRarity(rarity: string) {
  const next = new Set(selectedRarities.value)
  if (next.has(rarity)) next.delete(rarity)
  else next.add(rarity)
  selectedRarities.value = next
}

function select(id: string) {
  if (id === store.selectedCharacterId) return
  emit('select', id)
  store.selectedCharacterId = id
}

function resetFilters() {
  showFatedGuestOnly.value = false
  showUltimateOnly.value = false
  characterTypeFilter.value = 'all'
  selectedRarities.value = new Set()
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    filterModalOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  emit('select', store.selectedCharacterId)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>
