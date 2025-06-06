class AddDurationAndNullableStartTimeToRaces < ActiveRecord::Migration[8.0]
  def change
    add_column :races, :duration_minutes, :integer, null: false, default: 0
    change_column_null :races, :start_time, true
  end
end
