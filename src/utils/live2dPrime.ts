let primed = false
let primePromise: Promise<void> | null = null

export function primeLive2D(): Promise<void> {
  if (primed) return Promise.resolve()
  if (primePromise) return primePromise

  primePromise = new Promise((resolve) => {
    const globalWindow = window as Window & { Live2DCubismCore?: unknown }
    if (globalWindow.Live2DCubismCore) {
      primed = true
      // also import pixi-live2d-display
      void import('pixi-live2d-display/cubism4').then(() => {
        primed = true
        resolve()
      }).catch(() => {
        primed = true
        resolve()
      })
      return
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-live2d-cubism-runtime]')
    if (existing) {
      existing.addEventListener('load', () => {
        void import('pixi-live2d-display/cubism4').then(() => {
          primed = true
          resolve()
        }).catch(() => { primed = true; resolve() })
      }, { once: true })
      existing.addEventListener('error', () => { primed = true; resolve() }, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
    script.async = true
    script.dataset.live2dCubismRuntime = 'true'
    script.onload = () => {
      void import('pixi-live2d-display/cubism4').then(() => {
        primed = true
        resolve()
      }).catch(() => { primed = true; resolve() })
    }
    script.onerror = () => { primed = true; resolve() }
    document.head.appendChild(script)
  })

  return primePromise
}
