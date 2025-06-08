import { createStore, createEvent, createEffect } from "effector";

const initPicker = createEvent();
const setColor = createEvent();
const setTeam = createEvent();
const clearSelection = createEvent();

const assignColorFx = createEffect(async ({ teamId, color }) => {
  const res = await fetch(`/teams/${teamId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
    },
    body: JSON.stringify({ team: { color } }),
  });
  if (!res.ok) throw new Error("Ошибка сохранения");
  return res.json();
});

const assignPitLaneFx = createEffect(async ({ pitLaneId, teamId }) => {
  const res = await fetch(`/pit_lanes/${pitLaneId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
    },
    body: JSON.stringify({ pit_lane: { team_id: teamId } }),
  });
  if (!res.ok) throw new Error("Ошибка назначения на пит-лейн");
  return res.json();
});

const addTeamFx = createEffect(async ({ raceId, pitLaneName }) => {
  const res = await fetch("/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
    },
    body: JSON.stringify({
      team: {
        pit_lane_name: pitLaneName,
        race_id: raceId,
        pit_lane_team: true,
      },
    }),
  });
  if (!res.ok) throw new Error("Ошибка создания команды");
  return res.json();
});

const deleteTeamFx = createEffect(async ({ pitLaneName, raceId }) => {
  const res = await fetch("/teams/delete_last_for_pit", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
    },
    body: JSON.stringify({ pit_lane_name: pitLaneName, race_id: raceId }),
  });
  if (!res.ok) throw new Error("Ошибка удаления");
  return res.json();
});

const $picker = createStore({
  color: null,
  hex: null,
  selectedTeamId: null,
  teams: [],
  pitLaneA: [],
  pitLaneB: [],
  raceId: null,
})
  .on(initPicker, (_, payload) => ({ ...payload }))
  .on(setColor, (state, { color, hex }) => ({ ...state, color, hex }))
  .on(setTeam, (state, id) => ({ ...state, selectedTeamId: id }))
  .on(clearSelection, (state) => ({ ...state, color: null, hex: null, selectedTeamId: null }));

export default function teamPicker() {
  return {
    color: null,
    hex: null,
    selectedTeamId: null,
    teams: [],
    pitLaneA: [],
    pitLaneB: [],
    raceId: null,

    init() {
      initPicker({
        teams: JSON.parse(this.$el.dataset.teams),
        pitLaneA: JSON.parse(this.$el.dataset.pitLaneA),
        pitLaneB: JSON.parse(this.$el.dataset.pitLaneB),
        raceId: JSON.parse(this.$el.dataset.raceId),
        color: null,
        hex: null,
        selectedTeamId: null,
      });

      $picker.watch((s) => {
        this.color = s.color;
        this.hex = s.hex;
        this.selectedTeamId = s.selectedTeamId;
        this.teams = s.teams;
        this.pitLaneA = s.pitLaneA;
        this.pitLaneB = s.pitLaneB;
        this.raceId = s.raceId;
      });
    },

    selectColor(event) {
      const chosenColor = event.currentTarget.dataset.teamPickerColor;
      const chosenHex = event.currentTarget.dataset.teamPickerHex;
      setColor({ color: chosenColor, hex: chosenHex });
      this.$el.querySelectorAll('[data-team-picker-color]').forEach((el) => {
        if (el.dataset.teamPickerColor === chosenColor) {
          el.classList.add("ring-4", "ring-offset-2", "ring-white");
        } else {
          el.classList.remove("ring-4", "ring-offset-2", "ring-white");
        }
      });
    },

    selectTeam(event) {
      if (this.color != null) {
        return this.assignToTeam(event);
      }
      const chosenTeamId = event.currentTarget.dataset.teamPickerTeamId;
      setTeam(chosenTeamId);
      this.$el.querySelectorAll('[data-team-picker-team-id]').forEach((el) => {
        if (el.dataset.teamPickerTeamId === chosenTeamId) {
          el.classList.add("ring-4", "ring-offset-2", "ring-white");
        } else {
          el.classList.remove("ring-4", "ring-offset-2", "ring-white");
        }
      });
    },

    deleteTeamFromPitLane(event) {
      event.preventDefault();
      const pitLaneName = event.currentTarget.dataset.deleteTeamPitlane;
      deleteTeamFx({ pitLaneName, raceId: this.raceId })
        .then((data) => {
          const teamDiv = this.$el.querySelector(
            `[data-team-picker-team-id="${data.team_id}"]`
          );
          if (teamDiv) teamDiv.remove();
        })
        .catch(() => {
          alert("Не удалось удалить команду.");
        });
    },

    assignToTeam(event) {
      const teamDiv = event.currentTarget;
      const teamId = teamDiv.dataset.teamPickerTeamId;
      const color = this.color;
      const hex = this.hex;
      if (!color) return;
      assignColorFx({ teamId, color })
        .then(() => {
          teamDiv.style.backgroundColor = hex;
          clearSelection();
          this.$el
            .querySelectorAll('[data-team-picker-color]')
            .forEach((el) => {
              el.classList.remove("ring-4", "ring-offset-2", "ring-white");
            });
        })
        .catch(() => {
          alert("Не удалось сохранить цвет. Попробуйте ещё раз.");
        });
    },

    assignTeamToPitLane(event) {
      event.preventDefault();
      const pitLaneDiv = event.currentTarget;
      const pitLaneId = pitLaneDiv.dataset.teamPickerPitLaneId;
      const teamId = this.selectedTeamId;
      if (!teamId) return;
      assignPitLaneFx({ pitLaneId, teamId })
        .then((data) => {
          const colorName = data.team_color;
          const hexMap = JSON.parse(pitLaneDiv.dataset.teamPickerHexMap);
          const hex = hexMap[colorName];
          pitLaneDiv.style.backgroundColor = hex;
          pitLaneDiv.style.borderColor = hex;
          this.$el
            .querySelectorAll('[data-team-picker-team-id]')
            .forEach((el) => {
              el.classList.remove("ring-4", "ring-offset-2", "ring-white");
            });
          clearSelection();
        })
        .catch(() => {
          alert("Не удалось назначить команду на пит-лейн.");
        });
    },

    addTeam(event) {
      event.preventDefault();
      const pitLaneName = event.currentTarget.dataset.pitLaneName;
      addTeamFx({ raceId: this.raceId, pitLaneName })
        .then((data) => {
          this._appendTeamBox(data.id, data.name, data.pit_lane_name);
        })
        .catch(() => {
          alert("Не удалось создать команду. Попробуйте ещё раз.");
        });
    },

    _appendTeamBox(id, name, pitLane) {
      const container = this.$el.querySelector(".teams-container" + pitLane);
      if (!container) return;
      const div = document.createElement("div");
      div.setAttribute("data-team-picker-team-id", id);
      div.style.backgroundColor = "#636363";
      div.className =
        "w-16 h-16 rounded-full m-2 flex items-center justify-center text-xl font-semibold text-white cursor-pointer transition-shadow hover:shadow-lg";
      div.textContent = name;
      div.addEventListener("click", (e) => this.assignToTeam(e));
      container.appendChild(div);
    },
  };
}
