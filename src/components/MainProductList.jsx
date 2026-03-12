import { Link } from "react-router-dom";
import "../css/MainProductList.css";
import { useEffect, useState } from "react";
import { getProductList } from "../api/productApi";

const tagOptions = ["NEW", "HOT", "BEST", "SALE"];

const getRandomTag = (productNo = 0) => {
  return tagOptions[productNo % tagOptions.length] || "NEW";
};

const API_BASE_URL = "http://localhost:8080";

const MainProductList = () => {
  const [product, setProduct] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductList();
        setProduct(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("상품 목록 불러오기 실패:", error);
        setProduct([]);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="main-product-section">
      <div className="main-product-inner">
        <div className="main-product-header">
          <div>
            <span className="main-product-label">OUR PICKS</span>
            <h2>BEST PRODUCT</h2>
          </div>

          <Link to="/products" className="main-product-more">
            전체보기
          </Link>
        </div>

        <div className="product-grid">
          {product.map((item, index) => {
            console.log("상품명:", item.name);
            console.log("imageUrl 원본:", JSON.stringify(item.imageUrl));
            console.log("최종 src:", `${API_BASE_URL}${item.imageUrl}`);
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
                    <img src={imageSrc} alt={item.name} />
                  ) : (
                    <div className="product-no-image">NO IMAGE</div>
                  )}

                  <span className={badgeClass}>{tag}</span>
                </div>

                <div className="product-info">
                  <p className="product-brand">MINHO TEAM</p>
                  <h3 className="product-name">{item.name}</h3>

                  <div className="product-price-box">
                    {item.salePrice ? (
                      <>
                        <span className="product-price-sale">
                          {Number(item.salePrice).toLocaleString()}원
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
      </div>
    </section>
  );
};

export default MainProductList;