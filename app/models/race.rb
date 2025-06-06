class Race < ApplicationRecord
  has_many :pit_lanes, dependent: :destroy
  has_many :assignments, through: :pit_lanes
  has_many :teams, dependent: :destroy

  # Виртуальные атрибуты для формы
  attr_accessor :duration_hours, :duration_minutes_input

  # Перед валидацией объединяем часы и минуты в минуты
  before_validation :combine_duration

  # Валидации
  validates :name, presence: true
  validates :duration_minutes, presence: true, numericality: { greater_than: 0 }

  private

  def combine_duration
    # Если оба поля пустые — ничего не меняем
    return if duration_hours.blank? && duration_minutes_input.blank?

    self.duration_minutes = duration_hours.to_i * 60 + duration_minutes_input.to_i
  end
end
