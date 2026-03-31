import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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

// 구매 횟수 기반 등급 계산
const getGrade = (count) => {
  if (count >= 30) return "VVIP";
  if (count >= 20) return "VIP";
  if (count >= 10) return "GOLD";
  if (count >= 5) return "SILVER";
  return "BASIC";
};

// 주문 상태 한글 변환
const getStatusLabel = (status) => {
  switch (status) {
    case "PENDING_PAYMENT": return "결제대기";
    case "PAYMENT_COMPLETED": return "결제완료";
    case "PREPARING": return "배송준비중";
    case "SHIPPING": return "배송중";
    case "DELIVERED": return "배송완료";
    case "CANCEL_REQUESTED": return "취소요청";
    case "CANCELED": return "주문취소";
    case "REJECTED": return "환불 거절됨";
    case "REFUND_REQUESTED": return "환불요청중";
    case "REFUNDED": return "환불완료";
    default: return status || "상태미정";
  }
};

// 날짜 포맷 (yyyy.mm.dd)
const formatDate = (d) => (!d ? "-" : new Date(d).toLocaleDateString("ko-KR"));

// ================================================
// [컴포넌트] 등급 혜택 안내 (Grade Info)
// ================================================
const GradeInfo = ({ purchaseCount, currentGrade, memberName }) => {
  const grades = [
    { name: "VVIP", condition: "30회 이상", benefit: "10% 할인 쿠폰 + 무료배송" },
    { name: "VIP", condition: "20회 이상", benefit: "7% 할인 쿠폰 + 무료배송" },
    { name: "GOLD", condition: "10회 이상", benefit: "5% 할인 쿠폰" },
    { name: "SILVER", condition: "5회 이상", benefit: "3% 할인 쿠폰" },
    { name: "BASIC", condition: "기본 등급", benefit: "신규가입 혜택 제공" },
  ];

  return (
    <div className="grade-info-wrapper">
      <div className="current-status-box">
        <p>
          현재 <strong>{memberName}</strong>님의 누적 구매 횟수는{" "}
          <strong>{purchaseCount}회</strong>이며,
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
            <th>조건</th>
            <th>혜택</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr
              key={g.name}
              className={currentGrade === g.name ? "row-highlight" : ""}
            >
              <td>
                <strong>{g.name}</strong>
              </td>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getMyOrderList(currentPage);
        setPageData(data);
      } catch (err) {
        console.error("주문 내역 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, currentPage]);

  if (loading) return <div className="loading-container">데이터 로드 중...</div>;

  const {
    orderList = [],
    startPage = 0,
    endPage = 0,
    prev = false,
    next = false,
  } = pageData || {};

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>주문일자</th>
            <th>주문번호</th>
            <th>금액</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {orderList.length > 0 ? (
            orderList.map((o) => (
              <tr key={o.orderNo} className="order-row-hover">
                <td>
                  <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </Link>
                </td>
                <td>
                  <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                    {o.orderNo}
                  </Link>
                </td>
                <td>
                  <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                    ₩{o.totalPrice?.toLocaleString()}
                  </Link>
                </td>
                <td className={`status-${o.orderStatus?.toLowerCase()}`}>
                  <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                    {getStatusLabel(o.orderStatus)}
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="empty-row">
                최근 주문 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pageData && startPage > 0 && (
        <div className="pagination-wrapper">
          <button
            className="paging-btn"
            disabled={!prev}
            onClick={() => setCurrentPage(startPage - 1)}
          >
            &lt;
          </button>
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((num) => (
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
                <td className="text-center">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="text-center">
                  <Link to={`/product/detail/${r.productNo}`} className="product-link">
                    {r.itemName}
                  </Link>
                </td>
                <td className="text-center">
                  <div className="review-title-text">{r.title}</div>
                  <div className="review-content-text">{r.content}</div>
                </td>
                <td className="text-center">{"⭐".repeat(r.rating)}</td>
                <td className="text-center">
                  <div className="review-action-btns">
                    <button className="btn-mini" onClick={() => handleEdit(r)}>
                      수정
                    </button>
                    <button className="btn-mini btn-del" onClick={() => handleDelete(r.reviewNo)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-row">
                작성한 리뷰가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* 5. 요청하신 페이징 UI 코드 삽입 */}
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

  const purchaseCount = Number(user?.purchaseCount) || 0;
  const currentGrade = user?.grade || getGrade(purchaseCount);

  const getProgress = () => {
    if (purchaseCount >= 30) return 100;
    const targets = [5, 10, 20, 30];
    const nextTarget = targets.find((t) => t > purchaseCount) || 30;
    const prevTarget = targets[targets.indexOf(nextTarget) - 1] || 0;

    const segmentProgress = ((purchaseCount - prevTarget) / (nextTarget - prevTarget)) * 100;
    return Math.min(segmentProgress, 100);
  };

  const getNextGradeInfo = () => {
    if (purchaseCount < 5) return 5 - purchaseCount;
    if (purchaseCount < 10) return 10 - purchaseCount;
    if (purchaseCount < 20) return 20 - purchaseCount;
    if (purchaseCount < 30) return 30 - purchaseCount;
    return 0;
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
            <span className="label">Grade (등급)</span>
            <div className="grade-display-wrapper">
              <span className={`badge-box badge-${currentGrade.toLowerCase()}`}>
                {currentGrade}
              </span>
              <div className="grade-text-group">
                <strong className={`grade-text-${currentGrade.toLowerCase()}`}>
                  {currentGrade}
                </strong>
                {currentGrade !== "VVIP" && (
                  <>
                    <span className="next-grade-info">
                      다음 등급까지 {getNextGradeInfo()}회 남음
                    </span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgress()}%` }}
                      ></div>
                    </div>
                  </>
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
                purchaseCount={purchaseCount}
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