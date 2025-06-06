import { createStore } from "effector";
import Alpine from "alpinejs";

export function initCountdown(startTime, duration) {
  if (!Alpine.store('countdown')) {
    Alpine.store('countdown', '');
  }

  const $time = createStore('');
  $time.watch((v) => {
    Alpine.store('countdown', v);
  });

  if (!startTime) {
    $time.setState('Не начата');
    return;
  }

  const start = new Date(startTime).getTime();
  const finish = start + duration * 60_000;

  const two = (n) => String(n).padStart(2, '0');

  function update() {
    const now = Date.now();
    const diff = finish - now;
    if (diff <= 0) {
      $time.setState('00:00:00');
      clearInterval(timer);
      return;
    }
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    $time.setState(`${two(h)}:${two(m)}:${two(s)}`);
  }

  update();
  const timer = setInterval(update, 1000);
}
