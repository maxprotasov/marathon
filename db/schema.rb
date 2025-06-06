# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_06_03_195806) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "assignments", force: :cascade do |t|
    t.bigint "driver_id", null: false
    t.bigint "kart_id", null: false
    t.bigint "race_id", null: false
    t.bigint "pit_lane_id", null: false
    t.integer "sequence"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["driver_id"], name: "index_assignments_on_driver_id"
    t.index ["kart_id"], name: "index_assignments_on_kart_id"
    t.index ["pit_lane_id"], name: "index_assignments_on_pit_lane_id"
    t.index ["race_id"], name: "index_assignments_on_race_id"
  end

  create_table "drivers", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "karts", force: :cascade do |t|
    t.integer "number"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pit_lanes", force: :cascade do |t|
    t.string "name"
    t.bigint "race_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "team_id"
    t.integer "default_carts_in_pit", default: 2
    t.index ["race_id"], name: "index_pit_lanes_on_race_id"
    t.index ["team_id"], name: "index_pit_lanes_on_team_id"
  end

  create_table "races", force: :cascade do |t|
    t.string "name"
    t.datetime "start_time"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "end_race_time"
    t.integer "duration_minutes", default: 0, null: false
    t.integer "stints_length", default: 1, null: false
    t.integer "max_stint_time", default: 1, null: false
    t.integer "pit_lane_count", default: 1, null: false
    t.integer "teams_count", default: 0, null: false
  end

  create_table "teams", force: :cascade do |t|
    t.bigint "race_id", null: false
    t.string "name", null: false
    t.string "color", default: "grey", null: false
    t.integer "timer", default: 1, null: false
    t.boolean "our_team", default: false, null: false
    t.integer "completed_stints", default: 0, null: false
    t.integer "team_number", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "team_id", default: 0
    t.string "pit_lane_name"
    t.boolean "pit_lane_team", default: false
    t.index ["race_id"], name: "index_teams_on_race_id"
  end

  add_foreign_key "assignments", "drivers"
  add_foreign_key "assignments", "karts"
  add_foreign_key "assignments", "pit_lanes"
  add_foreign_key "assignments", "races"
  add_foreign_key "pit_lanes", "races"
  add_foreign_key "teams", "races"
end
