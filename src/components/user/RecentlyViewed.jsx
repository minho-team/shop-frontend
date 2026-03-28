import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/common/RecentlyViewed.css";
import { API_SERVER_HOST } from "../../api/common/apiClient";

const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 6;

// 상품 상세 페이지에서 호출하는 유틸 함수 (외부에서 import해서 사용)
export const addRecentlyViewed = (product) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = stored.filter((p) => p.productNo !== product.productNo);
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("최근 본 상품 저장 실패", e);
  }
};

const RecentlyViewed = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setItems(stored);
    } catch (e) {
      setItems([]);
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="recently-viewed-section">
      <div className="recently-viewed-inner">
        <div className="recently-viewed-header">
          <span className="recently-viewed-label">RECENTLY VIEWED</span>
          <h2>최근 본 상품</h2>
        </div>

        <div className="recently-viewed-grid">
          {items.map((item) => {
              const imageSrc = item.imageUrl
              ? item.imageUrl.startsWith("http")
                ? item.imageUrl
                : `${API_SERVER_HOST}${item.imageUrl}`
              : null;

            return (
              <Link
                to={`/product/detail/${item.productNo}`}
                className="recently-viewed-card"
                key={item.productNo}
              >
                <div className="recently-viewed-thumb">
                  {imageSrc ? (
                    <img src={imageSrc} alt={item.name} />
                  ) : (
                    <div className="recently-viewed-no-image">NO IMAGE</div>
                  )}
                </div>
                <div className="recently-viewed-info">
                  <p className="recently-viewed-name">{item.name}</p>
                  <p className="recently-viewed-price">
                    {Number(item.price).toLocaleString()}원
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;