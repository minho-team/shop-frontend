import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { getOrderList } from "../../api/admin/adminOrdersApi";
import "../../css/admin/AdminOrderListPage.css";

const ORDER_STATUS_LABEL = {
  PENDING_PAYMENT: "결제대기",
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELED: "주문취소",
};

const INITIAL_SEARCH = {
  page: 1,
  size: 10,
  searchType: "ordererName",
  keyword: "",
  datePreset: "",
  startDate: "",
  endDate: "",
  orderStatus: "",
};

const DEFAULT_PAGE_INFO = {
  currentPage: 1,
  size: 10,
  totalCount: 0,
  totalPage: 0,
  startPage: 1,
  endPage: 1,
  hasPrev: false,
  hasNext: false,
};

const formatPrice = (price) => {
  if (price == null) return "-";
  return Number(price).toLocaleString() + "원";
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

const parseSearchParamsToState = (searchParams) => {
  const parsedPage = Number(searchParams.get("page")) || 1;
  const parsedSize = Number(searchParams.get("size")) || 10;

  return {
    page: parsedPage,
    size: parsedSize,
    searchType: searchParams.get("searchType") || "ordererName",
    keyword: searchParams.get("keyword") || "",
    datePreset: searchParams.get("datePreset") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    orderStatus: searchParams.get("orderStatus") || "",
  };
};

const buildSearchParams = (params) => {
  const nextParams = new URLSearchParams();

  nextParams.set("page", String(params.page ?? 1));
  nextParams.set("size", String(params.size ?? 10));

  if (params.searchType) nextParams.set("searchType", params.searchType);
  if (params.keyword) nextParams.set("keyword", params.keyword);
  if (params.datePreset) nextParams.set("datePreset", params.datePreset);
  if (params.startDate) nextParams.set("startDate", params.startDate);
  if (params.endDate) nextParams.set("endDate", params.endDate);
  if (params.orderStatus) nextParams.set("orderStatus", params.orderStatus);

  return nextParams;
};

const AdminOrderListPage = () => {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState(() =>
    parseSearchParamsToState(searchParams)
  );
  const [pageInfo, setPageInfo] = useState(DEFAULT_PAGE_INFO);

  const fetchOrders = async (params) => {
    try {
      const data = await getOrderList(params);
      setOrders(data.content || []);
      setPageInfo(data.pageInfo || DEFAULT_PAGE_INFO);
    } catch (error) {
      console.error("주문 목록 조회 실패:", error);
      setOrders([]);
      setPageInfo(DEFAULT_PAGE_INFO);
    }
  };

  useEffect(() => {
    const paramsFromUrl = parseSearchParamsToState(searchParams);
    setSearch(paramsFromUrl);
    fetchOrders(paramsFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateUrlAndFetch = (nextSearch) => {
    const nextParams = buildSearchParams(nextSearch);
    setSearchParams(nextParams);
  };

  const clickOneOrder = (orderNo) => {
    const queryString = searchParams.toString();
    nav(`/admin/order/detail/${orderNo}${queryString ? `?${queryString}` : ""}`);
  };

  const handlePageClick = (page) => {
    const nextSearch = {
      ...search,
      page,
    };
    updateUrlAndFetch(nextSearch);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;

    setSearch((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "datePreset") {
        if (value === "recentWeek" || value === "") {
          next.startDate = "";
          next.endDate = "";
        }
      }

      return next;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (search.datePreset === "custom") {
      if (!search.startDate || !search.endDate) {
        alert("시작일과 종료일을 모두 선택해주세요.");
        return;
      }

      if (search.startDate > search.endDate) {
        alert("시작일은 종료일보다 늦을 수 없습니다.");
        return;
      }
    }

    const nextSearch = {
      ...search,
      page: 1,
    };

    updateUrlAndFetch(nextSearch);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(e);
    }
  };

  const handleReset = () => {
    setSearch(INITIAL_SEARCH);
    updateUrlAndFetch(INITIAL_SEARCH);
  };

  const renderPageButtons = () => {
    const buttons = [];

    for (let i = pageInfo.startPage; i <= pageInfo.endPage; i++) {
      const isActive = pageInfo.currentPage === i;

      buttons.push(
        <button
          key={i}
          type="button"
          onClick={() => handlePageClick(i)}
          className={`admin-order-page-btn ${isActive ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <AdminLayout>
      <div className="admin-order-page">
        <div className="admin-order-search-section">
          <div className="admin-order-section-head">
            <h3>검색 및 필터</h3>
            <span>조건을 선택해서 주문을 조회하세요.</span>
          </div>

          <form className="admin-order-search-form" onSubmit={handleSearchSubmit}>
            <div className="admin-order-search-grid">
              <div className="admin-order-form-group small">
                <label>검색조건</label>
                <select
                  name="searchType"
                  value={search.searchType}
                  onChange={handleSearchChange}
                >
                  <option value="orderNo">주문번호</option>
                  <option value="ordererName">주문자명</option>
                </select>
              </div>

              <div className="admin-order-form-group large keyword-group">
                <label>검색어</label>
                <input
                  type="text"
                  name="keyword"
                  value={search.keyword}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder="주문번호 또는 주문자명을 입력하세요"
                />
              </div>

              <div className="admin-order-form-group medium">
                <label>주문상태</label>
                <select
                  name="orderStatus"
                  value={search.orderStatus}
                  onChange={handleSearchChange}
                >
                  <option value="">전체</option>
                  <option value="PENDING_PAYMENT">결제대기</option>
                  <option value="PAYMENT_COMPLETED">결제완료</option>
                  <option value="PREPARING">상품준비중</option>
                  <option value="SHIPPING">배송중</option>
                  <option value="DELIVERED">배송완료</option>
                  <option value="CANCELED">주문취소</option>
                </select>
              </div>

              <div className="admin-order-form-group medium">
                <label>기간 필터</label>
                <select
                  name="datePreset"
                  value={search.datePreset}
                  onChange={handleSearchChange}
                >
                  <option value="">전체</option>
                  <option value="recentWeek">최근 일주일</option>
                  <option value="custom">직접 선택</option>
                </select>
              </div>

              <div className="admin-order-form-group date-group">
                <label>시작일</label>
                <input
                  type="date"
                  name="startDate"
                  value={search.startDate}
                  onChange={handleSearchChange}
                  disabled={search.datePreset !== "custom"}
                />
              </div>

              <div className="admin-order-date-divider">~</div>

              <div className="admin-order-form-group date-group">
                <label>종료일</label>
                <input
                  type="date"
                  name="endDate"
                  value={search.endDate}
                  onChange={handleSearchChange}
                  disabled={search.datePreset !== "custom"}
                />
              </div>
            </div>

            <div className="admin-order-search-actions">
              <button type="submit" className="admin-order-search-btn primary">
                검색
              </button>
              <button
                type="button"
                className="admin-order-search-btn secondary"
                onClick={handleReset}
              >
                초기화
              </button>
            </div>
          </form>
        </div>

        <div className="admin-order-table-section">
          <div className="admin-order-section-head table-head">
            <h3>주문 리스트</h3>
            <span>행을 클릭하면 주문 상세페이지로 이동합니다.</span>
          </div>

          <div className="admin-order-table-wrap">
            <table className="admin-order-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>주문자명</th>
                  <th>주문상태</th>
                  <th>총금액</th>
                  <th>주문일시</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.orderNo}
                      onClick={() => clickOneOrder(order.orderNo)}
                      className="admin-order-row"
                    >
                      <td className="strong">{order.orderNo}</td>
                      <td>{order.ordererName}</td>
                      <td>
                        <span className="admin-order-status-badge">
                          {ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus}
                        </span>
                      </td>
                      <td>{formatPrice(order.totalPrice)}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="admin-order-empty">
                      주문 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-order-pagination">
            {pageInfo.hasPrev && (
              <button
                type="button"
                onClick={() => handlePageClick(pageInfo.startPage - 1)}
                className="admin-order-page-btn"
              >
                이전
              </button>
            )}

            {renderPageButtons()}

            {pageInfo.hasNext && (
              <button
                type="button"
                onClick={() => handlePageClick(pageInfo.endPage + 1)}
                className="admin-order-page-btn"
              >
                다음
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderListPage;