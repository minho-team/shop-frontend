import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import "../../css/admin/AdminDashboardPage.css";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  // =========================
  // 1. 월간 요약
  // =========================
  const monthlySummary = useMemo(() => {
    return {
      monthSales: 12850000,
      monthOrderCount: 342,
      totalMemberCount: 1280,
      sellingProductCount: 186,
    };
  }, []);

  // =========================
  // 2. 오늘 요약
  // =========================
  const todaySummary = useMemo(() => {
    return {
      todayOrderCount: 23,
      todaySales: 845000,
      newMemberCount: 4,
      lowStockCount: 7,
      refundRequestCount: 2,
    };
  }, []);

  // =========================
  // 3. 최근 주문
  // =========================
  const recentOrders = useMemo(() => {
    return [
      {
        orderNo: 202603240001,
        ordererName: "김민수",
        orderStatus: "결제완료",
        totalPrice: 59000,
        orderDate: "2026-03-24 09:10",
      },
      {
        orderNo: 202603240002,
        ordererName: "이서연",
        orderStatus: "배송준비중",
        totalPrice: 128000,
        orderDate: "2026-03-24 09:35",
      },
      {
        orderNo: 202603240003,
        ordererName: "박지훈",
        orderStatus: "배송중",
        totalPrice: 79000,
        orderDate: "2026-03-24 10:02",
      },
      {
        orderNo: 202603240004,
        ordererName: "최유진",
        orderStatus: "환불요청",
        totalPrice: 39000,
        orderDate: "2026-03-24 10:28",
      },
      {
        orderNo: 202603240005,
        ordererName: "정하늘",
        orderStatus: "주문접수",
        totalPrice: 149000,
        orderDate: "2026-03-24 11:14",
      },
    ];
  }, []);

  // =========================
  // 4. 재고 부족
  // =========================
  const lowStockProducts = useMemo(() => {
    return [
      {
        productNo: 101,
        productName: "남성 후드집업",
        optionText: "블랙 / L",
        stock: 2,
        stockStatus: "위험",
      },
      {
        productNo: 102,
        productName: "여성 니트",
        optionText: "아이보리 / FREE",
        stock: 3,
        stockStatus: "위험",
      },
      {
        productNo: 103,
        productName: "데님 팬츠",
        optionText: "블루 / 30",
        stock: 4,
        stockStatus: "주의",
      },
      {
        productNo: 104,
        productName: "숄더백",
        optionText: "베이지",
        stock: 1,
        stockStatus: "위험",
      },
      {
        productNo: 105,
        productName: "스니커즈",
        optionText: "화이트 / 270",
        stock: 5,
        stockStatus: "주의",
      },
    ];
  }, []);

  // =========================
  // 공통 함수
  // =========================
  const formatNumber = (v) => Number(v).toLocaleString();
  const formatPrice = (v) => `${Number(v).toLocaleString()}원`;

  const moveToOrderList = () => navigate("/admin/orders");
  const moveToOrderDetail = (orderNo) => {
    navigate(`/admin/order/detail/${orderNo}`);
  };

  const moveToProductList = () => navigate("/admin/products");
  const moveToProductDetail = (productNo) => {
    navigate(`/admin/products/detail/${productNo}`);
  };

  return (
    <>
      <AdminHeader />

      <AdminLayout>
        <div className="admin-dashboard-page">
          {/* 제목 */}
          <div className="admin-dashboard-header">
            <h2>대시보드</h2>
          </div>

          {/* 1행 */}
          <div className="admin-dashboard-card-row admin-dashboard-card-row-4">
            <div className="admin-dashboard-summary-card">
              <div>금월 매출</div>
              <strong>{formatPrice(monthlySummary.monthSales)}</strong>
            </div>

            <div className="admin-dashboard-summary-card">
              <div>금월 주문 수</div>
              <strong>{formatNumber(monthlySummary.monthOrderCount)}건</strong>
            </div>

            <div className="admin-dashboard-summary-card">
              <div>전체 회원 수</div>
              <strong>{formatNumber(monthlySummary.totalMemberCount)}명</strong>
            </div>

            <div className="admin-dashboard-summary-card">
              <div>판매중 상품 수</div>
              <strong>
                {formatNumber(monthlySummary.sellingProductCount)}개
              </strong>
            </div>
          </div>

          {/* 2행 */}
          <div className="admin-dashboard-card-row admin-dashboard-card-row-5">
            <div className="admin-dashboard-summary-card">
              오늘 주문 {todaySummary.todayOrderCount}
            </div>
            <div className="admin-dashboard-summary-card">
              오늘 매출 {formatPrice(todaySummary.todaySales)}
            </div>
            <div className="admin-dashboard-summary-card">
              신규 회원 {todaySummary.newMemberCount}
            </div>
            <div className="admin-dashboard-summary-card">
              재고 부족 {todaySummary.lowStockCount}
            </div>
            <div className="admin-dashboard-summary-card">
              환불 요청 {todaySummary.refundRequestCount}
            </div>
          </div>

          {/* 최근 주문 */}
          <div className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-header">
              <h3>최근 주문 (5건)</h3>
              <button onClick={moveToOrderList}>더보기</button>
            </div>

            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>주문자</th>
                  <th>상태</th>
                  <th>금액</th>
                  <th>주문일</th>
                  <th>상세</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.orderNo}>
                    <td>{o.orderNo}</td>
                    <td>{o.ordererName}</td>
                    <td>{o.orderStatus}</td>
                    <td>{formatPrice(o.totalPrice)}</td>
                    <td>{o.orderDate}</td>
                    <td>
                      <button onClick={() => moveToOrderDetail(o.orderNo)}>
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 재고 부족 */}
          <div className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-header">
              <h3>재고 부족 상품 (5개)</h3>
              <button onClick={moveToProductList}>더보기</button>
            </div>

            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>옵션</th>
                  <th>재고</th>
                  <th>상태</th>
                  <th>상세</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.productNo}>
                    <td>{p.productName}</td>
                    <td>{p.optionText}</td>
                    <td>{p.stock}</td>
                    <td>{p.stockStatus}</td>
                    <td>
                      <button onClick={() => moveToProductDetail(p.productNo)}>
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboardPage;
