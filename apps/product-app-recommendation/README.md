# AI Product Recommendations

A Next.js web application that searches for products across Google Shopping and Amazon using SerpApi, then uses OpenAI to analyze results and provide AI-powered product recommendations.

## Features

- Natural language product search (e.g., "standing desk under $500")
- Fetches products from Google Shopping and Amazon via SerpApi
- AI-powered insights and recommendations using OpenAI
- Client-side price sorting (low to high, high to low)
- Modern, responsive UI built with Tailwind CSS

## Setup

1. Install dependencies:
	```sh
	npm install
	```

2. Create a `.env.local` file in the project root:
	```env
	SERPAPI_KEY=your_serpapi_key
	OPENAI_API_KEY=your_openai_key
	```

## Usage

Run the development server:
```sh
npm run dev
```

Then open http://localhost:3000

## Dependencies

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- SerpApi
- OpenAI

## Project Structure

- `app/` – pages, layout, and API routes
- `components/` – UI components (SearchForm, ProductCard, ResultsSection)
- `lib/` – external integrations (SerpApi, OpenAI, recommendation engine)


## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this analyzer.

## License

This project is provided as-is for educational purposes. Use at your own discretion and ensure compliance with applicable terms of service and laws.
