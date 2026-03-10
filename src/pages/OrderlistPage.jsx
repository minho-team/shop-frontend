import { useEffect, useState } from "react";
import { getOrders } from "../api/ordersApi/ordersApi";

const OrderlistPage = () => {
  const [orders, setOrders] = useState([]); //useState 설정 [주문목록 데이터, 주문목록을 변경하는 함수 ]

  /* 페이지가 처음 실행되면
    → fetchOrders 함수 만들고
    → 그 함수 실행해서
    → 주문목록 데이터를 가져온 뒤
    → orders 상태에 저장한다
    useEffect는 컴포넌트가 렌더링된 뒤 특정 작업을 실행할 때 사용하는 React 기능
  */
  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getOrders();
      setOrders(data);
    };
    fetchOrders();
  }, []); // [] => 의존성 배열 = 이 useEffect를 처음 한 번만 실행하겠다 / []를 빼면 렌더링이 될 때마다 계속 실행될 수 있습니다.

  return (
    <div>
      <h2>주문 목록</h2>
      <table border="1">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>주문자명</th>
            <th>주문금액</th>
            <th>주문상태</th>
            <th>주문일시</th>
            <th>환불상태</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNo}>
              <td>{order.orderNo}</td>
              <td>{order.ordererName}</td>
              <td>{order.totalPrice}</td>
              <td>{order.orderStatus}</td>
              <td>{order.createdAt}</td>
              <td>{order.refundStatus ? order.refundStatus : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default OrderlistPage;
