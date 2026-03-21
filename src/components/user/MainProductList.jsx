import { Link, useSearchParams } from "react-router-dom";
import "../../css/common/MainProductList.css";
import { useEffect, useState } from "react";
import { getProductList } from "../../api/user/categoryApi";

const API_BASE_URL = "http://localhost:8080";

const getSalePrice = (price, discountRate) => {
  if (!discountRate || discountRate <= 0) return price;
  return Math.floor((price * (100 - discountRate)) / 100 / 100) * 100;
};

const MainProductList = () => {
  const [searchParams] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);

  const categoryId = searchParams.get("categoryId");
  const keyword = searchParams.get("keyword")?.trim() || "";
  const sort = searchParams.get("sort") || "";
  const discountOnly = searchParams.get("discountOnly") === "true";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProductList({
          categoryId,
          keyword,
          sort,
          discountOnly,
        });

        setProductList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("상품 목록 불러오기 실패:", error);
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, keyword, sort, discountOnly]);

  const getTitle = () => {
    if (keyword) return `"${keyword}" 검색 결과`;
    if (discountOnly || sort === "sale") return "할인 상품";
    if (sort === "best") return "베스트 상품";
    if (sort === "new") return "신상품";
    if (categoryId) return "카테고리 상품";
    return "BEST PRODUCT";
  };

  if (loading) {
    return <div className="main-product-loading">로딩중...</div>;
  }

  return (
    <section className="main-product-section">
      <div className="main-product-inner">
        <div className="main-product-header">
          <div>
            <span className="main-product-label">OUR PICKS</span>
            <h2>{getTitle()}</h2>
          </div>

          <Link to="/" className="main-product-more">
            메인으로
          </Link>
        </div>

        <div className="product-grid">
          {productList.map((item, index) => {
            const productName = item.name || "상품명 없음";
            const imageSrc = item.imageUrl
              ? `${API_BASE_URL}${item.imageUrl}`
              : "";

            const isSale = item.discountRate && item.discountRate > 0;
            const salePrice = getSalePrice(item.price, item.discountRate);

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

                  {isSale && (
                    <span className="product-badge badge-sale">
                      {item.discountRate}% OFF
                    </span>
                  )}

                  {item.sameDayDeliveryYn === "Y" && (
                    <span className="product-delivery-badge">당일배송</span>
                  )}
                </div>

                <div className="product-info">
                  <p className="product-brand">ERDIN SELECT SHOP</p>
                  <h3 className="product-name">{productName}</h3>

                  <div className="product-price-box">
                    {isSale ? (
                      <>
                        <span className="product-price-sale">
                          {Number(salePrice).toLocaleString()}원
                        </span>
                        <span className="product-price-original">
                          {Number(item.price).toLocaleString()}원
                        </span>
                      </>
                    ) : (
                      <span className="product-price">
                        {Number(item.price).toLocaleString()}원
                      </span>
                    )}
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