import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/message")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.reply);
        setMessage(data.message);
      })
      .catch(() => setError("Could not reach the server. Is it running?"));
  }, []);

  return (
    <div className="app">
      <h1>React + Express</h1>
      <p>{error ?? message?.reply}</p>
    </div>
  );
}

export default App;
