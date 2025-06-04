"use client"

import ReviewList from "./ReviewList"
import ReviewForm from "./ReviewForm"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function RestaurantDetails({ restaurant, onBack, onAddReview, setSelectedRestaurant }) {
  if (!restaurant) return null

  const handleReviewSubmitSuccess = async () => {
  try {
    const res = await fetch(`${API_BASE}/reviews/place/?place_id=${restaurant.id}`, {
      credentials: "include"
    })
    if (!res.ok) return
    const newReviews = await res.json()

    setSelectedRestaurant(prev => ({
    ...prev,
    reviews: [
      ...newReviews,
      ...prev.reviews.filter(r => String(r.id).startsWith("g-"))
    ]
  }))
  } catch (err) {
    console.error("Błąd przy pobieraniu recenzji z bazy:", err)
  }
}


  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>)
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>)
    }

    return stars
  }

  return (
    <div className="restaurant-details">
      <button className="back-button" onClick={onBack}>
        ← Powrót do listy
      </button>

      <div className="details-header">
        <div className="details-image">
          <img src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} />
        </div>
        <div className="details-info">
          <h1>{restaurant.name}</h1>
          <div className="rating-section">
            <div className="stars large">{renderStars(restaurant.rating)}</div>
            <span className="rating-text">
              {restaurant.rating} ({restaurant.reviewCount} opinii)
            </span>
          </div>

          <div className="contact-info">
            <div className="info-item">
              <strong>📍 Adres:</strong> {restaurant.address}
            </div>
            <div className="info-item">
              <strong>📞 Telefon:</strong> {restaurant.phone}
            </div>
            <div className="info-item">
              <strong>💰 Poziom cen:</strong> {restaurant.priceLevel}
            </div>
            <div className="info-item">
              <strong>🟢 Otwarte teraz:</strong> {restaurant.openNow ? "Tak" : "Nie"}
            </div>
            <div className="info-item">
              <strong>⏳ Zamknięcie o:</strong>{" "}
              {new Date(restaurant.nextClose).toLocaleTimeString("pl-PL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="info-item">
              <strong>🕒 Godziny otwarcia:</strong> {restaurant.hours}
            </div>

            {restaurant.mapUrl && (
                <div className="info-item">
                  <strong>🗺️ Mapa:</strong>{" "}
                  <a href={restaurant.mapUrl} target="_blank" rel="noopener noreferrer">
                    Otwórz w Google Maps
                  </a>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Opinie ({restaurant.reviews.length})</h2>
        <ReviewForm
          placeId={restaurant.id}
          restaurant_name={restaurant.name}
          onReviewSubmitSuccess={handleReviewSubmitSuccess}
        />

        <ReviewList reviews={restaurant.reviews} />
      </div>
    </div>
  )
}
