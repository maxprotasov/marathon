import { createStore, createEvent } from 'effector'

export default function teamPicker(teams, raceId, colors = {}) {
  const selectColor = createEvent()
  const selectTeam = createEvent()
  const reset = createEvent()

  const $color = createStore(null)
    .on(selectColor, (_, payload) => payload)
    .on(reset, () => null)
  const $team = createStore(null)
    .on(selectTeam, (_, id) => id)
    .on(reset, () => null)

  return {
    teams,
    raceId,
    colors,
    pitLaneAColor: null,
    pitLaneBColor: null,
    color: $color.getState(),
    hex: null,
    selectedTeamId: $team.getState(),
    init() {
      $color.watch(v => { this.color = v?.color; this.hex = v?.hex })
      $team.watch(v => { this.selectedTeamId = v })
    },
    chooseColor(color, hex) {
      selectColor({ color, hex })
    },
    chooseTeam(id) {
      if (this.color) {
        this.assignColor(id)
      } else {
        selectTeam(id)
      }
    },
    assignColor(id) {
      const color = this.color
      const hex = this.hex
      if (!color) return
      fetch(`/teams/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content
        },
        body: JSON.stringify({ team: { color } })
      }).then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      }).then(() => {
        const team = this.teams.find(t => t.id == id)
        if (team) team.color = color
        reset()
      }).catch(() => alert('Не удалось сохранить цвет. Попробуйте ещё раз.'))
    },
    assignTeamToPit(pitLaneId, lane) {
      const id = this.selectedTeamId
      if (!id) return
      fetch(`/pit_lanes/${pitLaneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content
        },
        body: JSON.stringify({ pit_lane: { team_id: id } })
      }).then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      }).then(data => {
        const colorName = data.team_color
        const hex = this.colors[colorName]
        if (lane === 'A') this.pitLaneAColor = colorName
        if (lane === 'B') this.pitLaneBColor = colorName
        reset()
      }).catch(() => alert('Не удалось назначить команду на пит-лейн.'))
    },
    addTeam(pitLaneName) {
      fetch('/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content
        },
        body: JSON.stringify({ team: { pit_lane_name: pitLaneName, race_id: this.raceId, pit_lane_team: true } })
      }).then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      }).then(data => {
        this.teams.push({ id: data.id, name: data.name, color: data.pit_lane_name })
      }).catch(() => alert('Не удалось создать команду. Попробуйте ещё раз.'))
    },
    deleteTeam(id) {
      fetch(`/teams/${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content }
      }).then(res => {
        if (!res.ok) throw new Error()
        this.teams = this.teams.filter(t => t.id != id)
      }).catch(() => alert('Не удалось удалить команду.'))
    },
    deleteTeamFromPit(pitLaneName) {
      fetch('/teams/delete_last_for_pit', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').content
        },
        body: JSON.stringify({ pit_lane_name: pitLaneName, race_id: this.raceId })
      }).catch(() => alert('Не удалось удалить команду.'))
    }
  }
}
