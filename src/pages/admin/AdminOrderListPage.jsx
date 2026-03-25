import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { getOrderList } from "../../api/admin/adminOrdersApi";
import { useNavigate } from "react-router-dom";

const ORDER_STATUS_LABEL = {
  PENDING_PAYMENT: "결제대기",
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELED: "주문취소",
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

const AdminOrderListPage = () => {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    size: 10,
    totalCount: 0,
    totalPage: 0,
    startPage: 1,
    endPage: 1,
    hasPrev: false,
    hasNext: false,
  });

  const fetchOrders = async (page = 1) => {
    try {
      const data = await getOrderList(page, 10);
      setOrders(data.content);
      setPageInfo(data.pageInfo);
    } catch (error) {
      console.error("주문 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const clickOneOrder = (id) => {
    nav(`/admin/order/detail/${id}`);
  };

  const handlePageClick = (page) => {
    fetchOrders(page);
  };

  const renderPageButtons = () => {
    const buttons = [];

    for (let i = pageInfo.startPage; i <= pageInfo.endPage; i++) {
      const isActive = pageInfo.currentPage === i;

      buttons.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          style={{
            ...styles.pageButton,
            ...(isActive ? styles.pageButtonActive : {}),
          }}
        >
          {i}
        </button>,
      );
    }

    return buttons;
  };

  return (
    <>
      <AdminLayout pageTitle="주문 관리">
        <h2>주문 관리</h2>
        <div style={styles.page}>
          <div style={styles.summaryRow}>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>전체 주문 수</p>
              <p style={styles.summaryValue}>{pageInfo.totalCount}</p>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>현재 페이지</p>
              <p style={styles.summaryValue}>{pageInfo.currentPage}</p>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>페이지 크기</p>
              <p style={styles.summaryValue}>{pageInfo.size}</p>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>전체 페이지</p>
              <p style={styles.summaryValue}>{pageInfo.totalPage}</p>
            </div>
          </div>

          <div style={styles.tableSection}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>주문 리스트</h3>
              <span style={styles.tableCount}>총 {pageInfo.totalCount}건</span>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>주문번호</th>
                    <th style={styles.th}>주문자명</th>
                    <th style={styles.th}>주문상태</th>
                    <th style={styles.th}>총금액</th>
                    <th style={styles.th}>주문일시</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr
                        key={order.orderNo}
                        onClick={() => clickOneOrder(order.orderNo)}
                        style={styles.tr}
                      >
                        <td style={styles.tdStrong}>{order.orderNo}</td>
                        <td style={styles.td}>{order.ordererName}</td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge}>
                            {ORDER_STATUS_LABEL[order.orderStatus] ||
                              order.orderStatus}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td style={styles.td}>
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.emptyTd}>
                        주문 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={styles.pagination}>
              {pageInfo.hasPrev && (
                <button
                  onClick={() => handlePageClick(pageInfo.startPage - 1)}
                  style={styles.pageButton}
                >
                  {"<"}
                </button>
              )}

              {renderPageButtons()}

              {pageInfo.hasNext && (
                <button
                  onClick={() => handlePageClick(pageInfo.endPage + 1)}
                  style={styles.pageButton}
                >
                  {">"}
                </button>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

const styles = {
  page: {
    backgroundColor: "#ffffff",
    color: "#111111",
    minHeight: "100%",
    padding: "24px",
  },
  topBox: {
    backgroundColor: "#111111",
    color: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  topSubTitle: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "1.6px",
    opacity: 0.75,
  },
  topTitle: {
    margin: "10px 0 8px 0",
    fontSize: "30px",
    fontWeight: 800,
  },
  topDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#d0d0d0",
  },
  summaryRow: {
    display: "flex",
    gap: "14px",
    marginBottom: "20px",
    flexWrap: "nowrap",
    overflowX: "auto",
  },
  summaryCard: {
    flex: "1 1 0",
    minWidth: "200px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
  },
  summaryLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#666666",
  },
  summaryValue: {
    margin: "10px 0 0 0",
    fontSize: "22px",
    fontWeight: 800,
    color: "#111111",
  },
  tableSection: {
    backgroundColor: "#ffffff",
    border: "1px solid #e8e8e8",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },
  tableTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#111111",
  },
  tableCount: {
    fontSize: "13px",
    color: "#666666",
    backgroundColor: "#f5f5f5",
    borderRadius: "999px",
    padding: "8px 12px",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #ededed",
    borderRadius: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
    backgroundColor: "#ffffff",
  },
  th: {
    backgroundColor: "#111111",
    color: "#ffffff",
    padding: "14px 16px",
    fontSize: "14px",
    fontWeight: 700,
    textAlign: "center",
    borderBottom: "1px solid #222222",
  },
  tr: {
    cursor: "pointer",
    borderBottom: "1px solid #efefef",
  },
  td: {
    padding: "16px",
    textAlign: "center",
    fontSize: "14px",
    color: "#222222",
    backgroundColor: "#ffffff",
  },
  tdStrong: {
    padding: "16px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: 700,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  emptyTd: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#666666",
    backgroundColor: "#fafafa",
    fontSize: "14px",
  },
  statusBadge: {
    display: "inline-block",
    backgroundColor: "#f2f2f2",
    color: "#111111",
    border: "1px solid #dddddd",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700,
  },
  pagination: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  pageButton: {
    minWidth: "40px",
    height: "40px",
    padding: "0 12px",
    border: "1px solid #d6d6d6",
    backgroundColor: "#ffffff",
    color: "#111111",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  pageButtonActive: {
    backgroundColor: "#111111",
    color: "#ffffff",
    border: "1px solid #111111",
  },
};

export default AdminOrderListPage;
