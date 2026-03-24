import { Link } from "react-router-dom";
import { API_SERVER_HOST } from "../../../api/common/apiClient";
import "../../../css/common/MainProductList.css";
import "../../../css/common/ProductRelatedTab.css";

const getSalePrice = (price, discountRate) => {
  if (!discountRate || discountRate <= 0) return Number(price ?? 0);
  return (
    Math.floor((Number(price) * (100 - Number(discountRate))) / 100 / 100) * 100
  );
};

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/")) {
    return `${API_SERVER_HOST}${imageUrl}`;
  }
  return `${API_SERVER_HOST}/upload/${imageUrl}`;
};

export default function ProductRelatedTab({
  relatedProducts = [],
  relatedLoading = false,
}) {
  if (relatedLoading) {
    return (
      <div className="related-product-tab">
        <div className="detail-placeholder">관련상품을 불러오는 중입니다.</div>
      </div>
    );
  }

  if (!relatedProducts.length) {
    return (
      <div className="related-product-tab">
        <div className="detail-placeholder">
          같은 카테고리의 관련상품이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="related-product-tab">
      <div className="product-grid">
        {relatedProducts.map((item, index) => {
          const productName = item.name || "상품명 없음";
          const imageSrc = getImageSrc(item.imageUrl);
          const isSale = Number(item.discountRate ?? 0) > 0;
          const salePrice =
            item.salePrice ?? getSalePrice(item.price, item.discountRate);

          const isNew = item.createdAt
            ? (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24) <=
              7
            : false;

          return (
            <Link
              to={`/product/detail/${item.productNo}`}
              className="product-card"
              key={`related-${item.productNo ?? index}`}
            >
              <div className="product-thumb">
                {item.imageUrl ? (
                  <img src={imageSrc} alt={productName} />
                ) : (
                  <div className="product-no-image">NO IMAGE</div>
                )}

                {isNew && <span className="product-badge badge-new">NEW</span>}

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
    </div>
  );
}
