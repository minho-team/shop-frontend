import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/common/ProductQnaTab.css";

export default function ProductQnaTab({ productId }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) return;

    const timer = setTimeout(() => {
      navigate(`/qna?productNo=${productId}`);
    }, 150);

    return () => clearTimeout(timer);
  }, [navigate, productId]);

  return (
    <div className="qna-tab-redirect">
      <h3 className="qna-tab-title">상품문의 페이지로 이동 중</h3>
      <p className="qna-tab-desc">
        보다 자세한 문의는 상품문의 전용 페이지에서 확인할 수 있어요.
      </p>
    </div>
  );
}
