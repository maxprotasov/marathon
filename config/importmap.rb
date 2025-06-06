# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "alpinejs", to: "https://ga.jspm.io/npm:alpinejs@3.14.9/dist/module.esm.js"
pin "effector", to: "https://ga.jspm.io/npm:effector@23.3.0/effector.mjs"
pin "team_picker", to: "team_picker.js"
pin_all_from "app/javascript/stores", under: "stores"
