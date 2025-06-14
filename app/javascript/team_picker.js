import {
  combine,
  createStore,
  createEvent,
  createEffect,
  sample,
} from "effector";

const setColor = createEvent();
const setTeam = createEvent();
const setTeams = createEvent();
const setPitLaneTeams = createEvent();
const assignTeamToPitLane = createEvent();
const assignToTeam = createEvent();
const selectColor = createEvent();
const addTeam = createEvent();
const deleteTeamFromPitLane = createEvent();
const clearSelection = createEvent();
const clearSelectedTeamId = createEvent();
const selectTeamId = createEvent();
const setRaceId = createEvent();
const reorderSnake = createEvent();

const assignColorFx = createEffect().use(async ({ teamId }) => {
  const res = await fetch(`/teams/${teamId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
    },
    body: JSON.stringify({
      team: { color: $selectedColor.getState(), id: teamId },
    }),
  });
  if (!res.ok) throw new Error("Ошибка сохранения");
  return res.json();
});

const assignPitLaneFx = createEffect().use(async (pitLaneId) => {
  const res = await fetch(
    `/teams/${$selectedTeamId.getState()}/update_pit_lane`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
      },
      body: JSON.stringify({
        team: {
          pit_lane_name: pitLaneId,
          id: $selectedTeamId.getState(),
          race_id: $currentRaceId.getState(),
        },
      }),
    },
  );
  if (!res.ok) throw new Error("Ошибка назначения на пит-лейн");
  return res.json();
});

const addTeamFx = createEffect().use(async ({ raceId, pitLaneName }) => {
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

const deleteTeamFx = createEffect().use(async ({ pitLaneName, raceId }) => {
  const res = await fetch(`/teams/${$selectedTeamId.getState()}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
    },
    body: JSON.stringify({
      pit_lane_name: pitLaneName,
      race_id: raceId,
    }),
  });
  if (!res.ok) throw new Error("Ошибка удаления");
  return res.json();
});

sample({
  clock: selectColor,
  target: setColor,
});

sample({
  clock: addTeam,
  target: addTeamFx,
});

sample({
  clock: assignToTeam,
  target: assignColorFx,
});

sample({
  clock: assignTeamToPitLane,
  filter: () => $selectedTeamId.getState(),
  target: assignPitLaneFx,
});

sample({
  clock: deleteTeamFromPitLane,
  target: deleteTeamFx,
});

sample({
  clock: assignPitLaneFx.doneData,
  target: clearSelectedTeamId,
});

sample({
  clock: assignPitLaneFx.doneData,
  target: reorderSnake.prepend((data) => ({ id: data.team.id, pitLane: true })),
});

sample({
  clock: deleteTeamFx.doneData,
  target: clearSelectedTeamId,
});

const $pitLaneStore = createStore([])
  .on(setPitLaneTeams, (_, data) => data)
  .on(addTeamFx.doneData, (state, data) => [...state, data])
  .on(assignPitLaneFx.doneData, (state, res) => res.pit_lane_teams)
  .on(assignColorFx.doneData, (teams, team) =>
    teams.map((data) => (data.id === team.id ? team : data)),
  )
  .on(deleteTeamFx.doneData, (state, data) =>
    state.filter((team) => team.id !== Number(data.team_id)),
  );

const $selectedTeamId = createStore(null)
  .on(selectTeamId, (currentTeamId, data) =>
    currentTeamId === data ? null : data,
  )
  .on(clearSelectedTeamId, () => null);

const $selectedColor = createStore(null)
  .on(setColor, (currentColor, color) =>
    currentColor === color ? null : color,
  )
  .on(assignColorFx.doneData, () => null);

const $currentRaceId = createStore(null).on(setRaceId, (_, raceId) => raceId);

const $snakeTeams = createStore([])
  .on(setTeams, (_, data) => [
    ...data,
    { id: "line", name: "", pitLaneBlock: true },
  ])
  .on(assignColorFx.doneData, (teams, team) =>
    teams.map((data) => (data.id === team.id ? team : data)),
  )
  .on(addTeamFx.doneData, (data) => data)
  .on(assignPitLaneFx.doneData, (state, res) =>
    state.map((data) => (data.id === res.team.id ? res.team : data)),
  )
  .on(deleteTeamFx.doneData, (state, data) =>
    state.filter((team) => team.id !== Number(data.team_id)),
  )
  .on(reorderSnake, (list, { id, pitLane = false }) => {
    const lineIdx = list.findIndex((l) => l.pitLaneBlock);
    const lineSlice = list.slice(lineIdx);
    const rest = list.slice(0, lineIdx);

    const idx = rest.findIndex((t) => t.id === id);

    const item = rest[idx];
    const itemAfterLine = lineSlice.find((i) => i.id === id);
    const newRest = [...rest.slice(0, idx), ...rest.slice(idx + 1)];

    if (!pitLane && idx === -1) {
      const newRest2 = [...rest.slice(0, lineIdx), ...rest.slice(lineIdx + 1)];
      return [
        ...newRest2,
        itemAfterLine,
        ...lineSlice.filter((i) => itemAfterLine.id != i.id),
      ];
    }
    if (pitLane) {
      return [...newRest, ...lineSlice, item];
    } else {
      // стандартно — в конец
      return [...newRest, item, ...lineSlice];
    }
  });

// .on(reorderSnake, (list, id, pitLane) => {
//  const idx = list.findIndex((t) => t.id === id);

//if (idx === -1) return list;
// const item = list[idx];

// return [...list.slice(0, idx), ...list.slice(idx + 1), item];
// });

const $teamsStore = createStore([])
  .on(setTeams, (_, data) => data)
  .on(assignColorFx.doneData, (teams, team) =>
    teams.map((data) => (data.id === team.id ? team : data)),
  )
  .on(addTeamFx.doneData, (data) => data)
  .on(assignPitLaneFx.doneData, (state, res) => res.active_teams)
  .on(deleteTeamFx.doneData, (state, data) =>
    state.filter((team) => team.id !== Number(data.team_id)),
  );
const $ourTeams = combine($teamsStore, (teams) =>
  teams.filter((team) => team.our_team),
);

export const stores = {
  $teamsStore,
  $pitLaneStore,
  $selectedColor,
  $selectedTeamId,
  $currentRaceId,
  $snakeTeams,
  $ourTeams,
};

export const actions = {
  setTeam,
  setTeams,
  assignTeamToPitLane,
  assignToTeam,
  selectColor,
  addTeam,
  deleteTeamFromPitLane,
  clearSelection,
  selectTeamId,
  setPitLaneTeams,
  setRaceId,
  reorderSnake,
};

export const store = combine(stores);
