require 'serpapi'
require 'json'
require_relative 'pub'
# Require our city_grid.rb file (to have access to the CityGrid class)
require_relative 'city_grid'

LONDON_GRID = {
	lat_min:  51.28,
	lat_max:  51.70,
	lng_min:  -0.50,
	lng_max:   0.30,
	grid_step: 0.05
}.freeze

class RoastFinder
	# adds a getter method for city_grid
  attr_reader :pubs, :city_grid
  
  API_KEY = "c9cd8fb87df553a583b35ed4094040008eb390619b5dafcf88db097ddf87376c"
  
  # Instantiates a CityGrid object and assigns it to @city_grid
  def initialize
    @city_grid = CityGrid.new(LONDON_GRID)
  end

  # Adds call to grid_search
  def run
		pub_data = grid_search
		@pubs = build_pubs(pub_data)
		output_pubs
  end
  
  # Generate all grid points for the bounding box using CityGrid
	def grid_points
		city_grid.points
	end

	# Perform a grid search over the bounding box, deduplicate pubs by data_id
	def grid_search
		seen = {}
		all_pubs = []
		grid_points.each do |lat, lng|
			pubs = fetch_pubs_at(lat, lng)
			pubs.each do |pub|
				next if seen[pub[:data_id]]
				seen[pub[:data_id]] = true
				all_pubs << pub
			end
		end
		all_pubs
	end

  def fetch_pubs_at(lat, lng)
    ll = format('@%.4f,%.4f,13z', lat, lng)
    p "Fetching pub at #{ll}"
    maps_params = {
      api_key: API_KEY,
      engine: 'google_maps',
      q: 'pub sunday roast',
      google_domain: 'google.co.uk',
      gl: 'uk',
      ll: ll,
      type: 'search',
      hl: 'en',
    }

    client = SerpApi::Client.new(maps_params)
    client.search[:local_results] || []
  end
    
  def build_pubs(pub_data)
    pub_data.map do |pub_hash|
      Pub.new(
        name: pub_hash[:title],
        address: pub_hash[:address],
        rating: pub_hash[:rating],
        place_id: pub_hash[:data_id]
      )
    end
  end
    
  # Outputs count of pubs scraped and first 5 in collection
	def output_pubs(n = 5)
		puts "#{pubs.count} Pubs Found"
		puts "First #{n} examples:"
		puts JSON.pretty_generate(pubs.first(n).map(&:to_h))
	end
end
	
# Main execution entry point.
if __FILE__ == $PROGRAM_NAME
  RoastFinder.new.run
end