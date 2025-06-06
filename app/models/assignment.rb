class Assignment < ApplicationRecord
  belongs_to :driver
  belongs_to :kart
  belongs_to :race
  belongs_to :pit_lane
end
