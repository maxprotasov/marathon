class CreatePitLanes < ActiveRecord::Migration[8.0]
  def change
    create_table :pit_lanes do |t|
      t.string :name
      t.references :race, null: false, foreign_key: true

      t.timestamps
    end
  end
end
