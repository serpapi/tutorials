# frozen_string_literal: trues
# Represents a pub and its associated data
class Pub
	attr_reader :name, :address, :rating, :place_id

  # Represents a pub and its associated data
	def initialize(name:, address:, rating:, place_id:)
		@name = name
		@address = address
		@rating = rating
		@place_id = place_id
	end

	def to_h
		{
			name: name,
			address: address,
			rating: rating,
			place_id: place_id,
		}
	end
end
