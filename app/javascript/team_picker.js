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
      this.teams = JSON.parse(this.$el.dataset.teams);
      this.pitLaneA = JSON.parse(this.$el.dataset.pitLaneA);
      this.pitLaneB = JSON.parse(this.$el.dataset.pitLaneB);
      this.raceId = JSON.parse(this.$el.dataset.raceId);
    },

    selectColor(event) {
      const chosenColor = event.currentTarget.dataset.teamPickerColor;
      const chosenHex = event.currentTarget.dataset.teamPickerHex;

      this.color = chosenColor;
      this.hex = chosenHex;

      this.$el.querySelectorAll('[data-team-picker-color]').forEach((el) => {
        if (el.dataset.teamPickerColor === chosenColor) {
          el.classList.add('ring-4', 'ring-offset-2', 'ring-white');
        } else {
          el.classList.remove('ring-4', 'ring-offset-2', 'ring-white');
        }
      });
    },

    selectTeam(event) {
      if (this.color != null) {
        return this.assignToTeam(event);
      }

      const chosenTeamId = event.currentTarget.dataset.teamPickerTeamId;
      this.selectedTeamId = chosenTeamId;

      this.$el.querySelectorAll('[data-team-picker-team-id]').forEach((el) => {
        if (el.dataset.teamPickerTeamId === chosenTeamId) {
          el.classList.add('ring-4', 'ring-offset-2', 'ring-white');
        } else {
          el.classList.remove('ring-4', 'ring-offset-2', 'ring-white');
        }
      });
    },

    deleteTeamFromPitLane(event) {
      event.preventDefault();
      const pitLaneName = event.currentTarget.dataset.deleteTeamPitlane;
      const raceId = this.raceId;

      fetch('/teams/delete_last_for_pit', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content,
        },
        body: JSON.stringify({ pit_lane_name: pitLaneName, race_id: raceId }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Ошибка удаления');
          return res.json();
        })
        .then((data) => {
          const teamDiv = this.$el.querySelector(`[data-team-picker-team-id="${data.team_id}"]`);
          if (teamDiv) teamDiv.remove();
        })
        .catch(() => {
          alert('Не удалось удалить команду.');
        });
    },

    assignToTeam(event) {
      const teamDiv = event.currentTarget;
      const teamId = teamDiv.dataset.teamPickerTeamId;
      const color = this.color;
      const hex = this.hex;

      if (!color) return;

      fetch(`/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content,
        },
        body: JSON.stringify({ team: { color: color } }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Ошибка сохранения');
          return res.json();
        })
        .then(() => {
          teamDiv.style.backgroundColor = hex;
          this.color = null;
          this.hex = null;
          this.selectedTeamId = null;

          this.$el.querySelectorAll('[data-team-picker-color]').forEach((el) => {
            el.classList.remove('ring-4', 'ring-offset-2', 'ring-white');
          });
        })
        .catch(() => {
          alert('Не удалось сохранить цвет. Попробуйте ещё раз.');
        });
    },

    assignTeamToPitLane(event) {
      event.preventDefault();
      const pitLaneDiv = event.currentTarget;
      const pitLaneId = pitLaneDiv.dataset.teamPickerPitLaneId;
      const teamId = this.selectedTeamId;

      if (!teamId) return;

      fetch(`/pit_lanes/${pitLaneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content,
        },
        body: JSON.stringify({ pit_lane: { team_id: teamId } }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Ошибка назначения на пит-лейн');
          return res.json();
        })
        .then((data) => {
          const colorName = data.team_color;
          const hexMap = JSON.parse(pitLaneDiv.dataset.teamPickerHexMap);
          const hex = hexMap[colorName];
          pitLaneDiv.style.backgroundColor = hex;
          pitLaneDiv.style.borderColor = hex;
          this.$el.querySelectorAll('[data-team-picker-team-id]').forEach((el) => {
            el.classList.remove('ring-4', 'ring-offset-2', 'ring-white');
          });
          this.selectedTeamId = null;
        })
        .catch(() => {
          alert('Не удалось назначить команду на пит-лейн.');
        });
    },

    addTeam(event) {
      event.preventDefault();
      const raceId = this.raceId;
      const pitLaneName = event.currentTarget.dataset.pitLaneName;

      fetch('/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content,
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
          if (!res.ok) throw new Error('Ошибка создания команды');
          return res.json();
        })
        .then((data) => {
          this._appendTeamBox(data.id, data.name, data.pit_lane_name);
        })
        .catch(() => {
          alert('Не удалось создать команду. Попробуйте ещё раз.');
        });
    },

    _appendTeamBox(id, name, pitLane) {
      const container = this.$el.querySelector('.teams-container' + pitLane);
      if (!container) return;

      const div = document.createElement('div');
      div.setAttribute('data-team-picker-team-id', id);
      div.style.backgroundColor = '#636363';
      div.className =
        'w-16 h-16 rounded-full m-2 flex items-center justify-center text-xl font-semibold text-white cursor-pointer transition-shadow hover:shadow-lg';
      div.textContent = name;
      div.addEventListener('click', (e) => this.assignToTeam(e));

      container.appendChild(div);
    },
  };
}

