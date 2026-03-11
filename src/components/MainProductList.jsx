import { Link } from "react-router-dom";
import "../css/MainProductList.css";
import { useEffect, useState } from "react";
import { getProductList } from "../api/productApi";

const fallbackImages = [
  "https://picsum.photos/id/1011/700/900",
  "https://picsum.photos/id/1005/700/900",
  "https://picsum.photos/id/1025/700/900",
  "https://picsum.photos/id/1035/700/900",
  "https://picsum.photos/id/1041/700/900",
  "https://picsum.photos/id/1050/700/900",
  "https://picsum.photos/id/1062/700/900",
  "https://picsum.photos/id/1074/700/900",
  "https://picsum.photos/id/1080/700/900",
  "https://picsum.photos/id/1084/700/900",
];

const tagOptions = ["NEW", "HOT", "BEST", "SALE"];

const getRandomTag = (productNo = 0) => {
  return tagOptions[productNo % tagOptions.length] || "NEW";
};

const MainProductList = () => {
  const [product, setProduct] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductList();
        setProduct(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("상품 목록 불러오기 실패:", error);
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
            const imageSrc =
              item.imageUrl || fallbackImages[index % fallbackImages.length];

            const tag = getRandomTag(item.productNo ?? index);
            const badgeClass = `product-badge badge-${String(tag).toLowerCase()}`;

            return (
              <Link
                to={`/product/${item.productNo}`}
                className="product-card"
                key={item.productNo ?? index}
              >
                <div className="product-thumb">
                  <img
                    src={imageSrc}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://picsum.photos/700/900?random=999";
                    }}
                  />

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