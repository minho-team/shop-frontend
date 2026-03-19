import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { getProductMainAndThumbImages } from "../api/productImageApi";
import "../css/ProductDetailPage.css";
import { getProductDetail } from "../api/productApi";

const tabMenus = ["상품정보", "사이즈", "관련상품", "구매후기", "상품문의"];
const API_BASE_URL = "http://localhost:8080";

const getSalePrice = (price, discountRate) => {
  if (!discountRate || discountRate <= 0) return Number(price ?? 0);
  return Math.floor((Number(price ?? 0) * (100 - discountRate)) / 100 / 100) * 100;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState([]);
  const [imageData, setImageData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [activeTab, setActiveTab] = useState("상품정보");
  const [selectedOptionNo, setSelectedOptionNo] = useState("");

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const [productRes, imageRes] = await Promise.all([
          getProductDetail(id),
          getProductMainAndThumbImages(id),
        ]);

        window.scrollTo(0, 0);

        console.log("상품 상세 페이지에서:", productRes);
        console.log("상품 상세페이지에서 이미지 리스트 응답:", imageRes);

        setProduct(productRes.product);
        setOptions(productRes.options || []);

        setImageData(imageRes);
        setCurrentImageIndex(0);
        setSelectedOptionNo("");
        setQuantity(1);
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

  const selectedOption = useMemo(() => {
    return (
      options.find(
        (option) => String(option.productOptionNo) === String(selectedOptionNo),
      ) || null
    );
  }, [options, selectedOptionNo]);

  const finalPrice = useMemo(() => {
    return getSalePrice(product?.price, product?.discountRate);
  }, [product?.price, product?.discountRate]);

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
    if (options.length > 0 && !selectedOptionNo) {
      alert("옵션을 선택해주세요.");
      return;
    }

    navigate("/cart");
  };

  const handleOrder = () => {
    if (options.length > 0 && !selectedOptionNo) {
      alert("옵션을 선택해주세요.");
      return;
    }

    navigate("/order/write", {
      state: {
        productNo: product.productNo,
        productName: product.name,
        productPrice: Number(finalPrice ?? 0),
        quantity: quantity,
        totalPrice: totalPrice,
        productOptionNo: selectedOption ? selectedOption.productOptionNo : null,
        optionSize: selectedOption ? selectedOption.optionSize : "",
        optionColor: selectedOption ? selectedOption.color : "",
        stock: selectedOption ? selectedOption.stock : 0,
        imageUrl: currentDisplayImage
          ? `${API_BASE_URL}${currentDisplayImage.imageUrl}`
          : "",
      },
    });
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
                    className={`thumbnail-button ${currentImageIndex === index ? "active" : ""}`}
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
                  {product.discountRate > 0 && (
                    <span className="product-origin-price">
                      {Number(product.price ?? 0).toLocaleString()}원
                    </span>
                  )}
                  <strong className="product-sale-price">
                    {Number(finalPrice).toLocaleString()}원
                  </strong>
                  {product.discountRate > 0 && (
                    <span className="product-discount-rate">
                      {product.discountRate}%
                    </span>
                  )}
                </div>

                <p className="product-discount-text">
                  {product.discountRate > 0
                    ? "봄 시즌 할인 적용 상품입니다."
                    : product.sameDayDeliveryYn === "Y"
                      ? "오늘 출발 가능 상품입니다."
                      : "일반 배송 상품입니다."}
                </p>
              </div>

              <div className="benefit-info-list">
                <div className="benefit-row">
                  <span className="label">상품설명</span>
                  <span className="value">{product.description || "상품 설명이 없습니다."}</span>
                </div>

                <div className="benefit-row">
                  <span className="label">적립금</span>
                  <span className="value">구매 금액의 1% 적립</span>
                </div>

                <div className="benefit-row">
                  <span className="label">배송정보</span>
                  <span className="value">
                    {product.sameDayDeliveryYn === "Y"
                      ? "당일출고 가능 상품"
                      : "일반 배송 상품"}
                  </span>
                </div>
              </div>

              {options.length > 0 && (
                <div className="option-select-wrap">
                  <label htmlFor="product-option-select" className="option-label">
                    옵션 선택
                  </label>
                  <select
                    id="product-option-select"
                    value={selectedOptionNo}
                    onChange={(e) => setSelectedOptionNo(e.target.value)}
                    className="option-select"
                  >
                    <option value="">옵션을 선택해주세요</option>
                    {options.map((option) => (
                      <option key={option.productOptionNo} value={option.productOptionNo}>
                        {option.optionSize} / {option.color} / 재고 {option.stock}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="quantity-box">
                <span className="quantity-label">수량</span>
                <div className="quantity-control">
                  <button type="button" onClick={() => changeQuantity("minus")}>-</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => changeQuantity("plus")}>+</button>
                </div>
              </div>

              <div className="total-price-box">
                <span>총 상품금액</span>
                <strong>{Number(totalPrice).toLocaleString()}원</strong>
              </div>

              <div className="product-action-row">
                <button
                  type="button"
                  className={`wish-button ${isWished ? "active" : ""}`}
                  onClick={() => setIsWished((prev) => !prev)}
                >
                  {isWished ? "♥" : "♡"}
                </button>

                <button type="button" className="cart-button" onClick={handleCart}>
                  장바구니
                </button>

                <button type="button" className="buy-button" onClick={handleOrder}>
                  바로구매
                </button>
              </div>
            </div>
          </section>

          <div className="product-tab-menu">
            {tabMenus.map((menu) => (
              <button
                key={menu}
                type="button"
                className={activeTab === menu ? "active" : ""}
                onClick={() => setActiveTab(menu)}
              >
                {menu}
              </button>
            ))}
          </div>

          <div className="product-tab-content">
            {activeTab === "상품정보" && (
              <div className="product-description-box">
                <p>{product.description || "등록된 상품 정보가 없습니다."}</p>
              </div>
            )}

            {activeTab === "사이즈" && (
              <div className="product-description-box">
                <p>사이즈 정보는 옵션을 확인해주세요.</p>
              </div>
            )}

            {activeTab === "관련상품" && (
              <div className="product-description-box">
                <p>관련상품 영역입니다.</p>
              </div>
            )}

            {activeTab === "구매후기" && (
              <div className="product-description-box">
                <p>구매후기 영역입니다.</p>
              </div>
            )}

            {activeTab === "상품문의" && (
              <div className="product-description-box">
                <p>상품문의 영역입니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;