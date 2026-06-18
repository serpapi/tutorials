import { useState, useEffect } from "react";

function BestWorst({ igHandle }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      const response = await fetch(`/api/instagram/posts/${igHandle}`);
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    };

    getPosts();
  }, [igHandle]);

  const sortByLikes = () => {
    if (posts.length === 0) return [null, null];
    const sorted = posts
      .filter((p) => p.media_preview_likes_count != null)
      .slice(0, 50)
      .sort(
        (a, b) =>
          Number(b.media_preview_likes_count) -
          Number(a.media_preview_likes_count),
      );
    return [sorted[0], sorted[sorted.length - 1]];
  };

  const [highestPost, lowestPost] = sortByLikes();

  return (
    <div id="highest-lowest">
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <h1>Highest and Lowest Likes</h1>
          <div id="highest-likes">
            <h2>Highest Likes</h2>
            {highestPost && (
              <a
                href={highestPost.link}
                target="_blank"
                rel="noreferrer"
                className="post-card"
              >
                <img
                  src={highestPost.serpapi_thumbnail_src}
                  alt="highest liked post"
                />
                <div className="post-overlay">
                  <span>
                    ♥ {highestPost.media_preview_likes_count?.toLocaleString()}
                  </span>
                  <span>
                    &#128172; {highestPost.comments_count?.toLocaleString()}
                  </span>
                </div>
              </a>
            )}
          </div>
          <div id="lowest-likes">
            <h2>Lowest Likes</h2>
            {lowestPost && (
              <a
                href={lowestPost.link}
                target="_blank"
                rel="noreferrer"
                className="post-card"
              >
                <img
                  src={lowestPost.serpapi_thumbnail_src}
                  alt="lowest liked post"
                />
                <div className="post-overlay">
                  <span>
                    ♥ {lowestPost.media_preview_likes_count?.toLocaleString()}
                  </span>
                  <span>
                    &#128172; {lowestPost.comments_count?.toLocaleString()}
                  </span>
                </div>
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BestWorst;
