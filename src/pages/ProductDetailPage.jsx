import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import {
  getProductMainAndThumbImages,
} from "../api/productImageApi";
import "../css/ProductDetailPage.css";
import { getProductDetail } from "../api/productApi";

const tabMenus = ["상품정보", "사이즈", "관련상품", "구매후기", "상품문의"];
const API_BASE_URL = "http://localhost:8080";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [activeTab, setActiveTab] = useState("상품정보");

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const [productRes, imageRes] = await Promise.all([
          getProductDetail(id),
          getProductMainAndThumbImages(id),
        ]);

        console.log("상품 상세 응답:", productRes);
        console.log("이미지 리스트 응답:", imageRes);

        setProduct(productRes);
        setImageData(imageRes);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error("상품 상세 조회 실패:", error);
      }
    };

    fetchDetailData();
  }, [id]);

  const imageList = useMemo(() => {
    if (!imageData?.images) return [];
    return imageData.images;
  }, [imageData]);

  const displayImages = useMemo(() => {
    if (!imageList.length) return [];
    return imageList;
  }, [imageList]);

  const currentDisplayImage = useMemo(() => {
    if (!displayImages.length) return null;
    return displayImages[currentImageIndex] || displayImages[0];
  }, [displayImages, currentImageIndex]);

  const finalPrice = useMemo(() => {
    return Number(product?.price ?? 0);
  }, [product?.price]);

  const totalPrice = useMemo(() => {
    return finalPrice * quantity;
  }, [finalPrice, quantity]);

  const movePrevImage = () => {
    if (!displayImages.length) return;

    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  };

  const moveNextImage = () => {
    if (!displayImages.length) return;

    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1,
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
    navigate("/cart");
  };

  const handleOrder = () => {
    navigate("/order/write");
  };

  if (!product) {
    return (
      <>
        <Header />
        <div className="product-detail-container">
          상품 정보를 불러오는 중입니다.
        </div>
      </>
    );
  }

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

                {currentDisplayImage ? (
                  <img
                    src={`${API_BASE_URL}${currentDisplayImage.imageUrl}`}
                    alt={product.name}
                    className="product-main-image"
                  />
                ) : (
                  <div className="product-no-image">NO IMAGE</div>
                )}

                <button
                  type="button"
                  className="image-arrow right"
                  onClick={moveNextImage}
                >
                  &#62;
                </button>
              </div>

              <div className="product-thumbnail-list">
                {displayImages.map((img, index) => (
                  <button
                    key={img.productImgNo}
                    type="button"
                    className={`thumbnail-button ${
                      currentImageIndex === index ? "active" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={`${API_BASE_URL}${img.imageUrl}`}
                      alt={`썸네일-${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="product-info-area">
              <div className="product-top-meta">
                <p className="product-number">상품번호 : {product.productNo}</p>
                <button type="button" className="share-button">
                  ↗
                </button>
              </div>

              <div className="product-title-row">
                <h1 className="product-name">{product.name}</h1>
              </div>

              <div className="product-badge-row">
                {product.sameDayDeliveryYn === "Y" && (
                  <span>당일출고 가능</span>
                )}
                <span>카테고리 {product.categoryId}</span>
                <span>조회수 {product.viewCount ?? 0}</span>
              </div>

              <div className="product-price-block">
                <div className="product-price-line">
                  <strong className="product-sale-price">
                    {Number(product.price ?? 0).toLocaleString()}원
                  </strong>
                </div>

                <p className="product-discount-text">
                  {product.sameDayDeliveryYn === "Y"
                    ? "오늘 출발 가능 상품입니다."
                    : "일반 배송 상품입니다."}
                </p>
              </div>

              <div className="benefit-info-list">
                <div className="benefit-row">
                  <span className="label">상품설명</span>
                  <span className="value">{product.description}</span>
                </div>
                <div className="benefit-row">
                  <span className="label">상품상태</span>
                  <span className="value">
                    {product.useYn === "Y" ? "판매중" : "비활성"}
                  </span>
                </div>
                <div className="benefit-row">
                  <span className="label">당일출고</span>
                  <span className="value">
                    {product.sameDayDeliveryYn === "Y" ? "가능" : "불가"}
                  </span>
                </div>
              </div>

              <div className="option-section">
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
                  <span>{product.name}</span>
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
                <div className="detail-placeholder">
                  {product.description || "상품 설명이 없습니다."}
                </div>
              )}
              {activeTab === "사이즈" && (
                <div className="detail-placeholder">
                  사이즈 정보는 추후 추가 예정입니다.
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
