class RacesController < ApplicationController
  before_action :set_race, only: %i[ show edit update destroy ]

  def index
    @races = Race.order(:start_time)
  end

  def show
    @ordered_teams = @race.teams.order(:team_id)
    @active_teams = @ordered_teams.where(pit_lane_team: false)
    @pit_lane_karts = @ordered_teams.where(pit_lane_team: true)
  end

  def new
    @race = Race.new
    @race.duration_hours = 1
    @race.duration_minutes_input = 0
    @race.stints_length = 0
    @race.max_stint_time = 1
    @race.pit_lane_count = 1
    @race.teams_count = 0
  end

  def edit
    @race.duration_hours = @race.duration_minutes / 60
    @race.duration_minutes_input = @race.duration_minutes % 60
  end

  def create
    @race = Race.new(race_params)

    if @race.save
      create_teams_for(@race)
      redirect_to @race, notice: 'Гонка создана.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @race.update(race_params)
      redirect_to @race, notice: 'Race was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @race.destroy
    redirect_to races_url, notice: 'Race was successfully destroyed.'
  end

  def start
    @race = Race.find(params[:id])

    @race.update!(
      start_time: Time.current
    )
      redirect_to @race, notice: "Гонка началась!"
  end

  private

  def set_race
    @race = Race.find(params[:id])
  end

  def race_params
    params.require(:race).permit(
      :name,
      :start_time,
      :duration_hours,
      :duration_minutes_input,
      :stints_length,
      :max_stint_time,
      :pit_lane_count,
      :teams_count
    )
  end

  def create_teams_for(race)
    return if race.teams_count.to_i <= 0

    race.pit_lanes.create!(name: 'A')
    race.pit_lanes.create!(name: 'B')

    our_teams = params[:race][:team_updates]

    (1..race.teams_count.to_i).each do |i|
      our_team = our_teams.select {|t| t[:id].to_i === i}.first

      race.teams.create!(
        name: "#{our_team.blank? ? i : our_team[:name]}",
        team_id: i,
        our_team: !our_team.blank? 
      )
    end
  end

  def adjust_teams_for(race, old_count)
    new_count = race.teams_count.to_i
    return if new_count == old_count

    if new_count > old_count
      # Добавляем недостающие команды
      ((old_count + 1)..new_count).each do |i|
        race.teams.create!(
          name: "#{i}",
          team_id: i,
        )
      end
    else
      to_delete = old_count - new_count
      race.teams.order(id: :desc).limit(to_delete).destroy_all
    end
  end
end
