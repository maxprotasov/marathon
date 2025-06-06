class PitLane < ApplicationRecord
  belongs_to :race
  belongs_to :team, optional: true
end
