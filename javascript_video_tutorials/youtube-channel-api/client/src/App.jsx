import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => setResponse(data))
      .catch(() => setResponse({ error: "Could not reach the server" }))
      .finally(() => setLoading(false));
  };

  return (
    <main>
      <h1>YouTube Channel API</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a YouTube channel"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {response?.error && <p>{response.error}</p>}
      {response?.videos_results && (
        <div className="video-grid">
          {response.videos_results.map((video) => (
            <a key={video.video_id} href={video.link} target="_blank" rel="noreferrer">
              <img src={video.thumbnail.static} alt={video.title} />
              <p>{video.title}</p>
              <p className="video-meta">
                {video.views} • {video.published_date}
              </p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

export default App;
