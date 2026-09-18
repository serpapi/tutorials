import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    fetch("http://localhost:3001/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query }),
    })
      .then((res) => res.json())
      .then((data) => setMessage(data.reply))
      .catch(() => setError("Could not reach the server. Is it running?"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="app">
      <h1>Food Finder</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Best matcha cafe in Austin, Texas..."
          rows={4}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Submit"}
        </button>
      </form>
      {error ? (
        <div>{error}</div>
      ) : (
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {message}
        </ReactMarkdown>
      )}
    </div>
  );
}

export default App;
