import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminDashboard } from "../../api/admin/adminDashboardApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "../../css/admin/AdminDashboardPage.css";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    monthSales: 0,
    monthGrossSales: 0,
    monthRefundAmount: 0,
    monthOrderCount: 0,
    totalMemberCount: 0,
    sellingProductCount: 0,

    todayOrderCount: 0,
    todaySales: 0,
    newMemberCount: 0,
    lowStockCount: 0,
    refundRequestCount: 0,

    salesChartList: [],
    topProductList: [],
    recentOrderList: [],
    lowStockProductList: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminDashboard();

        setDashboard({
          monthSales: data?.monthSales ?? 0,
          monthGrossSales: data?.monthGrossSales ?? 0,
          monthRefundAmount: data?.monthRefundAmount ?? 0,
          monthOrderCount: data?.monthOrderCount ?? 0,
          totalMemberCount: data?.totalMemberCount ?? 0,
          sellingProductCount: data?.sellingProductCount ?? 0,

          todayOrderCount: data?.todayOrderCount ?? 0,
          todaySales: data?.todaySales ?? 0,
          newMemberCount: data?.newMemberCount ?? 0,
          lowStockCount: data?.lowStockCount ?? 0,
          refundRequestCount: data?.refundRequestCount ?? 0,

          salesChartList: data?.salesChartList ?? [],
          topProductList: data?.topProductList ?? [],
          recentOrderList: data?.recentOrderList ?? [],
          lowStockProductList: data?.lowStockProductList ?? [],
        });
      } catch (err) {
        console.error("대시보드 조회 실패:", err);
        setError("대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatNumber = (v) => Number(v || 0).toLocaleString();
  const formatPrice = (v) => `${Number(v || 0).toLocaleString()}원`;
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return dateTime;
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const getCardClassName = (label) => {
    if (label.includes("총환불") || label.includes("환불 요청")) {
      return "admin-dashboard-card is-danger";
    }

    if (label.includes("재고 부족")) {
      return "admin-dashboard-card is-warning";
    }

    if (
      label.includes("최종매출") ||
      label.includes("총매출") ||
      label.includes("오늘 매출")
    ) {
      return "admin-dashboard-card is-primary";
    }

    return "admin-dashboard-card";
  };

  const getStockBadgeClass = (stock) => {
    return stock <= 2
      ? "admin-dashboard-stock-badge is-danger"
      : "admin-dashboard-stock-badge is-warning";
  };

  const getStockStatusText = (stock) => {
    return stock <= 2 ? "위험" : "주의";
  };

  const moveToOrderList = () => {
    navigate("/admin/orders");
  };

  const moveToOrderDetail = (orderNo) => {
    navigate(`/admin/orders/detail/${orderNo}`);
  };

  const moveToProductList = () => {
    navigate("/admin/products");
  };

  const moveToProductDetail = (productNo) => {
    navigate(`/admin/products/detail/${productNo}`);
  };

  const summaryCards = useMemo(
    () => [
      ["금월 최종매출", `${formatNumber(dashboard.monthSales)}원`],
      ["금월 총매출", `${formatNumber(dashboard.monthGrossSales)}원`],
      ["금월 총환불금액", `${formatNumber(dashboard.monthRefundAmount)}원`],
      ["금월 주문 수", `${formatNumber(dashboard.monthOrderCount)}건`],
      ["전체 회원 수", `${formatNumber(dashboard.totalMemberCount)}명`],
      ["판매중 상품 수", `${formatNumber(dashboard.sellingProductCount)}개`],
    ],
    [dashboard],
  );

  const todayCards = useMemo(
    () => [
      ["오늘 주문 수", `${formatNumber(dashboard.todayOrderCount)}건`],
      ["오늘 매출", `${formatNumber(dashboard.todaySales)}원`],
      ["오늘 신규 회원 수", `${formatNumber(dashboard.newMemberCount)}명`],
      ["재고 부족 상품 수", `${formatNumber(dashboard.lowStockCount)}개`],
      ["환불 요청 건수", `${formatNumber(dashboard.refundRequestCount)}건`],
    ],
    [dashboard],
  );

  if (loading) {
    return (
      <AdminLayout pageTitle="대시보드">
        <div className="admin-dashboard-page">
          <div className="admin-dashboard-header">
            <h2 className="admin-dashboard-title">대시보드</h2>
          </div>
          <p className="admin-dashboard-message">
            대시보드 데이터를 불러오는 중입니다...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageTitle="대시보드">
        <div className="admin-dashboard-page">
          <div className="admin-dashboard-header">
            <h2 className="admin-dashboard-title">대시보드</h2>
          </div>
          <p className="admin-dashboard-error">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "PAYMENT_COMPLETED":
        return "admin-dashboard-status-badge is-completed";
      case "PENDING_PAYMENT":
        return "admin-dashboard-status-badge is-pending";
      case "PREPARING":
        return "admin-dashboard-status-badge is-preparing";
      case "SHIPPING":
        return "admin-dashboard-status-badge is-shipping";
      case "DELIVERED":
        return "admin-dashboard-status-badge is-delivered";
      case "CANCELED":
        return "admin-dashboard-status-badge is-canceled";
      default:
        return "admin-dashboard-status-badge";
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case "PAYMENT_COMPLETED":
        return "결제완료";
      case "PENDING_PAYMENT":
        return "결제대기";
      case "PREPARING":
        return "배송준비중";
      case "SHIPPING":
        return "배송중";
      case "DELIVERED":
        return "배송완료";
      case "CANCELED":
        return "취소완료";
      default:
        return status || "-";
    }
  };

  return (
    <AdminLayout
      pageTitle="대시보드"
      contentClassName="admin-page-content-wide"
    >
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-header">
          <h2 className="admin-dashboard-title">대시보드</h2>
        </div>

        {/* 1. 상단 요약 */}
        <section className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title">상단 요약</h3>

          <div className="admin-dashboard-card-grid admin-dashboard-card-grid-6">
            {summaryCards.map(([label, value]) => (
              <div className={getCardClassName(label)} key={label}>
                <p className="admin-dashboard-card-label">{label}</p>
                <p className="admin-dashboard-card-value">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 오늘 현황 */}
        <section className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title">오늘 현황</h3>

          <div className="admin-dashboard-card-grid admin-dashboard-card-grid-5">
            {todayCards.map(([label, value]) => (
              <div className={getCardClassName(label)} key={label}>
                <p className="admin-dashboard-card-label">{label}</p>
                <p className="admin-dashboard-card-value">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 최근 7일 매출 / 인기상품 TOP 5 */}
        <div className="admin-dashboard-grid-row">
          <section className="admin-dashboard-panel admin-dashboard-chart-panel">
            <div className="admin-dashboard-panel-header">
              <h3 className="admin-dashboard-panel-title">최근 7일 매출</h3>
            </div>

            <div className="admin-dashboard-recharts-wrap">
              {dashboard.salesChartList.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboard.salesChartList}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={false}
                    />

                    <YAxis
                      tickFormatter={(value) =>
                        `${Number(value).toLocaleString()}`
                      }
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      width={55}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${Number(value).toLocaleString()}원`,
                        "매출",
                      ]}
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      }}
                    />

                    {/* 막대 */}
                    <Bar
                      dataKey="sales"
                      fill="#2563eb"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={40}
                    />

                    {/* 추세선 */}
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-dashboard-empty">
                  최근 7일 매출 데이터가 없습니다.
                </div>
              )}
            </div>
          </section>

          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-header">
              <h3 className="admin-dashboard-panel-title">인기상품 TOP 5</h3>
              <button
                type="button"
                className="admin-dashboard-more-btn"
                onClick={moveToProductList}
              >
                더보기
              </button>
            </div>

            <div className="admin-dashboard-top-list">
              {dashboard.topProductList.length > 0 ? (
                dashboard.topProductList.map((product, index) => (
                  <div
                    className="admin-dashboard-top-item"
                    key={product.productNo}
                  >
                    <div className="admin-dashboard-top-rank">{index + 1}</div>

                    <div className="admin-dashboard-top-name">
                      {product.name}
                    </div>

                    <div className="admin-dashboard-top-sales">
                      {formatNumber(product.totalSalesCount)}개 판매
                    </div>

                    <button
                      type="button"
                      className="admin-dashboard-action-btn"
                      onClick={() => moveToProductDetail(product.productNo)}
                    >
                      상세보기
                    </button>
                  </div>
                ))
              ) : (
                <div className="admin-dashboard-empty">
                  인기상품 데이터가 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 4. 최근 주문 / 재고 부족 */}
        <div className="admin-dashboard-grid-row">
          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-header">
              <h3 className="admin-dashboard-panel-title">최근 주문 5건</h3>
              <button
                type="button"
                className="admin-dashboard-more-btn"
                onClick={moveToOrderList}
              >
                더보기
              </button>
            </div>

            <div className="admin-dashboard-table-wrap">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>주문자</th>
                    <th>주문상태</th>
                    <th>총금액</th>
                    <th>주문일시</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrderList.length > 0 ? (
                    dashboard.recentOrderList.map((order) => (
                      <tr key={order.orderNo}>
                        <td>{order.orderNo}</td>
                        <td>{order.ordererName}</td>
                        <td>
                          <span
                            className={getOrderStatusClass(order.orderStatus)}
                          >
                            {getOrderStatusText(order.orderStatus)}
                          </span>
                        </td>
                        <td>{formatPrice(order.totalPrice)}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-dashboard-action-btn"
                            onClick={() => moveToOrderDetail(order.orderNo)}
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin-dashboard-empty">
                        최근 주문 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-header">
              <h3 className="admin-dashboard-panel-title">재고 부족 상품</h3>
              <button
                type="button"
                className="admin-dashboard-more-btn"
                onClick={moveToProductList}
              >
                더보기
              </button>
            </div>

            <div className="admin-dashboard-table-wrap">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>상품번호</th>
                    <th>상품명</th>
                    <th>옵션</th>
                    <th>재고</th>
                    <th>상태</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.lowStockProductList.length > 0 ? (
                    dashboard.lowStockProductList.map((product) => (
                      <tr key={product.productOptionNo}>
                        <td>{product.productNo}</td>
                        <td>{product.productName}</td>
                        <td>
                          {product.optionColor || "-"} /{" "}
                          {product.optionSize || "-"}
                        </td>
                        <td>{product.stock}</td>
                        <td>
                          <span className={getStockBadgeClass(product.stock)}>
                            {product.stockStatus ||
                              getStockStatusText(product.stock)}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-dashboard-action-btn"
                            onClick={() =>
                              moveToProductDetail(product.productNo)
                            }
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin-dashboard-empty">
                        재고 부족 상품이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
