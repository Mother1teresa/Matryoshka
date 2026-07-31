import { onMounted, onUnmounted } from 'vue'

const VK_SCRIPT_URL = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js'

let scriptPromise = null

function loadVKScript() {
  if (scriptPromise) return scriptPromise
  if (window.VKIDSDK) return Promise.resolve(window.VKIDSDK)

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = VK_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(window.VKIDSDK)
    script.onerror = (e) => reject(new Error('Не удалось загрузить VK ID SDK'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

export function useVKAuth(containerRef, options = {}) {
  let oneTap = null

  const init = async () => {
    try {
      const VKID = await loadVKScript()

      VKID.Config.init({
        app: Number(options.appId || import.meta.env.VITE_VK_APP_ID),
        redirectUrl: options.redirectUrl || window.location.origin,
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
        scope: options.scope || '',
      })

      oneTap = new VKID.OneTap()

      if (!containerRef.value) return

      oneTap
        .render({
          container: containerRef.value,
          showAlternativeLogin: true,
          styles: {
            borderRadius: 12,
            width: options.width || 320,
            height: 40,
          },
        })
        .on(VKID.WidgetEvents.ERROR, (error) => {
          console.error('[VKID] Widget error:', error)
          options.onError?.(error)
        })
        .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, async (payload) => {
          try {
            const { code, device_id } = payload
            const data = await VKID.Auth.exchangeCode(code, device_id)
            options.onSuccess?.(data)
          } catch (error) {
            console.error('[VKID] Exchange error:', error)
            options.onError?.(error)
          }
        })
    } catch (error) {
      console.error('[VKID] Init error:', error)
      options.onError?.(error)
    }
  }

  onMounted(() => init())

  onUnmounted(() => {
    if (containerRef.value) containerRef.value.innerHTML = ''
  })
}