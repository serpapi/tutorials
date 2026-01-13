import { useState, useEffect } from 'react'
import ReviewCard from './components/ReviewCard'
import './App.css'

const API_KEY = import.meta.env.VITE_API_KEY

const REVIEWS_PER_PAGE = 4

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

function App() {
  const [reviews, setReviews] = useState([])
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contributorInfo, setContributorInfo] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/search.json?engine=google_maps_contributor_reviews&contributor_id=102617135531788009044&gl=us&hl=en&api_key=${API_KEY}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }

        const data = await response.json()
        setReviews(data.reviews || [])
        setContributorInfo(data.contributor || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  useEffect(() => {
    async function fetchUserLocation() {
      try {
        const response = await fetch('http://ip-api.com/json/')
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success') {
            setUserLocation({ lat: data.lat, lon: data.lon })
          }
        }
      } catch (err) {
        console.error('Failed to fetch user location:', err)
      }
    }

    fetchUserLocation()
  }, [])

  const parseDate = (dateStr) => {
    if (!dateStr) return 0
    const match = dateStr.match(/(\d+)\s+(day|week|month|year)s?\s+ago/)
    if (!match) return 0

    const num = parseInt(match[1])
    const unit = match[2]
    const multipliers = { day: 1, week: 7, month: 30, year: 365 }
    return num * (multipliers[unit] || 1)
  }

  const getDistance = (review) => {
    if (!userLocation || !review.place_info?.gps_coordinates) {
      return Infinity
    }
    const { latitude, longitude } = review.place_info.gps_coordinates
    return calculateDistance(userLocation.lat, userLocation.lon, latitude, longitude)
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0)
    }
    if (sortBy === 'distance') {
      return getDistance(a) - getDistance(b)
    }
    return parseDate(a.date) - parseDate(b.date)
  })

  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE)
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE
  const paginatedReviews = sortedReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE)

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading reviews...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="user-info">
          <div className="avatar">
            {contributorInfo?.thumbnail ? (
              <img src={contributorInfo.thumbnail} alt={contributorInfo.name} referrerPolicy="no-referrer" />
            ) : (
              <div className="avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
          <h1 className="user-name">{contributorInfo?.name || 'Contributor'}</h1>
        </div>
        <div className="sort-control">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="date">Date</option>
            <option value="rating">Rating</option>
            <option value="distance">Distance</option>
          </select>
        </div>
      </header>

      <main className="reviews-grid">
        {paginatedReviews.map((review, index) => (
          <ReviewCard key={review.review_id || index} review={review} distance={getDistance(review)} />
        ))}
      </main>

      {totalPages > 1 && (
        <nav className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </nav>
      )}

      <p className="review-count">
        Showing {startIndex + 1}-{Math.min(startIndex + REVIEWS_PER_PAGE, sortedReviews.length)} of {sortedReviews.length} reviews
      </p>
    </div>
  )
}

export default App
