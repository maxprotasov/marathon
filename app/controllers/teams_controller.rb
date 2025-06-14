class TeamsController < ApplicationController
  before_action :set_team, only: [:update, :update_pit_lane]
  before_action :set_race, only: [:destroy, :update_pit_lane, :create]

  def create
    @team = Team.new(
      pit_lane_name: team_params[:pit_lane_name],
      pit_lane_team: team_params[:pit_lane_team],
      race_id: team_params[:race_id],
      name: "#{@race.teams.length+1}",
      team_id: @race.teams.length+1,
    )

    if @team.save
      render json: @team, status: :created
    else
      render json: { errors: @team.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @race.teams.find(params[:id]).destroy
    render json: {team_id: params[:id]}, status: :ok
  end

  def update
    if @team.update(team_params)
      render json: @team, status: :ok
    else
      render json: { errors: @team.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update_pit_lane
    data = Team.assign_to_pit(team_params)
    @team.update(completed_stints: @team.completed_stints + 1)
    @ordered_teams = @race.teams.order(:team_id)
    @active_teams = @ordered_teams.where(pit_lane_team: false)
    @pit_lane_karts = @ordered_teams.where(pit_lane_team: true)
    @team = @active_teams.find(params[:id])

    render json: {active_teams: @active_teams, pit_lane_teams: @pit_lane_karts, team: @team}, status: :ok
  end

  private

  def set_team
    @team = Team.find(team_params[:id])
  end

  def set_race
    @race = Race.find(team_params[:race_id])
  end

  def add_team 
    @team = Team.new()
  end

  def team_params
    params.require(:team).permit(:name, :race_id, :team_id, :color, :pit_lane_name, :pit_lane_team, :id)
  end
end

