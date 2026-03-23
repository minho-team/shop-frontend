import { Link } from "react-router-dom";
import "../../css/common/HomeProductSection.css";

const API_BASE_URL = "http://localhost:8080";

const getSalePrice = (price, discountRate) => {
  if (!discountRate || discountRate <= 0) return price;
  return Math.floor((price * (100 - discountRate)) / 100 / 100) * 100;
};

const HomeProductSection = ({
  label,
  title,
  subtitle,
  products = [],
  loading = false,
  moreLink = "/",
}) => {
  return (
    <section className="home-product-section">
      <div className="home-product-inner">
        <div className="home-product-header">
          <div>
            <span className="home-product-label">{label}</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <Link to={moreLink} className="home-product-more">
            더보기
          </Link>
        </div>

        {loading ? (
          <div className="home-product-empty">상품을 불러오는 중입니다.</div>
        ) : products.length === 0 ? (
          <div className="home-product-empty">표시할 상품이 없습니다.</div>
        ) : (
          <div className="home-product-grid">
            {products.map((item) => {
              const imageSrc = item.imageUrl
                ? `${API_BASE_URL}${item.imageUrl}`
                : "";

              const isSale = item.discountRate && item.discountRate > 0;
              const salePrice = getSalePrice(item.price, item.discountRate);

              // 7일 이내 등록 상품이면 NEW 배지
              const isNew = item.createdAt
                ? (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24) <= 7
                : false;

              return (
                <Link
                  to={`/product/detail/${item.productNo}`}
                  className="home-product-card"
                  key={`product-${item.productNo}`}
                >
                  <div className="home-product-thumb">
                    {item.imageUrl ? (
                      <img src={imageSrc} alt={item.name} />
                    ) : (
                      <div className="home-product-no-image">NO IMAGE</div>
                    )}

                    {isNew ? (
                      <span className="home-product-badge new-badge">NEW</span>
                    ) : null}

                    {isSale ? (
                      <span className="home-product-badge sale">
                        {item.discountRate}% OFF
                      </span>
                    ) : null}

                    {item.sameDayDeliveryYn === "Y" ? (
                      <span className="home-product-badge delivery">
                        당일배송
                      </span>
                    ) : null}
                  </div>

                  <div className="home-product-info">
                    <p className="home-product-brand">ERDIN SELECT SHOP</p>
                    <h3>{item.name}</h3>

                    <div className="home-product-price-box">
                      {isSale ? (
                        <>
                          <span className="home-product-sale-price">
                            {Number(salePrice).toLocaleString()}원
                          </span>
                          <span className="home-product-origin-price">
                            {Number(item.price).toLocaleString()}원
                          </span>
                        </>
                      ) : (
                        <span className="home-product-sale-price">
                          {Number(item.price).toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeProductSection;