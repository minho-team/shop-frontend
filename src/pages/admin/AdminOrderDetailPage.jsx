import AdminLayout from "../../components/admin/AdminLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getAdminOrderItemList,
  updateAdminOrderItemStatus,
} from "../../api/admin/adminOrdersItemApi";
import { useEffect, useMemo, useState } from "react";
import { API_SERVER_HOST } from "../../api/common/apiClient";
import "../../css/admin/AdminOrderDetailPage.css";

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING_PAYMENT", label: "결제대기" },
  { value: "PAYMENT_COMPLETED", label: "결제완료" },
  { value: "PREPARING", label: "상품준비중" },
  { value: "SHIPPING", label: "배송중" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "CANCEL_REQUESTED", label: "취소요청" },
  { value: "CANCELED", label: "취소완료" },
  { value: "REFUND_REQUESTED", label: "환불요청" },
  { value: "REFUNDED", label: "환불완료" },
];

const getStatusLabel = (status) => {
  const found = ORDER_STATUS_OPTIONS.find((option) => option.value === status);
  return found ? found.label : status;
};

const formatPrice = (price) => {
  if (price == null) return "-";
  return `${Number(price).toLocaleString()}원`;
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

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${API_SERVER_HOST}${imageUrl}`;
};

const AdminOrderDetailPage = () => {
  const { orderNo } = useParams();
  const location = useLocation();
  const nav = useNavigate();

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        const data = await getAdminOrderItemList(orderNo);
        setOrderItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("주문 상세 조회 실패:", error);
        setOrderItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [orderNo]);

  const handleStatusChange = (orderItemNo, newStatus) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.orderItemNo === orderItemNo
          ? { ...item, orderItemStatus: newStatus }
          : item
      )
    );
  };

  const handleSave = async (item) => {
    try {
      await updateAdminOrderItemStatus(item.orderItemNo, item.orderItemStatus);
      alert("상태가 저장되었습니다.");
    } catch (error) {
      console.error("상태 저장 실패:", error);
      alert("상태 저장에 실패했습니다.");
    }
  };

  const handleGoList = () => {
    const queryString = location.search || "";
    nav(`/admin/order${queryString}`);
  };

  const orderSummary = useMemo(() => {
    if (orderItems.length === 0) {
      return {
        ordererName: "-",
        createdAt: "-",
        totalPrice: "-",
      };
    }

    return {
      ordererName: orderItems[0].ordererName || "-",
      createdAt: formatDateTime(orderItems[0].createdAt),
      totalPrice: formatPrice(orderItems[0].totalPrice),
    };
  }, [orderItems]);

  return (
    <AdminLayout pageTitle="주문 상세">
      <div className="admin-order-detail-page">
        <div className="admin-order-detail-top-button-row">
          <button
            type="button"
            onClick={handleGoList}
            className="admin-order-detail-list-button"
          >
            목록으로
          </button>
        </div>

        <div className="admin-order-detail-summary-row">
          <div className="admin-order-detail-summary-card">
            <p className="admin-order-detail-summary-label">주문번호</p>
            <p className="admin-order-detail-summary-value">{orderNo}</p>
          </div>

          <div className="admin-order-detail-summary-card">
            <p className="admin-order-detail-summary-label">주문자명</p>
            <p className="admin-order-detail-summary-value">
              {orderSummary.ordererName}
            </p>
          </div>

          <div className="admin-order-detail-summary-card">
            <p className="admin-order-detail-summary-label">주문일시</p>
            <p className="admin-order-detail-summary-value">
              {orderSummary.createdAt}
            </p>
          </div>

          <div className="admin-order-detail-summary-card">
            <p className="admin-order-detail-summary-label">총 주문금액</p>
            <p className="admin-order-detail-summary-value">
              {orderSummary.totalPrice}
            </p>
          </div>
        </div>

        <div className="admin-order-detail-section-box">
          <div className="admin-order-detail-section-header">
            <h2 className="admin-order-detail-section-title">주문 상품 목록</h2>
            <span className="admin-order-detail-item-count">
              총 {orderItems.length}개 상품
            </span>
          </div>

          {loading ? (
            <div className="admin-order-detail-empty-box">불러오는 중...</div>
          ) : orderItems.length === 0 ? (
            <div className="admin-order-detail-empty-box">
              주문 상품이 없습니다.
            </div>
          ) : (
            <div className="admin-order-detail-card-list">
              {orderItems.map((item) => (
                <div
                  key={item.orderItemNo}
                  className="admin-order-detail-item-card"
                >
                  <div className="admin-order-detail-image-wrap">
                    {item.imageUrl ? (
                      <img
                        src={getImageSrc(item.imageUrl)}
                        alt={item.itemName}
                        className="admin-order-detail-image"
                      />
                    ) : (
                      <div className="admin-order-detail-no-image">NO IMAGE</div>
                    )}
                  </div>

                  <div className="admin-order-detail-item-info">
                    <div className="admin-order-detail-badge-row">
                      <span className="admin-order-detail-item-no-badge">
                        주문상품 #{item.orderItemNo}
                      </span>
                      <span className="admin-order-detail-status-badge">
                        {getStatusLabel(item.orderItemStatus)}
                      </span>
                    </div>

                    <h3 className="admin-order-detail-item-name">
                      {item.itemName}
                    </h3>

                    <div className="admin-order-detail-info-grid">
                      <div className="admin-order-detail-info-item">
                        <span className="admin-order-detail-info-label">
                          옵션번호
                        </span>
                        <span className="admin-order-detail-info-value">
                          {item.productOptionNo ?? "-"}
                        </span>
                      </div>

                      <div className="admin-order-detail-info-item">
                        <span className="admin-order-detail-info-label">
                          옵션
                        </span>
                        <span className="admin-order-detail-info-value">
                          {item.optionColor || "-"} / {item.optionSize || "-"}
                        </span>
                      </div>

                      <div className="admin-order-detail-info-item">
                        <span className="admin-order-detail-info-label">
                          수량
                        </span>
                        <span className="admin-order-detail-info-value">
                          {item.quantity}개
                        </span>
                      </div>

                      <div className="admin-order-detail-info-item">
                        <span className="admin-order-detail-info-label">
                          단가
                        </span>
                        <span className="admin-order-detail-info-value">
                          {formatPrice(item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-order-detail-action-area">
                    <label className="admin-order-detail-select-label">
                      상태 변경
                    </label>
                    <select
                      value={item.orderItemStatus}
                      onChange={(e) =>
                        handleStatusChange(item.orderItemNo, e.target.value)
                      }
                      className="admin-order-detail-select-box"
                    >
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSave(item)}
                      className="admin-order-detail-save-button"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;