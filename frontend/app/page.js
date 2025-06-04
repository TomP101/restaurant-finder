"use client"

import {useEffect, useState} from "react"
import Navbar from "../components/Navbar"
import HomePage from "../components/HomePage"
import RestaurantDetails from "../components/RestaurantDetails"
import LoginForm from "../components/LoginForm"
import RegisterForm from "../components/RegisterForm"
import "../styles/globals.css"
import "../styles/components.css"
import UserProfile from "../components/UserProfile";

const API_BASE = process.env.NEXT_PUBLIC_API_URL



export default function App() {
  const [currentView, setCurrentView] = useState("home")
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [restaurants, setRestaurants] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])


  const handleRestaurantSelect = async (restaurant) => {
  try {

    const res = await fetch(
      `${API_BASE}/places/details/?place_id=${restaurant.id}`

    )
    const data = await res.json()

    const priceMap = {
    PRICE_LEVEL_INEXPENSIVE: "💲",
    PRICE_LEVEL_MODERATE: "💲💲",
    PRICE_LEVEL_EXPENSIVE: "💲💲💲",
    PRICE_LEVEL_VERY_EXPENSIVE: "💲💲💲💲",
  }

    console.log("Wybrano restaurację:\n" + JSON.stringify(data, null, 2))

    const googleReviews = (data.reviews || []).map((r, i) => ({
    id: `g-${i}`,
    author: r.authorAttribution?.displayName || "Anonim",
    rating: r.rating || 0,
    text: r.text?.text || r.originalText?.text || "",
    date: r.relativePublishTimeDescription || "Brak daty",
  }))
    const dbRes = await fetch(`${API_BASE}/reviews/place/?place_id=${restaurant.id}`)
    const dbReviews = await dbRes.json()

    const allReviews = [...googleReviews, ...dbReviews.map((r, i) => ({
      id: `db-${i}`,
      author: r.author,
      rating: r.rating,
      text: r.text,
      date: new Date(r.created_at).toLocaleDateString("pl-PL"),
    }))]

    const enriched = {
      id: restaurant.id,
      name: data.displayName?.text || restaurant.name,
      address: data.formattedAddress || restaurant.address,
      rating: data.rating || 0,
      reviewCount: data.userRatingCount || 0,
      image: restaurant.image,
      phone: data.internationalPhoneNumber || "Brak info",
      reviews: allReviews || [],
      website: data.websiteUri || null,
      hours: data.regularOpeningHours?.weekdayDescriptions?.join(", ") || "Brak info",
      openNow: data.regularOpeningHours?.openNow ?? null,
      nextClose: data.regularOpeningHours?.nextCloseTime || null,
      description: data.editorialSummary?.text || "",
      businessStatus: data.businessStatus || "",
      priceLevel: priceMap[data.priceLevel] || "Nieznany",
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${restaurant.name}`,
    }

    setSelectedRestaurant(enriched)
    setCurrentView("details")
  } catch (err) {
    console.error("Błąd ładowania szczegółów restauracji", err)
  }
}

  const handleLoginClick = () => setCurrentView("login")
  const handleRegisterClick = () => setCurrentView("register")

  const handleLoginSuccess = () => {
    fetchCurrentUser()
    setCurrentView("home")
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setSelectedRestaurant(null)
  }

  const fetchCurrentUser = async () => {
  try {
    const res = await fetch('${API_BASE}/whoami/', {
      credentials: "include",
    })
    if (res.ok) {
      const data = await res.json()
      setCurrentUser(data.username)
    } else {
      setCurrentUser(null)
    }
  } catch {
    setCurrentUser(null)
  }
}

  const handleLogout = async () => {
  try {
    await fetch('${API_BASE}/logout/', {
      method: "GET",
      credentials: "include",
    })
  } catch {}
  setCurrentUser(null)
  setCurrentView("home")
}



  const handleAddReview = (restaurantId, review) => {
    setRestaurants((prev) =>
      prev.map((restaurant) => {
        if (restaurant.id === restaurantId) {
          const newReview = {
            id: Date.now(),
            ...review,
            date: new Date().toISOString().split("T")[0],
          }
          const updatedRestaurant = {
            ...restaurant,
            reviews: [...restaurant.reviews, newReview],
            reviewCount: restaurant.reviewCount + 1,
          }

          const totalRating = updatedRestaurant.reviews.reduce((sum, r) => sum + r.rating, 0)
          updatedRestaurant.rating = Math.round((totalRating / updatedRestaurant.reviews.length) * 10) / 10

          if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
            setSelectedRestaurant(updatedRestaurant)
          }

          return updatedRestaurant
        }
        return restaurant
      }),
    )
  }

  return (
      <div className="app">
        <Navbar
            onHomeClick={handleBackToHome}
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onLogoutClick={handleLogout}
            onProfileClick={() => setCurrentView("profile")}
            currentUser={currentUser}
        />
        <main className="main-content">
          {currentView === "home" && (
              <HomePage
                  restaurants={restaurants}
                  onRestaurantSelect={handleRestaurantSelect}
              />
          )}
          {currentView === "details" && selectedRestaurant && (
              <RestaurantDetails
                  restaurant={selectedRestaurant}
                  onBack={handleBackToHome}
                  onAddReview={handleAddReview}
                  setSelectedRestaurant={setSelectedRestaurant}
              />
          )}
          {currentView === "profile" && (
              <UserProfile onBack={handleBackToHome} />
          )}
          {currentView === "login" && (
              <LoginForm onLoginSuccess={handleLoginSuccess}/>
          )}
          {currentView === "register" && (
              <RegisterForm onRegisterSuccess={() => setCurrentView("login")}/>
          )}
        </main>

      </div>
  )
}
