import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3001/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();

      // const fetchRequests = ids.map( (id) => {
      //   return fetch(
      //     `http://localhost:3001/reviews/${id}`
      //   );
      // })
      // const requests = await Promise.all(fetchRequests);
      // const reviewData = await Promise.all(requests.map((req) => req.json()))

     
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Google Local Search</h1>
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search local places..."
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="results">
        {results.map((place, i) => (
          <div key={i} className="place-card">
            <h2>{place.name}</h2>
            <ul>
              {place.reviews.map((review, j) => (
                <li key={j}>{review.description}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
