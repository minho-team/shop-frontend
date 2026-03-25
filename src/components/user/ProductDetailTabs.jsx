import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductInfoTab from "./tabs/ProductInfoTab";
import ProductSizeTab from "./tabs/ProductSizeTab";
import ProductRelatedTab from "./tabs/ProductRelatedTab";
import ProductReviewTab from "./tabs/ProductReviewTab";
import "../../css/common/ProductDetailTabs.css";

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
