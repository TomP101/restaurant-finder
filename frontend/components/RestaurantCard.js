"use client"

export default function RestaurantCard({ restaurant, onSelect }) {
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>,
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>,
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ★
        </span>,
      )
    }

    return stars
  }

  return (
    <div className="restaurant-card">
      <div className="card-image">
        <img src={restaurant.image} alt={restaurant.name} />
      </div>
      <div className="card-content">
        <h4 className="restaurant-name">{restaurant.name}</h4>
        <div className="rating-section">
          <div className="stars">{renderStars(restaurant.rating)}</div>
          <span className="rating-text">
            {restaurant.rating} ({restaurant.reviewCount} opinii)
          </span>
        </div>
        <p className="restaurant-address">{restaurant.address}</p>
        <span className="cuisine-tag">{restaurant.cuisine}</span>
        <button className="btn btn-primary card-button" onClick={onSelect}>
          Zobacz więcej
        </button>
      </div>
    </div>
  )
}
