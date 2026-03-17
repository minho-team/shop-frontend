import { Link, useSearchParams } from "react-router-dom";
import "../css/MainProductList.css";
import { useEffect, useState } from "react";
import { getProductList } from "../api/categoryApi";

const tagOptions = ["NEW", "HOT", "BEST", "SALE"];

const getRandomTag = (productNo = 0) => {
  return tagOptions[productNo % tagOptions.length] || "NEW";
};

const API_BASE_URL = "http://localhost:8080";

const MainProductList = () => {
  const [searchParams] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);

  const categoryId = searchParams.get("categoryId");
  const keyword = searchParams.get("keyword")?.trim() || "";

  useEffect(() => {
    console.log("MainProductList useEffect 실행");
    console.log("현재 categoryId =", categoryId);
    console.log("현재 keyword =", keyword);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log("getProductList 호출 직전");

        const data = await getProductList({
          categoryId,
          keyword,
        });

        console.log("getProductList 응답 =", data);

        const safeList = Array.isArray(data) ? data : [];
        setProductList(safeList);
      } catch (error) {
        console.error("상품 목록 불러오기 실패:", error);
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, keyword]);

  if (loading) {
    return <div className="main-product-loading">로딩중...</div>;
  }

  return (
    <section className="main-product-section">
      <div className="main-product-inner">
        <div className="main-product-header">
          <div>
            <span className="main-product-label">OUR PICKS</span>
            <h2>
              {keyword
                ? `"${keyword}" 검색 결과`
                : categoryId
                ? "CATEGORY PRODUCT"
                : "BEST PRODUCT"}
            </h2>
          </div>

          <Link to="/products" className="main-product-more">
            전체보기
          </Link>
        </div>

        <div className="product-grid">
          {productList.map((item, index) => {
            const productName = item.name || item.productName || "상품명 없음";

            const imageSrc = item.imageUrl
              ? `${API_BASE_URL}${item.imageUrl}`
              : "";

            const tag = getRandomTag(item.productNo ?? index);
            const badgeClass = `product-badge badge-${String(tag).toLowerCase()}`;

            return (
              <Link
                to={`/product/detail/${item.productNo}`}
                className="product-card"
                key={item.productNo ?? index}
              >
                <div className="product-thumb">
                  {item.imageUrl ? (
                    <img src={imageSrc} alt={productName} />
                  ) : (
                    <div className="product-no-image">NO IMAGE</div>
                  )}

                  <span className={badgeClass}>{tag}</span>
                </div>

                <div className="product-info">
                  <p className="product-brand">ERDIN SELECT SHOP</p>
                  <h3 className="product-name">{productName}</h3>

                  <div className="product-price-box">
                    <span className="product-price">
                      {Number(item.price).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && productList.length === 0 && (
          <div className="main-product-loading">검색 결과가 없습니다.</div>
        )}
      </div>
    </section>
  );
};

export default MainProductList;