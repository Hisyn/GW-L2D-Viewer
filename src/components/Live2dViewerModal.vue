<template>
  <div class="fixed inset-0 z-60 flex items-start justify-center p-2 sm:items-center sm:p-0">
    <div class="absolute inset-0 bg-black/75" @click="close"></div>
    <div class="relative z-70 my-2 w-full max-w-[98vw] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl sm:my-0 sm:max-w-[94vw] max-h-[96vh] sm:max-h-[94vh] flex flex-col">
      <div class="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 p-3">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"></span>
          <div class="text-sm font-medium text-white">Live2D Cubism Viewer</div>
        </div>
        <button type="button" class="rounded-md p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white" @click="close" aria-label="Close viewer">
          ✕
        </button>
      </div>

      <div class="bg-[#050914] p-3 sm:p-4 overflow-y-auto">
        <div v-if="error" class="flex min-h-[360px] items-center justify-center text-sm text-rose-300">
          {{ error }}
        </div>

        <div v-else class="space-y-4">
          <div class="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-slate-300">
            <span class="rounded border border-slate-700 bg-slate-900/80 px-2 py-1">Character: {{ resolvedCharacterName }}</span>
            <span v-if="modelInfo?.modelFile" class="rounded border border-slate-700 bg-slate-900/80 px-2 py-1">Model: {{ modelInfo.modelFile }}</span>
            <span v-if="modelInfo?.motionCount" class="rounded border border-slate-700 bg-slate-900/80 px-2 py-1">Motions: {{ modelInfo.motionCount }}</span>
          </div>

          <div class="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_340px]">
            <div class="space-y-4">
              <div class="rounded-xl border border-slate-800 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.17),transparent_45%),linear-gradient(180deg,#0a1020,#02060c)] p-4">
                <div ref="canvasHost" class="relative mx-auto flex h-[40vh] sm:h-[56vh] lg:h-[64vh] max-h-[74vh] min-h-[230px] sm:min-h-[320px] w-full items-center justify-center overflow-hidden rounded-xl border border-emerald-400/20 bg-slate-950/70">
                  <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-sm text-slate-300">
                    Loading Live2D model...
                  </div>
                </div>
              </div>
            </div>

            <aside class="flex flex-col gap-4 xl:max-h-[72vh]">
              <div v-if="motionNames.length" class="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div class="mb-2 text-[10px] uppercase tracking-wide text-slate-400">Motions</div>
                <div class="flex max-h-[24vh] sm:max-h-[30vh] gap-2 overflow-auto pr-1 flex-wrap content-start">
                  <button
                    v-for="motionName in motionNames"
                    :key="motionName"
                    type="button"
                    class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 sm:px-2.5 sm:py-1 text-xs sm:text-[10px] font-medium text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                    @click="playMotion(motionName)"
                    @pointerdown.prevent="playMotion(motionName)"
                    @touchstart.prevent="playMotion(motionName)"
                  >
                    {{ motionName }}
                  </button>
                </div>
              </div>

              <div v-if="layerNames.length" class="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div class="mb-2 text-[10px] uppercase tracking-wide text-slate-400">Layers</div>
                <div class="flex max-h-[24vh] sm:max-h-[30vh] flex-col gap-2 overflow-y-auto pr-1">
                  <label
                    v-for="layerName in layerNames"
                    :key="layerName"
                    class="flex cursor-pointer items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium text-slate-200"
                  >
                    <input
                      :checked="layerVisibility[layerName] !== false"
                      type="checkbox"
                      class="h-3.5 w-3.5 accent-emerald-500"
                      @change="toggleLayer(layerName, ($event.target as HTMLInputElement).checked)"
                    />
                    <span>{{ layerName }}</span>
                  </label>
                </div>
              </div>
            </aside>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <div class="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <div class="mb-2 text-[10px] uppercase tracking-wide text-slate-400">Model</div>
              <div class="truncate text-sm text-white">{{ modelInfo?.modelFile || '—' }}</div>
            </div>
            <div class="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <div class="mb-2 text-[10px] uppercase tracking-wide text-slate-400">Physics</div>
              <div class="truncate text-sm text-white">{{ modelInfo?.physicsFile || '—' }}</div>
            </div>
            <div class="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <div class="mb-2 text-[10px] uppercase tracking-wide text-slate-400">Textures</div>
              <div class="truncate text-sm text-white">{{ modelInfo?.textureCount ?? 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { Ticker } from '@pixi/ticker'
import characterList from '@/utils/character_list'

const props = defineProps<{
  characterId?: string | null
  characterName?: string | null
  initialMotion?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const canvasHost = ref<HTMLDivElement | null>(null)
const live2dCanvas = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref('')
const motionNames = ref<string[]>([])
const layerNames = ref<string[]>([])
const layerVisibility = ref<Record<string, boolean>>({})
const pendingMotion = ref<string | null>(null)
const modelInfo = ref<{
  modelFile: string
  modelUrl: string
  physicsFile: string | null
  motionCount: number
  textureCount: number
  motionNames: string[]
} | null>(null)

const live2dAssetModules = import.meta.glob('../assets/live2dcubism/**/*.{json,png,jpg,jpeg,webp}', { eager: false, as: 'url' }) as Record<string, () => Promise<string>>
let currentApp: PIXI.Application | null = null
let currentModel: Live2DModelInstance | null = null
let componentActive = true
let renderSessionId = 0
const cubismPrimed = ref(false)
let live2dTickerRegistered = false

type Live2DModelInstance = {
  x: number
  y: number
  scale: { set: (x: number, y: number) => void }
  anchor: { set: (x: number, y: number) => void }
  motion: (name: string) => void
  on: (event: string, callback: (hitAreas: string[]) => void) => void
  destroy?: () => void
}

const resolvedCharacterName = computed(() => {
  if (props.characterName) return props.characterName
  if (!props.characterId) return 'Character'
  const char = characterList[props.characterId]
  return char?.charName || props.characterId
})

function cleanupRenderer() {
  if (currentModel) {
    currentModel.destroy?.()
    currentModel = null
  }

  if (currentApp) {
    currentApp.stop()
    currentApp.destroy(true, { children: true, texture: true, baseTexture: true })
    currentApp = null
  }

  const host = canvasHost.value
  const canvas = live2dCanvas.value
  if (canvas && host && canvas.parentNode === host) {
    host.removeChild(canvas)
  }
  live2dCanvas.value = null
}

function invalidatePendingRender() {
  renderSessionId += 1
  componentActive = false
}

function ensureCubismRuntime(): Promise<void> {
  const globalWindow = window as Window & { Live2DCubismCore?: unknown }
  if (globalWindow.Live2DCubismCore) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-live2d-cubism-runtime]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Could not load Live2D Cubism 4 runtime.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
    script.async = true
    script.dataset.live2dCubismRuntime = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Live2D Cubism 4 runtime.'))
    document.head.appendChild(script)
  })
}

function playMotion(name: string) {
  if (!name) return
  if (!currentModel) {
    // Model not ready yet — remember the requested motion and play it when initialized
    pendingMotion.value = name
    // Prime the runtime and start loading/rendering immediately to shorten wait time
    if (!cubismPrimed.value) {
      cubismPrimed.value = true
      void ensureCubismRuntime().then(() => {
        try { void import('pixi-live2d-display/cubism4') } catch {}
      }).catch(() => {})
    }
    if (!modelInfo.value) {
      void loadModelInfo()
    } else {
      void renderLive2DModel()
    }
    return
  }
  void currentModel.motion(name)
  pendingMotion.value = null
}

function syncLayerList() {
  const model = currentModel as (Live2DModelInstance & {
    internalModel?: {
      coreModel?: {
        getPartCount?: () => number
        getPartIndex?: (partId: string) => number
        getPartOpacityByIndex?: (partIndex: number) => number
        setPartOpacityByIndex?: (partIndex: number, value: number) => void
        _partIds?: string[]
      }
    }
  }) | null

  const coreModel = model?.internalModel?.coreModel
  if (!coreModel || typeof coreModel.getPartCount !== 'function') {
    layerNames.value = []
    layerVisibility.value = {}
    return
  }

  const names: string[] = []
  const visibility: Record<string, boolean> = {}
  const partCount = coreModel.getPartCount()

  for (let index = 0; index < partCount; index++) {
    const id = coreModel._partIds?.[index] ?? `Part_${index}`
    names.push(id)

    const opacity = typeof coreModel.getPartOpacityByIndex === 'function'
      ? coreModel.getPartOpacityByIndex(index)
      : 1
    visibility[id] = opacity > 0.01
  }

  layerNames.value = names
  layerVisibility.value = visibility
}

function toggleLayer(layerName: string, enabled: boolean) {
  const model = currentModel as (Live2DModelInstance & {
    internalModel?: {
      coreModel?: {
        getPartIndex?: (partId: string) => number
        setPartOpacityByIndex?: (partIndex: number, value: number) => void
      }
    }
  }) | null
  const coreModel = model?.internalModel?.coreModel
  if (!coreModel || typeof coreModel.getPartIndex !== 'function' || typeof coreModel.setPartOpacityByIndex !== 'function') {
    return
  }

  const partIndex = coreModel.getPartIndex(layerName)
  if (partIndex < 0) return

  coreModel.setPartOpacityByIndex(partIndex, enabled ? 1 : 0)
  layerVisibility.value[layerName] = enabled
}

function close() {
  invalidatePendingRender()
  cleanupRenderer()
  emit('close')
}

function resolveAssetFolder(characterId: string | null | undefined) {
  if (!characterId) return null
  const folderName = String(characterId).trim()
  if (!folderName) return null
  const matchingAssets = Object.keys(live2dAssetModules).filter(path => path.includes(`/live2dcubism/${folderName}/`))
  return matchingAssets.length ? folderName : null
}

async function readLive2DAssets(characterId: string | null | undefined) {
  const folderName = resolveAssetFolder(characterId)
  if (!folderName) {
    return null
  }

  const folderPrefix = `../assets/live2dcubism/${folderName}/`
  const entries = Object.entries(live2dAssetModules).filter(([path]) => path.startsWith(folderPrefix))

  const modelEntry = entries.find(([path]) => /\.model3\.json$/i.test(path)) ?? entries.find(([path]) => /\.json$/i.test(path)) ?? null
  const physicsFile = entries.find(([path]) => /physics3\.json$/i.test(path))
  const motionFiles = entries.filter(([path]) => /motions\//i.test(path) && /\.(json|mtn|motion)$/i.test(path))
  const textureFiles = entries.filter(([path]) => /textures\//i.test(path) && /\.(png|jpg|jpeg|webp)$/i.test(path))

  if (!modelEntry) {
    return null
  }

  const modelUrl = await modelEntry[1]()
  const physicsUrl = physicsFile ? await physicsFile[1]() : null

  let parsedMotionNames: string[] = [...new Set(
    motionFiles
      .map(([path]) => path.split('/').pop()?.replace(/\.(json|mtn|motion|motion3)$/i, '') ?? '')
      .filter(Boolean),
  )]

  try {
    if (modelUrl) {
      const response = await fetch(modelUrl)
      if (response.ok) {
        const modelJson = await response.json() as { FileReferences?: { Motions?: Record<string, unknown> } }
        const motionKeys = Object.keys(modelJson?.FileReferences?.Motions ?? {})
        if (motionKeys.length) {
          parsedMotionNames = motionKeys
        }
      }
    }
  } catch {
    parsedMotionNames = parsedMotionNames.length ? parsedMotionNames : []
  }

  return {
    modelFile: modelEntry[0].split('/').pop() || modelEntry[0],
    modelUrl,
    physicsFile: physicsUrl ? physicsUrl.split('/').pop() || physicsUrl : null,
    motionCount: motionFiles.length,
    textureCount: textureFiles.length,
    motionNames: parsedMotionNames,
  }
}

async function renderLive2DModel() {
  const sessionId = ++renderSessionId
  if (!componentActive || !canvasHost.value || !modelInfo.value?.modelUrl) {
    return
  }

  cleanupRenderer()
  const host = canvasHost.value
  if (!host) {
    return
  }

  const view = document.createElement('canvas')
  live2dCanvas.value = view
  host.appendChild(view)

  try {
    if (!componentActive || sessionId !== renderSessionId) {
      return
    }

    await ensureCubismRuntime()
    if (!componentActive || sessionId !== renderSessionId) {
      return
    }
    ;(window as typeof window & { PIXI?: typeof PIXI }).PIXI = PIXI

    const { Live2DModel: Live2DModelCtor } = await import('pixi-live2d-display/cubism4')
    if (!live2dTickerRegistered) {
      Live2DModelCtor.registerTicker(Ticker)
      live2dTickerRegistered = true
    }

    currentApp = new PIXI.Application({
      view,
      width: host.clientWidth || 800,
      height: host.clientHeight || 480,
      backgroundAlpha: 0,
      antialias: true,
      resizeTo: host,
      autoDensity: true,
    })

    const model = await Live2DModelCtor.from(modelInfo.value.modelUrl)
    if (!componentActive || sessionId !== renderSessionId) {
      model.destroy?.()
      return
    }

    currentModel = model as Live2DModelInstance

    if (!currentModel) {
      throw new Error('Live2D model failed to initialize.')
    }

    if (!componentActive || sessionId !== renderSessionId) {
      cleanupRenderer()
      return
    }

    currentApp.stage.interactive = true
    currentApp.stage.hitArea = new PIXI.Rectangle(0, 0, host.clientWidth || 800, host.clientHeight || 480)
    currentApp.stage.position.set(0, 0)
    currentApp.stage.scale.set(1, 1)
    currentApp.stage.x = 0
    currentApp.stage.y = 0
    currentModel.on?.('hit', (hitAreas: string[]) => {
      const model = currentModel
      if (!model) return

      const nextMotion = motionNames.value.find(name => /tap|idle|change/i.test(name)) ?? motionNames.value[0]
      if (nextMotion) void model.motion(nextMotion)
      if (hitAreas?.length) {
        const areaMotion = hitAreas[0]
        if (areaMotion && motionNames.value.some(name => name.toLowerCase().includes(areaMotion.toLowerCase()))) {
          void model.motion(areaMotion)
        }
      }
    })

    currentModel.x = (host.clientWidth || 800) / 2
    currentModel.y = (host.clientHeight || 480) * 0.62
    currentModel.scale.set(0.52, 0.52)
    currentModel.anchor.set(0.5, 0.6)
    currentApp.stage.addChild(currentModel as unknown as PIXI.DisplayObject)
    motionNames.value = modelInfo.value.motionNames
    syncLayerList()
    if (!componentActive || sessionId !== renderSessionId) {
      cleanupRenderer()
      return
    }
    // If the user clicked a motion before the model finished initializing, play it now
    if (pendingMotion.value) {
      void currentModel.motion(pendingMotion.value)
      pendingMotion.value = null
    } else {
      void currentModel.motion(motionNames.value[0] || 'idle')
    }
  } catch (err) {
    if (!componentActive || sessionId !== renderSessionId) {
      return
    }
    console.error('Live2D render failed', err)
    error.value = 'The Live2D model could not be rendered in this browser.'
    cleanupRenderer()
  }
}

async function loadModelInfo() {
  const sessionId = ++renderSessionId
  loading.value = true
  error.value = ''
  modelInfo.value = null

  const info = await readLive2DAssets(props.characterId)
  if (!componentActive || sessionId !== renderSessionId) {
    return
  }

  if (!info) {
    error.value = 'No Live2D Cubism assets were found for this character.'
    loading.value = false
    return
  }

  modelInfo.value = info
  motionNames.value = info.motionNames
  loading.value = false

  if (!componentActive || sessionId !== renderSessionId) {
    return
  }

  await renderLive2DModel()
}

onMounted(() => {
  componentActive = true
  // If the modal was opened with an initial motion request, remember it
  if (props.initialMotion) pendingMotion.value = props.initialMotion
  void loadModelInfo()
})

watch(() => props.initialMotion, (val) => {
  if (!val) return
  // If model is ready, play immediately; otherwise queue it
  if (currentModel) {
    void currentModel.motion(val)
    pendingMotion.value = null
  } else {
    pendingMotion.value = val
  }
})

watch(() => props.characterId, () => {
  componentActive = true
  renderSessionId += 1
  cleanupRenderer()
  void loadModelInfo()
})

onBeforeUnmount(() => {
  invalidatePendingRender()
  cleanupRenderer()
})
</script>

<style scoped>
.z-60 { z-index: 60; }
.z-70 { z-index: 70; }
</style>
