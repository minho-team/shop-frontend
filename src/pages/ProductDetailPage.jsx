import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import "../css/ProductDetailPage.css";

const dummyProducts = [
  {
    id: 1,
    productNumber: "MH-0001",
    name: "오버핏 코튼 반팔 티셔츠",
    price: 29000,
    originalPrice: 39000,
    couponPrice: 26000,
    couponDiscount: 3000,
    rating: 4.8,
    reviewCount: 128,
    images: [
      "https://via.placeholder.com/600x720?text=PRODUCT+1-1",
      "https://via.placeholder.com/600x720?text=PRODUCT+1-2",
      "https://via.placeholder.com/600x720?text=PRODUCT+1-3",
    ],
    colors: ["블랙", "화이트", "그레이"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    productNumber: "MH-0002",
    name: "미니멀 와이드 슬랙스",
    price: 49000,
    originalPrice: 59000,
    couponPrice: 44000,
    couponDiscount: 5000,
    rating: 4.6,
    reviewCount: 54,
    images: [
      "https://via.placeholder.com/600x720?text=PRODUCT+2-1",
      "https://via.placeholder.com/600x720?text=PRODUCT+2-2",
    ],
    colors: ["블랙", "네이비"],
    sizes: ["28", "30", "32", "34"],
  },
];

const tabMenus = ["상품정보", "사이즈", "관련상품", "구매후기", "상품문의"];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product =
    dummyProducts.find((item) => String(item.id) === String(id)) ||
    dummyProducts[0];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [activeTab, setActiveTab] = useState("상품정보");

  const discountRate = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price)
      return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100,
    );
  }, [product.originalPrice, product.price]);

  const totalPrice = useMemo(() => {
    return product.price * quantity;
  }, [product.price, quantity]);

  const movePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const moveNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  const changeQuantity = (type) => {
    if (type === "minus" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === "plus") {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleCart = () => {
    const cartItem = {
      productId: product.id,
      productNumber: product.productNumber,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
    };

    console.log("장바구니에 담길 데이터", cartItem);
    navigate("/cart");
  };

  const handleOrder = () => {
    const orderItem = {
      productId: product.id,
      productNumber: product.productNumber,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
      totalPrice,
    };

    console.log("주문 페이지로 넘길 데이터", orderItem);
    navigate("/order");
  };

  return (
    <>
      <Header />

      <div className="product-detail-page">
        <div className="product-detail-container">
          <section className="product-top-section">
            <div className="product-image-area">
              <div className="product-main-image-wrap">
                <button
                  type="button"
                  className="image-arrow left"
                  onClick={movePrevImage}
                >
                  &#60;
                </button>

                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="product-main-image"
                />

                <button
                  type="button"
                  className="image-arrow right"
                  onClick={moveNextImage}
                >
                  &#62;
                </button>
              </div>

              <div className="product-thumbnail-list">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`thumbnail-button ${
                      currentImageIndex === index ? "active" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image} alt={`썸네일-${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="product-info-area">
              <div className="product-top-meta">
                <p className="product-number">
                  상품번호 : {product.productNumber}
                </p>
                <button type="button" className="share-button">
                  ↗
                </button>
              </div>

              <div className="product-title-row">
                <h1 className="product-name">{product.name}</h1>
                <div className="product-review-inline">
                  <span className="product-rating">♥ {product.rating}</span>
                  <span className="product-review-count">
                    리뷰 {product.reviewCount}
                  </span>
                </div>
              </div>

              <div className="product-badge-row">
                <span>쿠폰할인</span>
                <span>부분오늘출발</span>
                <span>사이즈교환무료</span>
              </div>

              <div className="product-price-block">
                <div className="product-price-line">
                  <span className="product-origin-price">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                  <strong className="product-sale-price">
                    {product.price.toLocaleString()}원
                  </strong>
                  {discountRate > 0 && (
                    <span className="product-discount-rate">
                      {discountRate}%
                    </span>
                  )}
                </div>

                <p className="product-discount-text">
                  총 {product.couponDiscount.toLocaleString()}원 할인 · 오늘
                  적용 가능
                </p>
              </div>

              <div className="coupon-box-row">
                <div className="coupon-box-left">
                  쿠폰 사용 시 최대 할인 금액
                </div>
                <div className="coupon-box-right">
                  <span>
                    {Math.round(
                      ((product.originalPrice - product.couponPrice) /
                        product.originalPrice) *
                        100,
                    )}
                    %
                  </span>
                  <strong>{product.couponPrice.toLocaleString()}원</strong>
                </div>
              </div>

              <div className="benefit-info-list">
                <div className="benefit-row">
                  <span className="label">카드혜택</span>
                  <span className="value">무이자 할부 가능</span>
                </div>
                <div className="benefit-row">
                  <span className="label">멤버십혜택</span>
                  <span className="value">등급별 추가 할인 제공</span>
                </div>
                <div className="benefit-row">
                  <span className="label">배송예상</span>
                  <span className="value">
                    오늘 출발 가능 · 1~2일 내 도착 예정
                  </span>
                </div>
              </div>

              <div className="option-section">
                <div className="option-group">
                  <label>색상</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    {product.colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="option-group">
                  <label>사이즈</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="option-group">
                  <label>수량</label>
                  <div className="quantity-box">
                    <button
                      type="button"
                      onClick={() => changeQuantity("minus")}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity("plus")}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="selected-summary-box">
                <div className="selected-summary-line">
                  <span>
                    {product.name} / {selectedColor} / {selectedSize}
                  </span>
                  <span>{quantity}개</span>
                </div>
              </div>

              <div className="total-price-row">
                <span>총금액</span>
                <strong>{totalPrice.toLocaleString()}원</strong>
              </div>

              <div className="action-button-row">
                <button
                  type="button"
                  className={`wish-button ${isWished ? "active" : ""}`}
                  onClick={() => setIsWished((prev) => !prev)}
                >
                  {isWished ? "♥ 찜완료" : "♡ 찜"}
                </button>

                <button
                  type="button"
                  className="cart-button"
                  onClick={handleCart}
                >
                  장바구니
                </button>

                <button
                  type="button"
                  className="buy-button"
                  onClick={handleOrder}
                >
                  구매하기
                </button>
              </div>
            </div>
          </section>

          <section className="product-bottom-section">
            <div className="detail-tab-row">
              {tabMenus.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`detail-tab-button ${
                    activeTab === tab ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="detail-tab-content">
              {activeTab === "상품정보" && (
                <div className="detail-placeholder">상품정보 영역입니다.</div>
              )}
              {activeTab === "사이즈" && (
                <div className="detail-placeholder">
                  사이즈 정보 영역입니다.
                </div>
              )}
              {activeTab === "관련상품" && (
                <div className="detail-placeholder">관련상품 영역입니다.</div>
              )}
              {activeTab === "구매후기" && (
                <div className="detail-placeholder">구매후기 영역입니다.</div>
              )}
              {activeTab === "상품문의" && (
                <div className="detail-placeholder">상품문의 영역입니다.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
