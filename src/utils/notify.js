export function notify(text) {
  window.dispatchEvent(
    new CustomEvent("notify", {
      detail: text
    })
  )
}