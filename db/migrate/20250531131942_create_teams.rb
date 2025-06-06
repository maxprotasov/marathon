class CreateTeams < ActiveRecord::Migration[8.0]
  def change
    create_table :teams do |t|
      t.references :race, null: false, foreign_key: true
      t.string :name, null: false
      t.string :color, default: 'grey', null: false
      t.integer :timer, default: 1, null: false
      t.boolean :our_team, default: false, null: false
      t.integer :completed_stints, default: 0, null: false
      t.integer :team_number, default: 0, null: false

      t.timestamps
    end
  end
end
