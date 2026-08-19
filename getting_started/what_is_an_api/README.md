# Owlbear API Showcase (Static SPA)

This project is a beginner-friendly Single Page Application that demonstrates how JSON values are fetched from an API and interpolated into a frontend.

## Run it

No Ruby, Node, or package installation is required.

1. Download or clone this repository.
2. Open `index.html` in your browser.

## File structure

- `index.html` - page structure
- `styles.css` - styling
- `app.js` - API requests + JSON-to-DOM interpolation

## What this app does

- Loads the monster list from `https://www.dnd5eapi.co/api/2014/monsters`
- Lets users pick a monster from a dropdown
- Fetches the selected monster JSON
- Interpolates values like HP, stats, type, size, and image into the UI
