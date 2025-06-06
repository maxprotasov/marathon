// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "controllers/application";
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading";
import TeamPickerController from "controllers/team_picker_controller";

eagerLoadControllersFrom("controllers", application);
application.register("team-picker", TeamPickerController);
