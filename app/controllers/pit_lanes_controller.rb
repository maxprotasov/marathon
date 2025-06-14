class PitLanesController < ApplicationController
  before_action :set_pit_lane, only: [:update]

  def update
    if @pit_lane.update(pit_lane_params)

      Team.assign_to_pit(pit_lane_params, params[:id])
      render json: @pit_lane, status: :ok
    else
      render json: { errors: @pit_lane.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_pit_lane
    @pit_lane = PitLane.find_by(name: params[:id])
  end

  def pit_lane_params
    params.require(:pit_lane).permit(:team_id, :race_id, :id)
  end
end
