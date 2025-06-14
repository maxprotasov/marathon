class Team < ApplicationRecord
  belongs_to :race

  after_initialize :set_defaults, if: :new_record?

  validates :name, presence: true
  validates :color, presence: true
  validates :timer, numericality: { greater_than_or_equal_to: 0 }
  validates :completed_stints, numericality: { greater_than_or_equal_to: 0 }

  def self.assign_to_pit(params)
    updated_team = where(race_id: params[:race_id], id: params[:id])
    .order(created_at: :desc)
    .first

    updated_team_color = updated_team.color
    
    pit_lane_teams = where(race_id: params[:race_id], pit_lane_team: true, pit_lane_name: params[:pit_lane_name]).order(created_at: :asc)
    next_team_color = pit_lane_teams.first.color

    colors = pit_lane_teams.pluck(:color)
    colors.push(colors.shift)

    transaction do
      updated_team.update!(color: next_team_color)
      pit_lane_teams.zip(colors).each { |team, col| team.update!(color: col) }
      pit_lane_teams.last.update!(color: updated_team_color)
    end
    return {pit_lane_team: pit_lane_teams.first, updated_team: updated_team}
  end

  private

  def set_defaults
    return unless race
    self.timer ||= race.max_stint_length
    self.completed_stints ||= race.current_stint
  end
end
