import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProductMainAndThumbImages } from "../../api/user/productImageApi";
import { getProductDetail } from "../../api/user/productApi";
import { addCartItem } from "../../api/user/cartItemApi";
import apiClient, { API_SERVER_HOST } from "../../api/common/apiClient";
import Header from "../../components/user/Header";
import ProductInfoTab from "../../components/user/ProductInfoTab";
import ProductSizeTab from "../../components/user/ProductSizeTab";
import "../../css/user/ProductDetailPage.css";
import { addRecentlyViewed } from "../../components/user/RecentlyViewed";

const tabMenus = ["상품정보", "사이즈", "관련상품", "구매후기", "상품문의"];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState([]);
  const [imageData, setImageData] = useState(null);
  // 현재 메인으로 보여줄 이미지 인덱스
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [activeTab, setActiveTab] = useState("상품정보");
  const [selectedOptionNo, setSelectedOptionNo] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        // 상품 정보랑 이미지 정보를 동시에 요청
        const [productRes, imageRes] = await Promise.all([
          getProductDetail(id),
          getProductMainAndThumbImages(id),
        ]);

        // 상세페이지 들어오면 스크롤 맨 위
        window.scrollTo(0, 0);

        setProduct(productRes.product);
        // 옵션 없을 수도 있으니까 빈 배열 처리
        setOptions(productRes.options || []);
        setImageData(imageRes);
        // 상품 바뀌면 첫 이미지부터 다시 보여주기
        setCurrentImageIndex(0);
        // 상품 바뀌면 옵션 선택 초기화
        setSelectedOptionNo("");
        // 수량 1로 초기화
        setQuantity(1);
        // 최근 본 상품 저장
        if (productRes.product) {
          const thumbImg = imageRes?.images?.find(
            (img) => img.imageType === "THUMB"
          )?.imageUrl;

          const cleanUrl = thumbImg
            ? `${API_SERVER_HOST}${thumbImg.startsWith("/upload/") ? thumbImg : "/upload/" + thumbImg}`
            : null;

          addRecentlyViewed({
            productNo: productRes.product.productNo,
            name: productRes.product.name,
            price: productRes.product.price,
            imageUrl: cleanUrl,
          });
        }
      } catch (error) {
        console.error("상품 상세 조회 실패:", error);
      }
    };

    fetchDetailData();
  }, [id]); // id 바뀔 때마다 다시 조회

  // 구매후기 탭 클릭 시 리뷰 데이터를 가져오는 로직
  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab === "구매후기") {
        setReviewLoading(true);
        try {
          // 상품별 리뷰 조회 API 호출
          const response = await apiClient.get(`/api/reviews/product/${id}`);
          setReviews(response.data || []);
        } catch (error) {
          console.error("리뷰 목록 로드 실패:", error);
        } finally {
          setReviewLoading(false);
        }
      }
    };

    fetchReviews();
  }, [activeTab, id]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("tab") === "review") {
      setActiveTab("구매후기");
    }
  }, [location]);

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
    // 선택한 옵션 번호랑 options 배열 안의 option 번호 비교해서 현재 선택된 옵션 객체 찾아오기
    return (
      options.find(
        (option) => String(option.productOptionNo) === String(selectedOptionNo),
      ) || null
    );
  }, [options, selectedOptionNo]);

  const finalPrice = useMemo(() => {
    // 상품 가격 숫자 변환
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
        productPrice: Number(product.price ?? 0),
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
                    className={`thumbnail-button ${currentImageIndex === index ? "active" : ""
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
                >
                  구매하기
                </button>
              </div>
            </div>
          </section>

          <section className="product-bottom-section">
            {/* 하단 탭 버튼들 */}
            <div className="detail-tab-row">
              {tabMenus.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`detail-tab-button ${activeTab === tab ? "active" : ""
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="detail-tab-content">
              {activeTab === "상품정보" && <ProductInfoTab product={product} />}
              {activeTab === "사이즈" && <ProductSizeTab product={product} />}
              {activeTab === "관련상품" && (
                <div className="detail-placeholder">관련상품 영역입니다.</div>
              )}
              {activeTab === "구매후기" && (
                <div className="review-tab-container">
                  {reviewLoading ? (
                    <div className="loading-text">
                      후기를 불러오는 중입니다...
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="review-list-wrap">
                      {reviews.map((rev) => (
                        <div key={rev.reviewNo} className="review-item">
                          <div className="review-header">
                            <span className="review-rating">
                              {"⭐".repeat(rev.rating)}
                            </span>
                            <span className="review-user-info">
                              {rev.nickName || rev.name || "회원"} |{" "}
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="review-body">
                            <h4 className="review-title">{rev.title}</h4>
                            <p className="review-text">{rev.content}</p>
                            {rev.imageUrl && (
                              <div className="review-image">
                                <img
                                  src={`${API_SERVER_HOST}/upload/${rev.imageUrl}`}
                                  alt="후기이미지"
                                />
                              </div>
                            )}
                          </div>
                          <div className="review-footer">
                            스펙: {rev.userHeight}cm / {rev.userWeight}kg |
                            사이즈: {rev.sizeRating}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-review-text">
                      아직 작성된 구매후기가 없습니다.
                    </div>
                  )}
                </div>
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
