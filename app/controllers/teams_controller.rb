class TeamsController < ApplicationController
  before_action :set_team, only: [:update, :destroy]

  def create
    @race = Race.find(team_params[:race_id])

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
    binding.pry
    Team.find(params[:id]).destroy
    head :no_content
  end

  def update
    if @team.update(team_params)
      render json: { id: @team.id, color: @team.color }, status: :ok
    else
      render json: { errors: @team.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def delete_last_for_pit
    binding.pry
    pit_lane_name = params.require(:pit_lane_name)
    race_id     = params.require(:race_id)

    deleted = Team.delete_last_for_pit_and_race(pit_lane_name, race_id)

    if deleted
      head :no_content
    else
      render json: { error: "Команда не найдена" }, status: :not_found
    end
  end

  private

  def set_team
    @team = Team.find(params[:id])
  end

  def add_team 
    @team = Team.new()
  end

  def team_params
    params.require(:team).permit(:name, :race_id, :team_id, :color, :pit_lane_name, :pit_lane_team)
  end
end

