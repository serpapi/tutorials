import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [profile, setProfile] = useState(" ")
  const [profileHtml, setProfileHtml] = useState("")
  const [posts, setPosts] = useState([]);
  const getInstagramData = async () => {
    const response = await fetch(`/api/instagram/${profile}`);
  
    const json = await response.json();
    const htmlResponse = await fetch(json.search_metadata.prettify_html_file);
    const html = await htmlResponse.text();
    setProfileHtml(html);
    // sortPosts(json.profile_results.posts)
  
  }

  const sortPosts = (posts) => {
    const sorted = [...posts].sort((a, b) => a.liked_by_count - b.liked_by_count);

    console.log("sorted",sorted)
    setPosts(sorted);
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
          onClick={getInstagramData}
        >
          Submit
        </button>
        <div className="profile-html">
          {profileHtml && <iframe srcDoc={profileHtml}></iframe>}
        </div>
      </section>

      {posts && 
        <section id="best-and-worst">
          
          <div id="top-performing-post"></div>
          <div id="worst-performing-post">
            
            
          </div>
        </section>
      }
    </>
  )
}

export default App
