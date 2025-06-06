class AddFieldsToRaces < ActiveRecord::Migration[8.0]
  def change
    add_column :races, :stints_length, :integer, default: 1, null: false
    add_column :races, :max_stint_time, :integer, default: 1, null: false
    add_column :races, :pit_lane_count, :integer, default: 1, null: false
  end
end
