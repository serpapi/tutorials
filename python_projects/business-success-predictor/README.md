
# Business Success Predictor

This project uses AI to predict the success of opening a new Coffee Shop (or other business type) in a given location, based on competitor data and customer sentiment analysis.

## Features
- Fetches competitor business data from Google Maps using SerpAPI
- Collects and analyzes customer reviews
- Uses an AI model to generate a strategic business report
- Saves each AI analysis to a timestamped markdown file

## How It Works
1. **User Input**: Enter a location name (e.g., `Austin, TX`) or GPS coordinates (e.g., `30.2957009,-98.0626221`). Type `q` or `quit` to exit.
2. **Data Gathering**: The script fetches competitor Coffee Shops in the area and collects their details and customer reviews.
3. **AI Analysis**: All data is sent to a local AI model (Ollama via OpenAI API) for analysis and prediction.
4. **Results**: The AI's business report is printed to the console and saved as a markdown file (e.g., `ai_response_YYYYMMDD_HHMMSS.md`).

## Usage
1. Clone this repository and install dependencies (see below).
2. Set your SerpAPI key in a `.env` file:
	```env
	SERPAPI_API_KEY=your_serpapi_key_here
	```
3. Start your local Ollama server (or configure the OpenAI client as needed).
4. Run the script:
	```bash
	python main.py
	```
5. Follow the prompt to enter a location or coordinates.

## Output
Each run generates a markdown file containing:
- Market Overview
- Customer Sentiment Analysis
- Success Prediction
- Recommendations and Action Plan

## Example Output
```
Market Overview → Customer Sentiment → Success Prediction → Recommendations
```

## Requirements
- Python 3.9+
- SerpAPI account/key
- Ollama (or compatible local AI model)
- Required Python packages (see [blog tutorial]())

## Logging
All actions and API responses are logged to `debug.log` and also shown in the terminal.
