import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["colorOption", "teamBox"];
  static values = { color: String, hex: String };

  initialize() {
    this.teams = JSON.parse(this.element.dataset.teams);
    this.pitLaneA = JSON.parse(this.element.dataset.pitLaneA);
    this.pitLaneB = JSON.parse(this.element.dataset.pitLaneB);
    this.raceId = JSON.parse(this.element.dataset.raceId);
    console.log(this.teams);
  }

  connect() {
    this.colorValue = null;
    this.hexValue = null;
    this.selectedTeamId = null;
  }

  selectColor(event) {
    const chosenColor = event.currentTarget.dataset.teamPickerColor;
    const chosenHex = event.currentTarget.dataset.teamPickerHex;

    this.colorValue = chosenColor;
    this.hexValue = chosenHex;

    this.colorOptionTargets.forEach((el) => {
      if (el.dataset.teamPickerColor === chosenColor) {
        el.classList.add("ring-4", "ring-offset-2", "ring-white");
      } else {
        el.classList.remove("ring-4", "ring-offset-2", "ring-white");
      }
    });
  }

  selectTeam(event) {
    if (this.colorValue != "null") {
      return this.assignToTeam(event);
    }

    const chosenTeamId = event.currentTarget.dataset.teamPickerTeamId;
    this.selectedTeamId = chosenTeamId;

    this.teamBoxTargets.forEach((el) => {
      if (el.dataset.teamPickerTeamId === chosenTeamId) {
        el.classList.add("ring-4", "ring-offset-2", "ring-white");
      } else {
        el.classList.remove("ring-4", "ring-offset-2", "ring-white");
      }
    });
  }

  deleteTeam(event) {
    event.preventDefault();
    const teamId = event.currentTarget.dataset.deleteTeamId;
    const teamDiv = document.querySelector(
      `[data-team-picker-team-id="${teamId}"]`,
    );

    fetch(`/teams/${teamId}`, {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка удаления");
        teamDiv.remove();
      })
      .catch(() => {
        alert("Не удалось удалить команду.");
      });
  }

  deleteTeamFromPitLane(event) {
    event.preventDefault();
    const pitLaneName = event.currentTarget.dataset.deleteTeamPitlane;
    const raceId = this.raceId;

    fetch("/teams/delete_last_for_pit", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
      },
      body: JSON.stringify({
        pit_lane_name: pitLaneName,
        race_id: raceId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка удаления");
        const teamDiv = document.querySelector(
          `[data-team-picker-team-id="${teamId}"]`,
        );

        teamDiv.remove();
      })
      .catch(() => {
        alert("Не удалось удалить команду.");
      });
  }

  assignToTeam(event) {
    const teamDiv = event.currentTarget;
    const teamId = teamDiv.dataset.teamPickerTeamId;
    this.selectedTeamId = teamId;
    const color = this.colorValue;
    const hex = this.hexValue;

    if (!color || color === "null") {
      return;
    }

    fetch(`/teams/${teamId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
      },
      body: JSON.stringify({ team: { color: color } }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сохранения");
        return res.json();
      })
      .then(() => {
        teamDiv.classList.add(`bg-[${hex}]`);
        teamDiv.style.backgroundColor = hex;
        this.colorValue = null;
        this.hexValue = null;
        this.selectedTeamId = null;

        this.colorOptionTargets.forEach((el) => {
          el.classList.remove("ring-4", "ring-offset-2", "ring-white");
        });
      })
      .catch(() => {
        alert("Не удалось сохранить цвет. Попробуйте ещё раз.");
      });
  }

  assignTeamToPitLane(event) {
    event.preventDefault();

    const pitLaneDiv = event.currentTarget;
    const pitLaneId = pitLaneDiv.dataset.teamPickerPitLaneId;
    const teamId = this.selectedTeamId;
    console.log("pidrila", event, pitLaneId, pitLaneDiv, teamId);

    if (!teamId || teamId === "null") {
      return;
    }

    fetch(`/pit_lanes/${pitLaneId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
      },
      body: JSON.stringify({ pit_lane: { team_id: teamId } }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка назначения на пит-лейн");
        return res.json();
      })
      .then((data) => {
        const colorName = data.team_color;
        const hexMap = JSON.parse(pitLaneDiv.dataset.teamPickerHexMap);
        const hex = hexMap[colorName];

        pitLaneDiv.style.backgroundColor = hex;
        pitLaneDiv.style.borderColor = hex;

        console.log("this", this.teamBoxTargets);
        this.teamBoxTargets.forEach((el) => {
          el.classList.remove("ring-4", "ring-offset-2", "ring-white");
        });
        this.selectedTeamId = null;
      })
      .catch(() => {
        alert("Не удалось назначить команду на пит-лейн.");
      });
  }

  addTeam(event) {
    event.preventDefault();
    const raceId = this.raceId;
    const pitLaneName = event.currentTarget.dataset.pitLaneName;

    fetch("/teams", {
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
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка создания команды");
        return res.json();
      })
      .then((data) => {
        this._appendTeamBox(data.id, data.name, data.pit_lane_name);
      })
      .catch(() => {
        alert("Не удалось создать команду. Попробуйте ещё раз.");
      });
  }

  _appendTeamBox(id, name, pitLane) {
    const container = this.element.querySelector(".teams-container" + pitLane);
    if (!container) return;

    const div = document.createElement("div");
    div.setAttribute(
      "data-action",
      "click->team-picker#assignToTeam dblclick->team-picker#selectTeamForPit",
    );

    div.setAttribute("data-team-picker-team-id", id);
    div.setAttribute("data-team-picker-target", "teamBox");
    div.style.backgroundColor = "#636363";
    div.className =
      "w-16 h-16 rounded-full m-2 flex items-center justify-center text-xl font-semibold text-white cursor-pointer transition-shadow hover:shadow-lg";

    div.textContent = name;

    container.appendChild(div);
  }
}
