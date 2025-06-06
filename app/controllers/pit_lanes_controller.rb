class PitLanesController < ApplicationController
  before_action :set_pit_lane, only: [:update]

  def update
    if @pit_lane.update(pit_lane_params)
      render json: {
        id: @pit_lane.id,
        team_id: @pit_lane.team_id,
        team_name: @pit_lane.team&.name,
        team_color: @pit_lane.team&.color    # вернём цвет, чтобы JS мог обновить фон
      }, status: :ok
    else
      render json: { errors: @pit_lane.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_pit_lane
    @pit_lane = PitLane.find(params[:id])
  end

  def pit_lane_params
    params.require(:pit_lane).permit(:team_id)
  end
end
