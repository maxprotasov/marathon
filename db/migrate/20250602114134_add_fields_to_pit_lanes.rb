class AddFieldsToPitLanes < ActiveRecord::Migration[8.0]
  def change
    add_column :pit_lanes, :team_id, :integer
    add_index  :pit_lanes, :team_id
    add_column :pit_lanes, :default_carts_in_pit, :integer, default: 2
  end
end
