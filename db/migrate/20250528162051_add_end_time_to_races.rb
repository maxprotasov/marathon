class AddEndTimeToRaces < ActiveRecord::Migration[8.0]
  def change
    add_column :races, :end_race_time, :datetime
  end
end
