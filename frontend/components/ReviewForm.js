"use client"
import { useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}


export default function ReviewForm({ placeId,restaurant_name, onReviewSubmitSuccess }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0 || !text.trim()) {
      alert("Proszę wypełnić wszystkie pola i wybrać ocenę.")
      return
    }
    const csrftoken = getCookie("csrftoken")

    try {
      const res = await fetch('${API_BASE}/api/reviews/add/', {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
        "X-CSRFToken": csrftoken},
        credentials: "include",
        body: JSON.stringify({ place_id: placeId, restaurant_name: restaurant_name, rating, text })
      })

      if (res.ok) {
        setRating(0)
        setText("")
        setHoveredRating(0)
        onReviewSubmitSuccess()  // 👈 odśwież recenzje po sukcesie
      } else {
        alert("Nie udało się dodać recenzji.")
      }
    } catch (err) {
      alert("Błąd połączenia z serwerem.")
    }
  }

  return (
    <div className="review-form">
      <h3>Dodaj swoją opinię</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ocena:</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star-input ${star <= (hoveredRating || rating) ? "filled" : "empty"}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Twoja opinia:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Podziel się swoimi wrażeniami z restauracji..."
            rows="4"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Dodaj opinię
        </button>
      </form>
    </div>
  )
}
