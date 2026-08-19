import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

const TIMELINE_MINUTES = 90;
const TIMELINE_STEP = 10;
const POLL_INTERVAL_MS = 1000;

function App() {
  const [count, setCount] = useState(0);
  const [serverMessage, setServerMessage] = useState("Connecting to server...");
  const [spain, setSpain] = useState(0);
  const [belgium, setBelgium] = useState(0);
  const [shotEvents, setShotEvents] = useState([]);
  const prevShotsRef = useRef(null);

  useEffect(() => {
    let intervalId;

    const fetchShots = () => {
      fetch("/api/getShots")
        .then((res) => res.json())
        .then((data) => {
          setSpain(data.spain);
          setBelgium(data.belgium);

          const prev = prevShotsRef.current;
          if (
            prev &&
            (data.spain !== prev.spain || data.belgium !== prev.belgium)
          ) {
            setShotEvents((events) => [
              ...events,
              { minute: data.time.minute, second: data.time.second },
            ]);
          }
          prevShotsRef.current = { spain: data.spain, belgium: data.belgium };

          if (data.time.minute >= TIMELINE_MINUTES) {
            clearInterval(intervalId);
          }
        })
        .catch((err) => {
          console.error("Error", err);
          setServerMessage("Could not reach server");
        });
      console.log("Calling SerpApi");
    };

    fetchShots();
    intervalId = setInterval(fetchShots, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  const ticks = [];
  for (let minute = 0; minute <= TIMELINE_MINUTES; minute += TIMELINE_STEP) {
    ticks.push(minute);
  }

  return (
    <>
      <section id="center">
        <div className="hero"></div>
        <div className="timeline">
          <div className="timeline-track"></div>
          {ticks.map((minute) => (
            <div
              key={minute}
              className="timeline-tick"
              style={{ left: `${(minute / TIMELINE_MINUTES) * 100}%` }}
            >
              <span className="timeline-mark"></span>
              <span className="timeline-label">{minute}'</span>
            </div>
          ))}
          {shotEvents.map((event, i) => (
            <div
              key={i}
              className="timeline-event"
              style={{
                left: `${((event.minute + event.second / 60) / TIMELINE_MINUTES) * 100}%`,
              }}
              title={`Shot at ${event.minute}:${String(event.second).padStart(2, "0")}`}
            ></div>
          ))}
        </div>
      </section>

      <section id="spacer"></section>
    </>
  );
}

export default App;
