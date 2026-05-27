import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [profile, setProfile] = useState(" ")
  const [profileHtml, setProfileHtml] = useState("")
  const getPosts = async () => {
    const params = new URLSearchParams({
      engine: "instagram_profile",
      profile_id: profile,
      api_key: import.meta.env.VITE_SERPAPI_API_KEY
    });
    const response = await fetch(`https://serpapi.com/search?${params}`);
    const json = await response.json();
    const htmlResponse = await fetch(json.search_metadata.prettify_html_file);
    const html = await htmlResponse.text();
    setProfileHtml(html)
    console.log(json)
  }

  return (
    <>
      <section id="center">
        <h1>Instagram Profile Tracker</h1>
        
        <div>
          <p>{profile || ' '}</p>
          <input name="ig-profile" type="text" onChange={(e) => setProfile(e.target.value)}></input>
        </div>
        <button
          type="button"
          onClick={getPosts}
        >
          Submit
        </button>
        <div className="profile-html">
          {profileHtml && <iframe srcDoc={profileHtml}></iframe>}
        </div>
      </section>
    </>
  )
}

export default App
