class AddTeamsCountToRaces < ActiveRecord::Migration[8.0]
  def change
    add_column :races, :teams_count, :integer, default: 0, null: false
  end
end
