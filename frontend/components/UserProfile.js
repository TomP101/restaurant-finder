"use client"
import { useEffect, useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function UserProfile({ onBack }) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/reviews/`, {
          credentials: "include"
        })
        if (res.ok) {
          const data = await res.json()
          setReviews(data)
        } else {
          console.error("Błąd pobierania recenzji")
        }
      } catch (err) {
        console.error("Błąd sieci", err)
      }
    }

    fetchUserReviews()
  }, [])


  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-500">★</span>)
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">★</span>)
    }
    for (let i = 0; i < 5 - Math.ceil(rating); i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>)
    }

    return stars
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="review-author">{review.restaurant_name}</div>
            <div className="review-rating">{renderStars(review.rating)}</div>
            <div className="review-date">{review.date}</div>
          </div>
          <div className="review-text">{review.text}</div>
        </div>
      ))}
    </div>
  )
}