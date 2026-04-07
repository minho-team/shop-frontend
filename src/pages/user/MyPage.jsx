import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/user/Header";
import { useUser } from "../../context/UserContext";
import "../../css/user/MyPage.css";
import { getMyOrderList } from "../../api/user/ordersApi";
import apiClient, { API_SERVER_HOST } from "../../api/common/apiClient";
import Footer from "../../components/user/Footer";
import { getMyWishlist } from "../../api/user/wishlistApi";
import MyPageEditPage from "./MyPageEditPage";

// ================================================
// 헬퍼 함수 (Helper Functions)
// ================================================

// 누적 금액 기반 등급 계산
const getGradeByAmount = (amount) => {
  if (amount >= 1000000) return "VVIP";
  if (amount >= 500000) return "VIP";
  if (amount >= 300000) return "GOLD";
  if (amount >= 100000) return "SILVER";
  return "BASIC";
};

// 주문 상태 한글 변환
const getStatusLabel = (orderStatus, refundStatus) => {
  if (refundStatus === "REFUND_REQUESTED") return "결제완료(환불요청중)";
  if (refundStatus === "COMPLETED" || refundStatus === "REFUNDED") return "환불완료";
  if (refundStatus === "REJECTED") return "환불 거절됨";
  if (refundStatus === "APPROVED") return "환불 승인됨";

  switch (orderStatus) {
    case "PENDING_PAYMENT": return "결제대기";
    case "PAYMENT_COMPLETED": return "결제완료";
    case "PREPARING": return "배송준비중";
    case "SHIPPING": return "배송중";
    case "DELIVERED": return "배송완료";
    case "CANCEL_REQUESTED": return "취소요청";
    case "CANCELED": return "주문취소";
    default: return orderStatus || "상태미정";
  }
};

// 날짜 포맷 (yyyy.mm.dd)
const formatDate = (d) => (!d ? "-" : new Date(d).toLocaleDateString("ko-KR"));

// ================================================
// [컴포넌트] 등급 혜택 안내 (Grade Info)
// ================================================
const GradeInfo = ({ totalSpent, currentGrade, memberName }) => {
  const grades = [
    { name: "VVIP", condition: "100만원 이상", benefit: "10% 할인 쿠폰 + 무료배송" },
    { name: "VIP", condition: "50만원 이상", benefit: "7% 할인 쿠폰 + 무료배송" },
    { name: "GOLD", condition: "30만원 이상", benefit: "5% 할인 쿠폰" },
    { name: "SILVER", condition: "10만원 이상", benefit: "3% 할인 쿠폰" },
    { name: "BASIC", condition: "기본 등급", benefit: "신규가입 혜택 제공" },
  ];

  return (
    <div className="grade-info-wrapper">
      <div className="current-status-box">
        <p>
          현재 <strong>{memberName}</strong>님의 누적 구매 금액은{" "}
          {/* 금액 적용 */}
          <strong className="highlight-price">{totalSpent.toLocaleString()}원</strong>이며,
        </p>
        <p>
          적용된 멤버쉽 등급은{" "}
          <span className={`badge-box badge-${currentGrade.toLowerCase()}`}>
            {currentGrade}
          </span>{" "}
          입니다.
        </p>
      </div>
      <table className="custom-table grade-table">
        <thead>
          <tr>
            <th>등급명</th>
            <th>조건 (누적금액)</th>
            <th>혜택</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.name} className={currentGrade === g.name ? "row-highlight" : ""}>
              <td><strong>{g.name}</strong></td>
              <td>{g.condition}</td>
              <td>{g.benefit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ================================================
// [컴포넌트] 주문 내역 (Order History)
// ================================================
const OrderHistory = ({ user }) => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get("page")) || 1;

  // 검색 파라미터 상태 관리
  const [params, setParams] = useState({
    page: urlPage,
    size: 10,
    searchType: "productName",
    keyword: "",
    orderStatus: "",
    startDate: "",
    endDate: ""
  });

  // 기간 필터 설정
  const setDateRange = (days) => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - days);

    setParams({
      ...params,
      startDate: targetDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      page: 1
    });
  };

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // params 객체를 백엔드로 전달
      const data = await getMyOrderList(params);
      setPageData(data);
    } catch (err) {
      console.error("주문 내역 로딩 오류:", err);
    } finally {
      setLoading(false);
    }
  }, [user, params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setParams({ ...params, page: 1 });
    fetchOrders();
  };

  if (loading && !pageData) return <div className="loading-container">데이터 로드 중...</div>;

  const { orderList = [], startPage = 0, endPage = 0, prev = false, next = false } = pageData || {};

  return (
    <div className="order-history-container">
      {/* 검색 및 필터 섹션 */}
      <section className="order-search-filter">
        <form onSubmit={handleSearchSubmit} className="filter-form">
          {/* 첫 번째 줄: 조회기간 */}
          <div className="filter-row">
            <div className="filter-label">조회기간</div>
            <div className="filter-content-wrap">
              <div className="btn-group-attached">
                <button
                  type="button"
                  className={`filter-btn ${params.startDate && !params.endDate === false ? 'active' : ''}`}
                  onClick={() => setDateRange(7)}
                >
                  최근 일주일
                </button>
                <button
                  type="button"
                  className={`filter-btn ${!params.startDate ? 'active' : ''}`}
                  onClick={() => setParams({ ...params, startDate: "", endDate: "" })}
                >
                  직접선택
                </button>
              </div>
              <div className="date-picker-wrap">
                <input type="date" value={params.startDate} onChange={(e) => setParams({ ...params, startDate: e.target.value })} />
                <span className="tilde">~</span>
                <input type="date" value={params.endDate} onChange={(e) => setParams({ ...params, endDate: e.target.value })} />
              </div>
            </div>
          </div>

          {/* 두 번째 줄: 주문상태 + 검색어 */}
          <div className="filter-row">
            <div className="filter-label">주문상태</div>
            <div className="filter-content-wrap">
              <select className="status-select" value={params.orderStatus} onChange={(e) => setParams({ ...params, orderStatus: e.target.value, page: 1 })}>
                <option value="">전체 상태</option>
                <option value="PAID">결제완료</option>
                <option value="PENDING_PAYMENT">결제대기</option>
                <option value="CANCELED">주문취소</option>
                <option value="SHIPPING">배송중</option>
                <option value="DELIVERED">배송완료</option>
                <option value="REFUND_REQUESTED">환불요청중</option>
                <option value="REFUNDED">환불완료</option>
                <option value="CANCEL_REQUESTED">취소요청</option>
              </select>

              <div className="search-combined-group">
                <select value={params.searchType} onChange={(e) => setParams({ ...params, searchType: e.target.value })}>
                  <option value="productName">상품명</option>
                  <option value="orderNo">주문번호</option>
                </select>
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={params.keyword}
                  onChange={(e) => setParams({ ...params, keyword: e.target.value })}
                />
                <button type="submit" className="btn-submit">조회</button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* 주문 목록 테이블 */}
      <div className="order-list-table">
        {loading && <div className="loading-indicator">로딩 중...</div>}
        <table className="custom-table">
          <thead>
            <tr>
              <th className="th-order-no">주문번호</th>
              <th className="th-product-info">주문정보(상품)</th>
              <th className="th-status">상태</th>
              <th className="th-price">금액</th>
              <th className="th-date">주문일시</th>
            </tr>
          </thead>
          <tbody>
            {orderList.length > 0 ? (
              orderList.map((o) => (
                <tr key={o.orderNo} className="order-row-hover">
                  {/* 1. 주문번호 */}
                  <td className="td-no-padding">
                    <Link to={`/my/order/detail/${o.orderNo}`} state={{ fromPage: params.page }} className="table-cell-link td-order-no text-center">
                      {o.orderNo}
                    </Link>
                  </td>

                  {/* 2. 상품정보 */}
                  <td className="td-no-padding td-product-info">
                    <Link to={`/my/order/detail/${o.orderNo}`} state={{ fromPage: params.page }} className="table-cell-link left-align">
                      <div className="product-item-flex">
                        <div className="thumbnail-box">
                          <img
                            src={o.mainImageUrl ? `${API_SERVER_HOST}${o.mainImageUrl}` : '/images/no-image.png'}
                            alt="thumb"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/no-image.png'; }}
                          />
                        </div>
                        <div className="info-box">
                          <p className="product-name">
                            {o.mainProductName}
                            {o.totalQuantity > 1 && <span className="extra-qty"> 외 {o.totalQuantity - 1}건</span>}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* 3. 상태 */}
                  <td className="td-no-padding">
                    <Link to={`/my/order/detail/${o.orderNo}`} state={{ fromPage: params.page }} className={`table-cell-link text-center td-status status-${(o.refundStatus || o.orderStatus)?.toLowerCase()}`}>
                      {getStatusLabel(o.orderStatus, o.refundStatus)}
                    </Link>
                  </td>

                  {/* 4. 금액 */}
                  <td className="td-no-padding">
                    <Link to={`/my/order/detail/${o.orderNo}`} state={{ fromPage: params.page }} className="table-cell-link text-center td-price">
                      ₩{o.totalPrice?.toLocaleString()}
                    </Link>
                  </td>

                  {/* 5. 주문일시 */}
                  <td className="td-no-padding">
                    <Link to={`/my/order/detail/${o.orderNo}`} state={{ fromPage: params.page }} className="table-cell-link col-align text-center td-date">
                      <div className="date-display">
                        {new Date(o.createdAt).toLocaleDateString()}
                        <span className="time-display">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-row">조회된 주문 내역이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이징 UI */}
      {pageData && startPage > 0 && (
        <div className="pagination-wrapper">
          <button className="paging-btn" disabled={!prev} onClick={() => setParams({ ...params, page: startPage - 1 })}> &lt; </button>
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((num) => (
            <button
              key={num}
              className={`paging-btn ${params.page === num ? "active" : ""}`}
              onClick={() => setParams({ ...params, page: num })}
            >
              {num}
            </button>
          ))}
          <button className="paging-btn" disabled={!next} onClick={() => setParams({ ...params, page: endPage + 1 })}> &gt; </button>
        </div>
      )}
    </div>
  );
};

// ================================================
// [컴포넌트] 상품 리뷰 목록 (Review History)
// ================================================
const ReviewHistory = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const pageBlockSize = 5;

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    try {
      const response = await apiClient.get("/api/reviews/my");
      setReviews(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleEdit = (review) => {
    navigate(`/my/review/edit/${review.reviewNo}`, { state: review });
  };

  const handleDelete = async (reviewNo) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/reviews/${reviewNo}`);
      alert("삭제되었습니다.");
      window.location.reload();
    } catch (err) {
      console.error("삭제 실패:", err.response?.data);
      alert(err.response?.data || "삭제에 실패했습니다.");
    }
  };

  if (loading) return <div className="loading-container">리뷰 로딩 중...</div>;

  const totalItems = reviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const currentBlock = Math.ceil(currentPage / pageBlockSize);
  const startPage = (currentBlock - 1) * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPages);

  const prev = startPage > 1;
  const next = endPage < totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="table-responsive">
      <table className="custom-table" style={{ tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th>작성일</th>
            <th>상품정보</th>
            <th>내용</th>
            <th>별점</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {currentReviews.length > 0 ? (
            currentReviews.map((r) => (
              <tr key={r.reviewNo} className="order-row-hover">
                {/* 1. 작성일 */}
                <td className="td-no-padding">
                  <Link to={`/product/detail/${r.productNo}`} className="table-cell-link text-center">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Link>
                </td>

                {/* 2. 상품정보 */}
                <td className="td-no-padding product-info-column">
                  <Link to={`/product/detail/${r.productNo}`} className="table-cell-link left-align">
                    <div className="product-info-wrapper">
                      <img
                        src={
                          r.productMainImage
                            ? (r.productMainImage.startsWith('/')
                              ? `${API_SERVER_HOST}${r.productMainImage}`
                              : `${API_SERVER_HOST}/upload/${r.productMainImage}`)
                            : '/default-product.png'
                        }
                        alt={r.itemName}
                        className="review-product-img"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/default-product.png'; }}
                      />
                      <div className="product-info-text">
                        <span className="order-no-label">주문번호: {r.orderNo || '정보없음'}</span>
                        <span className="product-link-text">{r.itemName}</span>
                      </div>
                    </div>
                  </Link>
                </td>

                {/* 3. 내용 */}
                <td className="td-no-padding">
                  <Link to={`/product/detail/${r.productNo}`} className="table-cell-link col-align text-center">
                    <div className="review-title-text">{r.title}</div>
                    <div className="review-content-text">{r.content}</div>
                  </Link>
                </td>

                {/* 4. 별점 */}
                <td className="td-no-padding">
                  <Link to={`/product/detail/${r.productNo}`} className="table-cell-link text-center">
                    {"⭐".repeat(r.rating)}
                  </Link>
                </td>

                {/* 5. 관리 */}
                <td className="text-center">
                  <div className="review-action-btns">
                    <button className="btn-mini" onClick={() => handleEdit(r)}>수정</button>
                    <button className="btn-mini btn-del" onClick={() => handleDelete(r.reviewNo)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-row">작성한 리뷰가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* 페이징 UI 코드 */}
      {totalItems > 0 && (
        <div className="pagination-wrapper">
          <button
            className="paging-btn"
            disabled={!prev}
            onClick={() => setCurrentPage(startPage - 1)}
          >
            &lt;
          </button>
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((num) => (
            <button
              key={num}
              className={`paging-btn ${currentPage === num ? "active" : ""}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="paging-btn"
            disabled={!next}
            onClick={() => setCurrentPage(endPage + 1)}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

// ================================================
// [컴포넌트] 찜 목록 (WishList History)
// ================================================
const WishListHistory = ({ user }) => {
  const [wishItems, setWishItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const pageBlockSize = 5;

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const data = await getMyWishlist();
        setWishItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("찜 목록 조회 실패:", err);
        setWishItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  if (loading) return <div className="loading-container">찜 목록 로딩 중...</div>;

  if (wishItems.length === 0) {
    return (
      <div className="empty-content">
        <p>찜한 상품이 없습니다.</p>
      </div>
    );
  }
  const totalItems = wishItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const currentBlock = Math.ceil(currentPage / pageBlockSize);
  const startPage = (currentBlock - 1) * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPages);

  const prev = startPage > 1;
  const next = endPage < totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentWishItems = wishItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* 찜 목록 컨테이너 */}
      <div className="wishlist-history-list">
        {currentWishItems.map((item) => {
          const isSale = Number(item.discountRate || 0) > 0;
          const finalPrice = Number(item.salePrice ?? item.price ?? 0);
          const originalPrice = Number(item.price ?? 0);

          return (
            <button
              key={item.wishlistNo}
              type="button"
              className="wishlist-card"
              onClick={() => navigate(`/product/detail/${item.productNo}`)}
            >
              <div className="wishlist-image-wrap">
                {item.imageUrl ? (
                  <img
                    src={`${API_SERVER_HOST}${item.imageUrl}`}
                    alt={item.name}
                    className="wishlist-image"
                  />
                ) : (
                  <div className="wishlist-no-image">NO IMAGE</div>
                )}
              </div>

              <div className="wishlist-info">
                <div className="wishlist-top-row">
                  <strong className="wishlist-name">{item.name}</strong>
                  <span className="wishlist-date">
                    {formatDate(item.wishedAt)}
                  </span>
                </div>

                <div className="wishlist-price-row">
                  <strong className="wishlist-sale-price">
                    {finalPrice.toLocaleString()}원
                  </strong>

                  {isSale && (
                    <>
                      <span className="wishlist-original-price">
                        {originalPrice.toLocaleString()}원
                      </span>
                      <span className="wishlist-discount-rate">
                        {item.discountRate}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="wishlist-bottom-row">
                  <span>상품 상세 보러가기</span>
                  {item.sameDayDeliveryYn === "Y" && (
                    <span className="wishlist-delivery-badge">당일출고</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalItems > 0 && (
        <div className="pagination-wrapper">
          <button
            className="paging-btn"
            disabled={!prev}
            onClick={() => setCurrentPage(startPage - 1)}
          >
            &lt;
          </button>
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((num) => (
            <button
              key={num}
              className={`paging-btn ${currentPage === num ? "active" : ""}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="paging-btn"
            disabled={!next}
            onClick={() => setCurrentPage(endPage + 1)}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

// ================================================
// [컴포넌트] 쿠폰 내역 조회 (Coupon History)
// ================================================
const CouponHistory = ({ user }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL / UNUSED / USED

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!user) return;
      try {
        const res = await apiClient.get("/api/member/coupons");
        setCoupons(res.data);
      } catch (err) {
        console.error("쿠폰 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [user]);

  if (loading) return <div className="loading-container">쿠폰 로딩 중...</div>;

  const filtered = coupons.filter((c) => {
    if (filter === "UNUSED") return c.usedYn === "N";
    if (filter === "USED") return c.usedYn === "Y";
    return true;
  });

  return (
    <div>
      <div className="coupon-filter-container">
        {[
          { key: "ALL", label: `전체 (${coupons.length})` },
          { key: "UNUSED", label: `미사용 (${coupons.filter((c) => c.usedYn === "N").length})` },
          { key: "USED", label: `사용완료 (${coupons.filter((c) => c.usedYn === "Y").length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`coupon-filter-btn ${filter === f.key ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-content">
          <p>보유 중인 쿠폰이 없습니다.</p>
        </div>
      ) : (
        <div className="coupon-list-container">
          {filtered.map((cp) => (
            <div key={cp.memberCouponNo} className={`coupon-item ${cp.usedYn === "Y" ? "used" : ""}`}>
              <div>
                <p className="coupon-title">{cp.couponName}</p>
                <p className="coupon-desc">
                  {cp.discountType === "RATE"
                    ? `${cp.discountValue}% 할인`
                    : `${Number(cp.discountValue).toLocaleString()}원 할인`}
                </p>
                <p className="coupon-date">
                  {cp.endAt
                    ? `유효기간: ${formatDate(cp.startAt)} ~ ${formatDate(cp.endAt)}`
                    : "유효기간: 무기한"}
                </p>
              </div>
              <span className={`coupon-badge ${cp.usedYn === "Y" ? "used" : ""}`}>
                {cp.usedYn === "Y" ? "사용완료" : "미사용"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ================================================
// [메인] 마이페이지 (MyPage)
// ================================================
const MyPage = () => {
  const { user, loading: userLoading } = useUser();
  const [activeMenu, setActiveMenu] = useState("주문내역조회");
  const navigate = useNavigate();

  const totalSpent = Number(user?.totalSpent || user?.totalPriceSum || 0);
  const currentGrade = user?.grade || getGradeByAmount(totalSpent);

  // 금액 기반 프로그레스 바 계산
  const getProgress = () => {
    if (totalSpent >= 1000000) return 100;
    const targets = [100000, 300000, 500000, 1000000];
    const nextTarget = targets.find((t) => t > totalSpent) || 1000000;
    const prevTarget = targets[targets.indexOf(nextTarget) - 1] || 0;

    const segmentProgress = ((totalSpent - prevTarget) / (nextTarget - prevTarget)) * 100;
    return Math.min(segmentProgress, 100);
  };

  // 다음 등급까지 남은 금액 계산
  const getNextGradeInfo = () => {
    const targets = [100000, 300000, 500000, 1000000];
    const nextTarget = targets.find((t) => t > totalSpent);
    if (!nextTarget) return null;
    return nextTarget - totalSpent;
  };

  if (userLoading) return <div className="loading-container">정보 로딩 중...</div>;

  return (
    <div className="mypage-container">
      <Header />
      <div className="user-summary-bg">
        <section className="user-summary">
          <div className="user-info">
            <span className="welcome-text">WELCOME</span>
            <h2>{user?.memberName || "회원"} 님</h2>
            <button className="btn-grade-check" onClick={() => setActiveMenu("등급 혜택 안내")}>
              멤버쉽 등급확인 {">"}
            </button>
          </div>

          <div className="grade-badge">
            <span className="label">Membership</span>

            <div className="grade-display-wrapper">
              {/* 1. 등급 뱃지 */}
              <div className="badge-side">
                <span className={`badge-box badge-${currentGrade.toLowerCase()}`}>
                  {currentGrade}
                </span>
              </div>

              {/* 2. 등급 정보 텍스트 그룹 */}
              <div className="grade-text-group">
                <strong className={`grade-text-main grade-text-${currentGrade.toLowerCase()}`}>
                  {currentGrade} Member
                </strong>

                {/* VVIP가 아닐 때만 다음 등급 정보를 보여줌 */}
                {currentGrade !== "VVIP" && (
                  <div className="next-grade-container">
                    <span className="next-grade-info">
                      다음 등급까지 <strong>{getNextGradeInfo()?.toLocaleString()}원</strong> 남음
                    </span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-fill fill-color"
                        style={{ width: `${getProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mypage-wrapper">
        <div className="mypage-body">
          <aside className="sidebar">
            <MenuSection
              title="나의 쇼핑 정보"
              items={["주문내역조회", "상품리뷰", "찜목록 조회"]}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
            <MenuSection
              title="나의 혜택 정보"
              items={["쿠폰내역조회", "등급 혜택 안내"]}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
            <MenuSection
              title="고객센터"
              items={["자주 묻는 질문"]}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
            <MenuSection
              title="설정"
              items={["개인 정보 수정"]}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
          </aside>

          <main className="content-area">
            <h3 className="content-title">{activeMenu}</h3>
            {activeMenu === "주문내역조회" && <OrderHistory user={user} />}
            {activeMenu === "상품리뷰" && <ReviewHistory user={user} />}
            {activeMenu === "찜목록 조회" && <WishListHistory user={user} />}
            {activeMenu === "쿠폰내역조회" && <CouponHistory user={user} />}
            {activeMenu === "등급 혜택 안내" && (
              <GradeInfo
                totalSpent={totalSpent}
                currentGrade={currentGrade}
                memberName={user?.memberName}
              />
            )}
            {activeMenu === "개인 정보 수정" && <MyPageEditPage />}

            {![
              "주문내역조회",
              "상품리뷰",
              "찜목록 조회",
              "쿠폰내역조회",
              "등급 혜택 안내",
              "개인 정보 수정",
            ].includes(activeMenu) && (
                <div className="empty-content">
                  <p>현재 {activeMenu} 메뉴는 준비 중입니다.</p>
                </div>
              )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// ================================================
// [컴포넌트] 사이드바 메뉴 섹션 (Sidebar Menu Section)
// ================================================
const MenuSection = ({ title, items, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  return (
    <div className="menu-group">
      <h4>{title}</h4>
      <ul className="menu-list">
        {items.map((item) => (
          <li
            key={item}
            className={`menu-item ${activeMenu === item ? "active" : ""}`}
            onClick={() => {
              if (item === "자주 묻는 질문") navigate("/inquiry");
              else setActiveMenu(item);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyPage;