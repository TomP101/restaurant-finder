export default function ReviewList({ reviews }) {
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : "empty"}`}>
          ★
        </span>,
      )
    }
    return stars
  }

  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>Brak opinii. Bądź pierwszy i podziel się swoją opinią!</p>
      </div>
    )
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="review-author">{review.author}</div>
            <div className="review-rating">{renderStars(review.rating)}</div>
            <div className="review-date">{review.date}</div>
          </div>
          <div className="review-text">{review.text}</div>
        </div>
      ))}
    </div>
  )
}
