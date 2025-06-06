class CreateKarts < ActiveRecord::Migration[8.0]
  def change
    create_table :karts do |t|
      t.integer :number
      t.string :color

      t.timestamps
    end
  end
end
