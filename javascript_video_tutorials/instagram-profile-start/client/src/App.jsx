import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import BestWorst from "./BestWorst";

function App() {
  const [profile, setProfile] = useState(" ");
  const [profileHtml, setProfileHtml] = useState("");
  const [profileData, setProfileData] = useState();
  const getInstagramData = async () => {
    const response = await fetch(`/api/instagram/${profile}`);
    const json = await response.json();

    setProfileData(json.profile_results);
    const htmlResponse = await fetch(json.search_metadata.prettify_html_file);
    const html = await htmlResponse.text();
    setProfileHtml(html);
    console.log(json);
  };

  return (
    <>
      <section id="center">
        <h1>Instagram Profile Tracker</h1>

        <div>
          <p>{profile || " "}</p>
          <input
            name="ig-profile"
            type="text"
            onChange={(e) => setProfile(e.target.value)}
          ></input>
        </div>
        <button type="button" onClick={getInstagramData}>
          Submit
        </button>
      </section>

      <div className="results-layout">
        <div className="profile-html">
          {profileHtml && <iframe srcDoc={profileHtml}></iframe>}
        </div>
        {profileData && <BestWorst igHandle={profile} />}
      </div>
    </>
  );
}

export default App;
