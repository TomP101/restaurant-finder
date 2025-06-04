"use client"

import { useState } from "react"
import RestaurantCard from "./RestaurantCard"

export default function HomePage({ onRestaurantSelect }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term.length < 2) return

    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/api/search/?query=${encodeURIComponent(term)}`);
      const data = await res.json()
      setRestaurants(data.places || [])
    } catch (err) {
      console.error("Search error", err)
      setRestaurants([])
    }
    setLoading(false)
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h2>Znajdź najlepsze restauracje w Twojej okolicy</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Szukaj restauracji, kuchni lub lokalizacji..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
      </div>

      <div className="restaurants-section">
        <h3>Wyniki ({restaurants.length})</h3>
        {loading && <p>Ładowanie...</p>}
        <div className="restaurants-grid">
          {restaurants.map((restaurant, idx) => {
            const restaurantData = {
            id: restaurant.place_id,
            place_id: restaurant.place_id,
            name: restaurant.displayName?.text || "Brak nazwy",
            address: restaurant.formattedAddress || "Brak adresu",
            rating: restaurant.rating || 0,
            reviewCount: restaurant.userRatingCount || 0,
            cuisine: "",
            image: restaurant.imageUrl || "/placeholder.svg",
            website: restaurant.websiteUri || null,
          }

            return (
              <RestaurantCard
                key={restaurant.name}
                restaurant={restaurantData}

                onSelect={() => {
                 onRestaurantSelect(restaurantData)
                }}
              />
            )
          })}

        </div>
        {!loading && restaurants.length === 0 && (
          <div className="no-results">
            <p>Nie znaleziono restauracji spełniających kryteria wyszukiwania.</p>
          </div>
        )}
      </div>
    </div>
  )
}
