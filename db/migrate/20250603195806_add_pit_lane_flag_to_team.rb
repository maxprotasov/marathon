class AddPitLaneFlagToTeam < ActiveRecord::Migration[8.0]
  def change
    add_column :teams, :pit_lane_name, :string, default: nil
    add_column :teams, :pit_lane_team, :boolean, default: false
  end
end
