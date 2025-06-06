import { createStore, createEvent } from 'effector'

export default function countdown(startTime, duration) {
  const tick = createEvent()
  const $time = createStore('')
    .on(tick, (_, value) => value)

  return {
    time: $time.getState(),
    init() {
      $time.watch(v => { this.time = v })
      if (!startTime) {
        tick('Не начата')
        return
      }
      const start = new Date(startTime).getTime()
      const finish = start + duration * 60_000
      this.timer = setInterval(() => {
        const now = Date.now()
        const diff = finish - now
        if (diff <= 0) {
          tick('00:00:00')
          clearInterval(this.timer)
          return
        }
        const h = Math.floor(diff / 3_600_000)
        const m = Math.floor((diff % 3_600_000) / 60_000)
        const s = Math.floor((diff % 60_000) / 1000)
        const two = n => String(n).padStart(2, '0')
        tick(`${two(h)}:${two(m)}:${two(s)}`)
      }, 1000)
    },
    destroy() {
      clearInterval(this.timer)
    }
  }
}
