import { useEffect, useState } from "react";
import apiClient, { API_SERVER_HOST } from "../../../api/common/apiClient";
import "../../../css/common/ProductReviewTab.css";

const ReviewContentItem = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content && content.length > 150;

  return (
    <div className="review-content-container">
      <div className={`review-detail-body ${!isExpanded ? 'clamped' : ''}`}>
        {content}
      </div>
      {isLong && (
        <button
          type="button"
          className="review-detail-more-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '접기 ▲' : '자세히 보기 ▼'}
        </button>
      )}
    </div>
  );
};

const getReviewImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/")) {
    return `${API_SERVER_HOST}${imageUrl}`;
  }
  return `${API_SERVER_HOST}/upload/${imageUrl}`;
};

export default function ProductReviewTab({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;

      setReviewLoading(true);
      try {
        const response = await apiClient.get(
          `/api/reviews/product/${productId}`,
        );
        setReviews(response.data || []);
      } catch (error) {
        console.error("리뷰 목록 로드 실패:", error);
        setReviews([]);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (reviewLoading) {
    return <div className="loading-text">후기를 불러오는 중입니다...</div>;
  }

  if (!reviews.length) {
    return (
      <div className="empty-review-text">아직 작성된 구매후기가 없습니다.</div>
    );
  }

  return (
    <div className="review-tab-container">
      <div className="review-list-wrap">
        {reviews.map((rev) => (
          <div key={rev.reviewNo} className="review-item">
            <div className="review-header">
              <span className="review-rating">
                {"⭐".repeat(Number(rev.rating ?? 0))}
              </span>
              <span className="review-user-info">
                {rev.nickName || rev.name || "회원"} |{" "}
                {rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString()
                  : ""}
              </span>
            </div>

            <div className="review-body">
              <div className="review-body-text">
                <h4 className="review-title">{rev.title}</h4>
                <ReviewContentItem content={rev.content} />
              </div>

              {rev.imageUrl && (
                <div className="review-image">
                  <img src={getReviewImageSrc(rev.imageUrl)} alt="후기이미지" />
                </div>
              )}
            </div>

            <div className="review-footer">
              스펙: {rev.userHeight ?? "-"}cm / {rev.userWeight ?? "-"}kg |
              사이즈: {rev.sizeRating ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
