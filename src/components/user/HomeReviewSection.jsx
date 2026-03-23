import "../../css/common/HomeReviewSection.css";

const StarRating = ({ rating }) => {
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`review-star ${star <= rating ? "filled" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const HomeReviewSection = ({ reviews = [] }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="home-review-section">
      <div className="home-review-inner">
        <div className="home-review-header">
          <span className="home-review-label">CUSTOMER REVIEWS</span>
          <h2>고객 리뷰</h2>
          <p>실제 구매 고객의 생생한 후기를 확인하세요.</p>
        </div>

        <div className="home-review-grid">
          {reviews.map((review) => (
            <div key={review.reviewNo} className="home-review-card">
              <div className="home-review-top">
                <StarRating rating={review.rating} />
                <span className="home-review-product">{review.productName}</span>
              </div>
              <p className="home-review-content">{review.content}</p>
              <div className="home-review-bottom">
                <span className="home-review-author">
                  {maskNickname(review.memberNickName)}
                </span>
                <span className="home-review-date">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 닉네임 마스킹: 앞 1글자 + ** 처리
const maskNickname = (nickname) => {
  if (!nickname) return "익명";
  if (nickname.length <= 1) return nickname + "**";
  return nickname[0] + "*".repeat(nickname.length - 1);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

export default HomeReviewSection;