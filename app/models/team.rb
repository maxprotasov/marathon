class Team < ApplicationRecord
  belongs_to :race

  # При создании устанавливаем timer и completed_stints в соответствии с Race
  after_initialize :set_defaults, if: :new_record?

  validates :name, presence: true
  validates :color, presence: true
  validates :timer, numericality: { greater_than_or_equal_to: 0 }
  validates :completed_stints, numericality: { greater_than_or_equal_to: 0 }

  def self.delete_last_for_pit_and_race(pit_lane_name, race_id)
    binding.pry
    team = where(race_id: race_id, pit_lane_name: pit_lane_name)
           .order(created_at: :desc)
           .first

    return nil unless team

    team.destroy
    team
  end
  private

  def set_defaults
    return unless race
    # Таймер стартует от max_stint_length
    self.timer ||= race.max_stint_length
    # Пройденные стинты равны текущему стинту гонки
    self.completed_stints ||= race.current_stint
  end
end
