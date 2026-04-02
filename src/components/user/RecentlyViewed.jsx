import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/common/RecentlyViewed.css";
import { API_SERVER_HOST } from "../../api/common/apiClient";
import { getProductDetail } from "../../api/user/productApi";

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
    const fetchAndFilter = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (stored.length === 0) return;

        // 각 상품의 현재 상태를 확인해서 삭제된 상품(use_yn = 'N') 필터링
        const results = await Promise.allSettled(
          stored.map((item) => getProductDetail(item.productNo))
        );

        const activeItems = stored.filter((_, index) => {
          const result = results[index];
          if (result.status !== "fulfilled") return false;
          return result.value?.product?.useYn === "Y";
        });

        // localStorage도 최신 상태로 업데이트
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeItems));
        setItems(activeItems);
      } catch (e) {
        setItems([]);
      }
    };
    fetchAndFilter();
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