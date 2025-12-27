# frozen_string_literal: true
# Handles dividing a city bounding box into a grid of points
class CityGrid
  attr_reader :lat_min, :lat_max, :lng_min, :lng_max, :grid_step

  def initialize(grid_config)
    @lat_min = grid_config[:lat_min]
    @lat_max = grid_config[:lat_max]
    @lng_min = grid_config[:lng_min]
    @lng_max = grid_config[:lng_max]
    @grid_step = grid_config[:grid_step]
  end

  # Generate all grid points (lat, lng) within the bounding box
  def points
    points = []
    lat = lat_min
    while lat <= lat_max
      lng = lng_min
      while lng <= lng_max
        points << [lat, lng]
        lng += grid_step
      end
      lat += grid_step
    end
    points
  end
end
