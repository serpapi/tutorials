import { useState } from "react";
import "./App.css";
import { useEffect } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getPosts(userId) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    const data = await res.json();
    console.log("Data", data)
  }
  useEffect( () => {
    console.log("HELLO")
     getPosts(1)
  }, [])
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
