class AddTeamIdToTeams < ActiveRecord::Migration[8.0]
  def change
    add_column :teams, :team_id, :integer, default: 0
  end
end
