import { useState } from "react";
import { useEffect } from "react";

function BestWorst({ igHandle }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postsByLikes, setPostsByLikes] = useState([]);
  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      const response = await fetch(`/api/instagram/posts/${igHandle}`);
      const data = await response.json();

      console.log("POSTS", data);
      setPosts(data);
      setPostsByLikes(setPostsByLikes());
      setLoading(false);
    };

    getPosts();
  }, [igHandle]);
  const sortByLikes = () => {
    const sorted = [...posts].sort(
      (a, b) => a.liked_by_count - b.liked_by_count,
    );
    return [sorted[0], sorted[sorted.length - 1]];
  };

  // const sortByComments = () => {
  //     const sorted = [...posts].sort((a, b) => a.comments_count - b.comments_count);
  //     return [sorted[0], sorted[sorted.length - 1]];
  // }
  return (
    <div>
      {loading && <div className="spinner" />}
      <h1>Highest and Lowest Likes</h1>
      <div>
        <h2>Highest Likes</h2>
      </div>
      <div>
        <h2>Lowest Likes</h2>
      </div>
    </div>
  );
}

export default BestWorst;
