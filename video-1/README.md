# googlemaps

This is a small Node.js project that uses the SerpApi and dotenv packages. It is set up to run from `scrapeData.js`. This project demonstrates SerpApi's Google Maps API by scraping business information. 

After running, you should see a new file named `output.csv` in your root folder. 

## Setup

1. Install dependencies:
	```sh
	npm install
	```

2. Create a `.env` file if required by your code (for API keys or configuration).

## Usage

Run the project with:
```sh
node scrapeData.js
```

## Dependencies

- [dotenv](https://www.npmjs.com/package/dotenv)
- [serpapi](https://www.npmjs.com/package/serpapi)

## License

ISC
