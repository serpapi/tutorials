# Amazon Keyword Research using Python

This project demonstrates how to build a simple **Amazon keyword research using Python**.
It retrieves Amazon search results, extracts product titles, and analyzes recurring keywords to help identify commonly targeted search terms.

The project is intended for **educational and experimentation purposes**, and serves as a foundation for building Amazon SEO or market research tools.



## Features

* Retrieve Amazon search results using SerpApi
* Extract product titles from search listings
* Normalize and tokenize text using NLTK
* Perform keyword frequency analysis
* Keep API credentials secure using a `.env` file
* Easy-to-extend project structure



## Project Structure

```
amazon_keyword_research/
├── tracker.py
├── analysis.py
├── .env
└── requirements.txt
```

* `tracker.py` – Fetches Amazon search results and runs the keyword research pipeline
* `analysis.py` – Processes product titles and performs keyword analysis
* `.env` – Stores private API credentials
* `requirements.txt` – Project dependencies


## Requirements

* Python **3.7+**
* A SerpApi account (free tier available)


## Installation

1. Clone the repository:

```bash
git clone https://github.com/serpapi/tutorials.git
cd python_projects/amazon_keyword_research
```

2. (Optional) Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # macOS / Linux
venv\Scripts\activate     # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the project root:

```env
SERPAPI_API_KEY="your_api_key"
```

You can obtain an API key by signing up at **[SerpApi](https://serpapi.com/users/sign_up)**.
SerpApi offers **250 free searches per month**, which is sufficient for testing and prototyping.


## Usage

Run the keyword research system:

```bash
python tracker.py
```

### Example Output

```
Top Amazon keywords:
headphones: 24
wireless: 23
bluetooth: 18
black: 12
noise: 11
lightweight: 10
cancelling: 10
ear: 9
foldable: 9
headset: 9
bass: 9
battery: 9
life: 9
playtime: 8
jbl: 8
```

The output lists the most frequently occurring keywords found in Amazon product titles for the given search query.


## How It Works

1. Submit a seed keyword (e.g. *wireless headphones*)
2. Retrieve Amazon search results using SerpApi
3. Extract product titles
4. Normalize and tokenize text
5. Perform keyword frequency analysis

This approach produces reproducible keyword insights without relying on manual browsing.


## Extending the Project

You can extend this system by:

* Analyzing multiple seed keywords
* Exporting results to CSV
* Tracking keyword trends over time
* Grouping keywords by product features
* Integrating with SEO or advertising tools


## Notes

* This project uses **structured search data**, not HTML scraping
* Designed for learning, experimentation, and prototyping
* Not affiliated with or endorsed by Amazon


## License

This project is provided for educational purposes.
You are free to modify and adapt it to your own use cases.


## Acknowledgments

* [SerpApi](https://serpapi.com/) for providing structured Amazon search data
* [NLTK](https://www.nltk.org/) for text processing utilities
