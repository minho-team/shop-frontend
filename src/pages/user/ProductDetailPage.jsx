import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductMainAndThumbImages } from "../../api/user/productImageApi";
import {
  getProductDetail,
  getRelatedProducts,
} from "../../api/user/productApi";
import { addCartItem } from "../../api/user/cartItemApi";
import { API_SERVER_HOST } from "../../api/common/apiClient";
import ProductDetailTabs from "../../components/user/Productdetailtabs";
import Header from "../../components/user/Header";
import RecentlyViewed, {
  addRecentlyViewed,
} from "../../components/user/RecentlyViewed";
import "../../css/user/ProductDetailPage.css";
import "../../css/common/MainProductList.css";
import PopularKeywords from "../../components/user/PopularKeywords";
import Footer from "../../components/user/Footer";
import TestNoticeBanner from "../../components/user/TestNoticeBanner";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState([]);

  // 관련상품 목록 저장용 state
  const [relatedProducts, setRelatedProducts] = useState([]);
  // 관련상품 로딩 상태
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [imageData, setImageData] = useState(null);
  // 현재 메인으로 보여줄 이미지 인덱스
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [selectedOptionNo, setSelectedOptionNo] = useState("");

  // 할인율이 있으면 할인된 가격 계산
  const getSalePrice = (price, discountRate) => {
    if (!discountRate || discountRate <= 0) return price;
    return Math.floor((price * (100 - discountRate)) / 100 / 100) * 100;
  };

  useEffect(() => {
    const fetchDetailData = async () => {
      setRelatedLoading(true);
      try {
        // 상품 정보, 이미지, 관련상품을 동시에 요청
        const [productRes, imageRes, relatedRes] = await Promise.all([
          getProductDetail(id),
          getProductMainAndThumbImages(id),
          getRelatedProducts(id),
        ]);

        // 상세페이지 들어오면 스크롤 맨 위
        window.scrollTo(0, 0);

        setProduct(productRes.product);
        // 옵션 없을 수도 있으니까 빈 배열 처리
        setOptions(productRes.options || []);
        setImageData(imageRes);
        setRelatedProducts(Array.isArray(relatedRes) ? relatedRes : []);
        // 상품 바뀌면 첫 이미지부터 다시 보여주기
        setCurrentImageIndex(0);
        // 상품 바뀌면 옵션 선택 초기화
        setSelectedOptionNo("");
        // 수량 1로 초기화
        setQuantity(1);

        // 최근 본 상품 저장
        if (productRes.product) {
          const thumbImg = imageRes?.images?.find(
            (img) => img.imageType === "THUMB",
          )?.imageUrl;

          const cleanUrl = thumbImg
            ? `${API_SERVER_HOST}${thumbImg.startsWith("/upload/") ? thumbImg : "/upload/" + thumbImg}`
            : null;

          addRecentlyViewed({
            productNo: productRes.product.productNo,
            name: productRes.product.name,
            price:
              productRes.product.salePrice ??
              getSalePrice(
                productRes.product.price,
                productRes.product.discountRate,
              ),
            imageUrl: cleanUrl,
          });
        }
      } catch (error) {
        console.error("상품 상세 조회 실패:", error);

        // 실패하면 관련상품도 빈 배열로 초기화
        setRelatedProducts([]);
      } finally {
        // 관련상품 로딩 종료
        setRelatedLoading(false);
      }
    };

    fetchDetailData();
  }, [id]); // id 바뀔 때마다 다시 조회

  const imageList = useMemo(() => {
    if (!imageData?.images) return [];

    return imageData.images;
  }, [imageData]);

  const displayImages = useMemo(() => {
    if (!imageList.length) return [];

    return imageList.filter(
      (img) =>
        img.imageType === "MAIN" ||
        img.imageType === "THUMB" ||
        img.imageType === "SUB",
    );
  }, [imageList]);

  const currentDisplayImage = useMemo(() => {
    if (!displayImages.length) return null;
    return displayImages[currentImageIndex] || displayImages[0];
  }, [displayImages, currentImageIndex]);

  const selectedOption = useMemo(() => {
    // 선택한 옵션 번호랑 options 배열 안의 option 번호 비교해서 현재 선택된 옵션 객체 찾아오기
    return (
      options.find(
        (option) => String(option.productOptionNo) === String(selectedOptionNo),
      ) || null
    );
  }, [options, selectedOptionNo]);

  const originalPrice = useMemo(() => {
    return Number(product?.price ?? 0);
  }, [product?.price]);

  const discountRate = useMemo(() => {
    return Number(product?.discountRate ?? 0);
  }, [product?.discountRate]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;

    // 백엔드에서 salePrice 내려주면 그거 우선 사용
    if (product.salePrice != null) {
      return Number(product.salePrice);
    }

    // 혹시 백엔드 값이 없으면 프론트에서 한 번 더 계산
    return getSalePrice(originalPrice, discountRate);
  }, [product, originalPrice, discountRate]);

  const isSale = discountRate > 0;

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

  const handleCart = async () => {
    if (!product) return;

    if (options.length > 0 && !selectedOptionNo) {
      alert("옵션을 선택해주세요.");
      return;
    }

    try {
      const payload = {
        productNo: Number(product.productNo),
        quantity: Number(quantity),
        ...(selectedOptionNo
          ? { productOptionNo: Number(selectedOptionNo) }
          : {}),
      };

      console.log("장바구니 요청 payload:", payload);

      await addCartItem(payload);

      const moveCart = window.confirm(
        "장바구니에 담았습니다.\n장바구니 페이지로 이동할까요?",
      );

      if (moveCart) {
        navigate("/cart");
      }
    } catch (error) {
      console.error("장바구니 담기 실패:", error);
      console.error("응답 데이터:", error.response?.data);

      // 로그인 안 된 상태면 로그인 페이지로 이동
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      alert("장바구니에 담지 못했습니다.");
    }
  };

  const handleOrder = () => {
    if (options.length > 0 && !selectedOptionNo) {
      alert("옵션을 선택해주세요.");
      return;
    }

    // 주문서 작성 페이지로 이동하면서 필요한 데이터 같이 넘겨주는 구조
    navigate("/order/write", {
      state: {
        productNo: product.productNo,
        productName: product.name,
        productPrice: finalPrice,
        originalPrice: originalPrice,
        discountRate: discountRate,
        salePrice: finalPrice,
        quantity: quantity,
        totalPrice: totalPrice,
        productOptionNo: selectedOption ? selectedOption.productOptionNo : null,
        optionSize: selectedOption ? selectedOption.optionSize : "",
        optionColor: selectedOption ? selectedOption.color : "",
        stock: selectedOption ? selectedOption.stock : 0,
        // 현재 보고 있는 대표 이미지 경로
        imageUrl: currentDisplayImage
          ? `${API_SERVER_HOST}${currentDisplayImage.imageUrl}`
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
            {/* 왼쪽 영역: 상품 이미지 */}
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
                    src={`${API_SERVER_HOST}${currentDisplayImage.imageUrl}`}
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

              {/* 썸네일 이미지 목록 */}
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
                      src={`${API_SERVER_HOST}${img.imageUrl}`}
                      alt={`썸네일-${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="product-info-area">
              <div className="product-top-meta">
                <p className="product-number">상품번호 : {product.productNo}</p>
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
                  {isSale ? (
                    <>
                      <strong className="product-sale-price">
                        {finalPrice.toLocaleString()}원
                      </strong>
                      <span className="product-original-price">
                        {originalPrice.toLocaleString()}원
                      </span>
                      <span className="product-discount-rate">
                        {discountRate}% OFF
                      </span>
                    </>
                  ) : (
                    <strong className="product-sale-price">
                      {originalPrice.toLocaleString()}원
                    </strong>
                  )}
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
                  <label>옵션</label>
                  {options.length > 0 ? (
                    <select
                      value={selectedOptionNo}
                      onChange={(e) => setSelectedOptionNo(e.target.value)}
                    >
                      <option value="">옵션 선택</option>
                      {options.map((option) => (
                        <option
                          key={option.productOptionNo}
                          value={option.productOptionNo}
                        >
                          {option.optionSize} / {option.color} / 재고{" "}
                          {option.stock}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p>옵션이 없습니다.</p>
                  )}
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
                  <span>{product.name}</span>
                  <span>{quantity}개</span>
                </div>

                {selectedOption && (
                  <div className="selected-summary-line">
                    <span>
                      옵션: {selectedOption.color} / {selectedOption.optionSize}
                    </span>
                  </div>
                )}
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
                  style={{marginBottom:"20px"}}
                >
                  구매하기
                </button>
              </div>
            </div>
          </section>

          <TestNoticeBanner/>
          <section className="product-bottom-section">
            <ProductDetailTabs
              product={product}
              options={options}
              images={imageData?.images || []}
              relatedProducts={relatedProducts}
              relatedLoading={relatedLoading}
            />
          </section>
        </div>
      </div>
      <RecentlyViewed />
      <Footer />
    </>
  );
};

export default ProductDetailPage;
