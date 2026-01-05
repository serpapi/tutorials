import { useState } from 'react'
import './ReviewCard.css'

function StarRating({ rating }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
        {i <= rating ? '★' : '☆'}
      </span>
    )
  }
  return <div className="star-rating">{stars}</div>
}

function ReviewCard({ review }) {
  const { place_info, snippet, rating, images, date } = review
  const displayImages = images?.slice(0, 2) || []
  const [expanded, setExpanded] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState(null)
  const isLongText = snippet?.length > 150

  const getMapsUrl = () => {
    if (place_info?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place_info.address)}`
    }
    if (place_info?.title) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place_info.title)}`
    }
    return null
  }

  const mapsUrl = getMapsUrl()

  return (
    <div className="review-card">
      <h3 className="place-name">
        {mapsUrl ? (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            {place_info?.title}
          </a>
        ) : (
          place_info?.title
        )}
      </h3>
      <StarRating rating={rating} />
      <p
        className={`review-snippet ${isLongText ? 'clickable' : ''} ${expanded ? 'expanded' : ''}`}
        onClick={() => isLongText && setExpanded(!expanded)}
      >
        {expanded || !isLongText ? snippet : `${snippet.substring(0, 150)}...`}
        {isLongText && (
          <span className="expand-toggle">
            {expanded ? ' Show less' : ' Read more'}
          </span>
        )}
      </p>
      <div className="review-images">
        {displayImages.map((img, index) => (
          <div
            key={index}
            className="image-container"
            onClick={() => setEnlargedImage(img)}
          >
            <img
              src={img.thumbnail}
              alt={img.title || `Review image ${index + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <p className="review-date">{date}</p>

      {enlargedImage && (
        <div className="image-modal" onClick={() => setEnlargedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEnlargedImage(null)}
            >
              &times;
            </button>
            <img
              src={enlargedImage.thumbnail}
              alt={enlargedImage.title || 'Enlarged review image'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewCard
