import { useState, useEffect } from "react";
import "../../css/common/NoticeBanner.css";

const notices = [
  "🎉 신규회원 가입 시 3,000원 할인쿠폰 즉시 지급!",
  "🚚 3만원 이상 구매 시 무료배송",
  "⭐ 리뷰 작성 시 포인트 적립 혜택",
  "🎁 친구 추천 시 양측 모두 5,000원 적립",
];

const NoticeBanner = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % notices.length);
        setFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="notice-banner">
      <span className={`notice-text ${fade ? "fade-in" : "fade-out"}`}>
        {notices[current]}
      </span>
    </div>
  );
};

export default NoticeBanner;