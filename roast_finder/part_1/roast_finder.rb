# Accompanying article: https://serpapi.com/blog/scrape-google-maps-reviews-for-londons-best-roast-dinner-part-1/
# frozen_string_literal: true
# Require the SerpApi Ruby library
require 'serpapi'
# Require the Ruby JSON tools
require 'json'
# Require our pub.rb file (to have access to the Pub class)
require_relative 'pub'

# Represents a 'roast finder', responsible for finding roast-serving pubs
class RoastFinder
	attr_accessor :pubs
	
	API_KEY = "YOUR API KEY"
	
	def initialize
		@lat = 51.51
		@long = -0.13
	end

	# Main workflow: search, build, analyze, score, and output pubs
	def run
		pub_data = fetch_pubs_at(@lat, @long)
		@pubs = build_pubs(pub_data)
		output_pubs
	end  

	# Fetch pubs at a specific lat/lng using SerpApi
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
	  
	# Build Pub objects from pub data hashes
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
	  
	def output_pubs
		puts "#{pubs.count} Pubs Found:"
		puts JSON.pretty_generate(pubs.map(&:to_h))
	end
end
	
# Main execution entry point
if __FILE__ == $PROGRAM_NAME
	RoastFinder.new.run
end