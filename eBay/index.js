const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch();     //your api key from serpapi.com

const searchString = "playstation";                                       // what we want to search
const pagesLimit = 10;                                                    // limit of pages for getting info
let currentPage = 1;                                                      // current page of the search

const params = {
    engine: "ebay",                                                         // search engine
    _nkw: searchString,                                                     // search query
    ebay_domain: "ebay.com",                                                // ebay domain of the search
    _pgn: currentPage,                                                      // page of the search
};

const getOrganicResults = ({ organic_results }) => {
    return organic_results.map((element) => {
        const { link, title, condition = "No condition data", price = "No price data", shipping = "No shipping data", thumbnail = "No image" } = element;
        return {
            link,
            title,
            condition,
            price: price && price.raw ? price.raw : `${price.from?.raw} - ${price.to?.raw}`,
            shipping,
            thumbnail,
        };
    });
};

const getJson = (params) => {
    return new Promise((resolve) => {
        search.json(params, resolve);
    });
};

const getResults = async () => {
    const organicResults = [];
    while (true) {
        if (currentPage > pagesLimit) break;
        const json = await getJson(params);
        if (json.search_information?.organic_results_state === "Fully empty") break;
        organicResults.push(...(await getOrganicResults(json)));
        currentPage++;
    }
    return organicResults;
};

getResults().then(console.log)
