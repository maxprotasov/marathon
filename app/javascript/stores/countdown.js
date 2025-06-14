import {
  createEvent,
  createStore,
  createEffect,
  sample,
  combine,
} from "effector";

export const initTimer = createEvent();
export const setTimer = createEvent();

const timerTick = createEvent();

const timerFx = createEffect().use(({ key, time, duration }) => {
  const start = new Date(time).getTime();
  const finish = start + duration * 60_000;
  const two = (n) => String(n).padStart(2, "0");

  function update() {
    const now = Date.now();
    let diff = finish - now;
    if (diff <= 0) {
      timerTick({ key, value: "00:00:00" });
      clearInterval(intervalId);
      return;
    }
    const h = Math.floor(diff / 3_600_000);
    diff %= 3_600_000;
    const m = Math.floor(diff / 60_000);
    diff %= 60_000;
    const s = Math.floor(diff / 1000);
    timerTick({
      key,
      value: `${two(h)}:${two(m)}:${two(s)}`,
    });
  }

  // первый вызов сразу
  update();
  const intervalId = setInterval(update, 1000);

  // по желанию вернуть intervalId, чтобы можно было чистить извне
  return intervalId;
});

// --- 3) Связываем initTimer → timerFx ---

sample({
  clock: setTimer,
  target: timerFx,
});

sample({
  clock: initTimer,
  target: timerFx,
});

// --- 4) Store: хранит все таймеры в виде { [key]: "HH:MM:SS", ... } ---
const $timer = createStore({ common_timer: "00:00:00" }).on(
  timerTick,
  (state, { key, value }) => ({
    ...state,
    [key]: value,
  }),
);

$timer.watch((time) => console.log(time));

// Экспортируем стор и экшены
export const stores = {
  $timer,
};
export const actions = {
  initTimer,
  setTimer,
};
export const store = combine(stores);
