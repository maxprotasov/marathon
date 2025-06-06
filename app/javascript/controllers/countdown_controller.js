import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    startTime: String,
    duration: Number,
  };

  connect() {
    console.log("suka");
    if (!this.hasStartTimeValue) {
      this.element.textContent = "Не начата";
      return;
    }
    const start = new Date(this.startTimeValue).getTime();
    const finish = start + this.durationValue * 60_000;
    this.timer = setInterval(() => {
      const now = Date.now();
      const diff = finish - now;
      if (diff <= 0) {
        this.element.textContent = "00:00:00";
        clearInterval(this.timer);
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      const two = (n) => String(n).padStart(2, "0");
      this.element.textContent = `${two(h)}:${two(m)}:${two(s)}`;
    }, 1000);
  }

  disconnect() {
    clearInterval(this.timer);
  }
}
