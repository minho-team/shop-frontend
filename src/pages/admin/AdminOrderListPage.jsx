import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { useEffect, useState } from "react";
import { getOrderList } from "../../api/admin/ordersApi";
import { useNavigate } from "react-router-dom";

const ORDER_STATUS_LABEL = {
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELED: "주문취소",
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
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          style={{
            margin: "0 4px",
            padding: "6px 10px",
            fontWeight: pageInfo.currentPage === i ? "bold" : "normal",
            backgroundColor: pageInfo.currentPage === i ? "#ddd" : "#fff",
            border: "1px solid #ccc",
            cursor: "pointer",
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
      <AdminHeader />
      <AdminLayout>
        <h2>회원들의 주문 목록</h2>

        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
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
                  style={{ cursor: "pointer" }}
                >
                  <td>{order.orderNo}</td>
                  <td>{order.ordererName}</td>
                  <td>
                    {ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus}
                  </td>
                  <td>{order.totalPrice}</td>
                  <td>{order.createdAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">주문 내역이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {pageInfo.hasPrev && (
            <button
              onClick={() => handlePageClick(pageInfo.startPage - 1)}
              style={{
                margin: "0 4px",
                padding: "6px 10px",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              {"<"}
            </button>
          )}

          {renderPageButtons()}

          {pageInfo.hasNext && (
            <button
              onClick={() => handlePageClick(pageInfo.endPage + 1)}
              style={{
                margin: "0 4px",
                padding: "6px 10px",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              {">"}
            </button>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminOrderListPage;
