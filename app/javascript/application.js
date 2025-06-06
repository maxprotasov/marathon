// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import Alpine from "alpinejs"
import countdown from "components/countdown"
import teamPicker from "components/teamPicker"

window.Alpine = Alpine
window.countdown = countdown
window.teamPicker = teamPicker

Alpine.start()
