// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails";
import Alpine from "alpinejs";
import teamPicker from "team_picker";
import { initCountdown } from "stores/countdown";

window.Alpine = Alpine;
Alpine.data("teamPicker", teamPicker);
Alpine.start();

window.initCountdown = initCountdown;
