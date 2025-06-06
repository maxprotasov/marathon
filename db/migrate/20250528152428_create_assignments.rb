class CreateAssignments < ActiveRecord::Migration[8.0]
  def change
    create_table :assignments do |t|
      t.references :driver, null: false, foreign_key: true
      t.references :kart, null: false, foreign_key: true
      t.references :race, null: false, foreign_key: true
      t.references :pit_lane, null: false, foreign_key: true
      t.integer :sequence
      t.datetime :start_time
      t.datetime :end_time

      t.timestamps
    end
  end
end
