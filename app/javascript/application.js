// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails";
import Alpine from "alpinejs";
import {
  actions as teamPickerActions,
  store as teamPickerStore,
} from "team_picker";
import {
  actions as countDownActions,
  store as countDownStore,
} from "stores/countdown";

window.Alpine = Alpine;
Alpine.store("teamPicker", {
  init() {
    this.actions = teamPickerActions;

    teamPickerStore.watch((store) => {
      this.store = store;
    });
  },
});
Alpine.store("countdown", {
  init() {
    this.actions = countDownActions;

    countDownStore.watch((store) => {
      this.store = store;
    });
  },
});

Alpine.start();
