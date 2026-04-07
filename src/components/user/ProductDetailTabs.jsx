import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductInfoTab from "./tabs/ProductInfoTab";
import ProductSizeTab from "./tabs/ProductSizeTab";
import ProductRelatedTab from "./tabs/ProductRelatedTab";
import ProductReviewTab from "./tabs/ProductReviewTab";
import "../../css/common/ProductDetailTabs.css";

// 리뷰 content의 text 창 이탈 방지
const ReviewContent = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content && content.length > 150;

  return (
    <div className="review-content-container">
      {/* 텍스트 영역: 줄 제한 제어 */}
      <div className={`review-detail-body ${!isExpanded ? 'clamped' : ''}`}>
        {content}
      </div>
      {/* 긴 글을 자세히 볼 수 있는 기능 */}
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

const TAB_LIST = [
  { key: "info", label: "상품정보" },
  { key: "size", label: "사이즈" },
  { key: "related", label: "관련상품" },
  { key: "review", label: "구매후기" },
  { key: "qna", label: "상품문의" },
];

export default function ProductDetailTabs({
  product,
  options = [],
  images = [],
  relatedProducts = [],
  relatedLoading = false,
}) {
  const [activeTab, setActiveTab] = useState("info");
  const tabRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("tab") === "review") {
      setActiveTab("review");
    }
  }, [location]);

  const handleTabClick = (key) => {
    if (key === "qna") {
      if (!product?.productNo) return;
      navigate(`/inquiry/write?productNo=${product.productNo}`);
      return;
    }

    setActiveTab(key);
    tabRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "info":
        return <ProductInfoTab product={product} images={images} />;

      case "size":
        return <ProductSizeTab options={options} images={images} />;

      case "related":
        return (
          <ProductRelatedTab
            relatedProducts={relatedProducts}
            relatedLoading={relatedLoading}
          />
        );

      case "review":
        return <ProductReviewTab productId={product?.productNo} />;

      default:
        return null;
    }
  };

  return (
    <div className="pdt-wrapper">
      <div ref={tabRef} className="pdt-tab-nav">
        {TAB_LIST.map((tab) => (
          <button
            key={tab.key}
            className={`pdt-tab-btn ${activeTab === tab.key ? "pdt-tab-btn--active" : ""}`}
            onClick={() => handleTabClick(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pdt-tab-content">{renderTab()}</div>
    </div>
  );
}
