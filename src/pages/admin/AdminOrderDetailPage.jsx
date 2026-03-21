import AdminLayout from "../../components/admin/AdminLayout";
import { useParams } from "react-router-dom";
import { getAdminOrderItemList, updateAdminOrderItemStatus } from "../../api/admin/adminOrdersItemApi";
import { useEffect, useMemo, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import { API_SERVER_HOST } from "../../api/common/apiClient";

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
    <>
    
    <AdminHeader/>
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>주문번호</p>
            <p style={styles.summaryValue}>{orderNo}</p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>주문자명</p>
            <p style={styles.summaryValue}>{orderSummary.ordererName}</p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>주문일시</p>
            <p style={styles.summaryValue}>{orderSummary.createdAt}</p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>총 주문금액</p>
            <p style={styles.summaryValue}>{orderSummary.totalPrice}</p>
          </div>
        </div>

        <div style={styles.sectionBox}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>주문 상품 목록</h2>
            <span style={styles.itemCount}>총 {orderItems.length}개 상품</span>
          </div>

          {loading ? (
            <div style={styles.emptyBox}>불러오는 중...</div>
          ) : orderItems.length === 0 ? (
            <div style={styles.emptyBox}>주문 상품이 없습니다.</div>
          ) : (
            <div style={styles.cardList}>
              {orderItems.map((item) => (
                <div key={item.orderItemNo} style={styles.itemCard}>
                  <div style={styles.imageWrap}>
                    {item.imageUrl ? (
                      <img
                        src={getImageSrc(item.imageUrl)}
                        alt={item.itemName}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.noImage}>NO IMAGE</div>
                    )}
                  </div>

                  <div style={styles.itemInfo}>
                    <div style={styles.badgeRow}>
                      <span style={styles.itemNoBadge}>
                        주문상품 #{item.orderItemNo}
                      </span>
                      <span style={styles.statusBadge}>
                        {getStatusLabel(item.orderItemStatus)}
                      </span>
                    </div>

                    <h3 style={styles.itemName}>{item.itemName}</h3>

                    <div style={styles.infoGrid}>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>옵션번호</span>
                        <span style={styles.infoValue}>
                          {item.productOptionNo ?? "-"}
                        </span>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>옵션</span>
                        <span style={styles.infoValue}>
                          {item.optionColor || "-"} / {item.optionSize || "-"}
                        </span>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>수량</span>
                        <span style={styles.infoValue}>{item.quantity}개</span>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>단가</span>
                        <span style={styles.infoValue}>
                          {formatPrice(item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.actionArea}>
                    <label style={styles.selectLabel}>상태 변경</label>
                    <select
                      value={item.orderItemStatus}
                      onChange={(e) =>
                        handleStatusChange(item.orderItemNo, e.target.value)
                      }
                      style={styles.selectBox}
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
                      style={styles.saveButton}
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
  summaryRow: {
    display: "flex",
    gap: "14px",
    marginBottom: "20px",
    flexWrap: "nowrap",
    overflowX: "auto",
  },
  summaryCard: {
    flex: "1 1 0",
    minWidth: "220px",
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
    fontSize: "20px",
    fontWeight: 700,
    color: "#111111",
    wordBreak: "break-all",
  },
  sectionBox: {
    backgroundColor: "#ffffff",
    border: "1px solid #e8e8e8",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#111111",
  },
  itemCount: {
    fontSize: "13px",
    color: "#666666",
    backgroundColor: "#f5f5f5",
    borderRadius: "999px",
    padding: "8px 12px",
  },
  emptyBox: {
    border: "1px dashed #cfcfcf",
    borderRadius: "14px",
    padding: "40px 20px",
    textAlign: "center",
    color: "#666666",
    backgroundColor: "#fafafa",
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  itemCard: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 220px",
    gap: "18px",
    alignItems: "center",
    border: "1px solid #e7e7e7",
    borderRadius: "16px",
    padding: "18px",
    backgroundColor: "#ffffff",
  },
  imageWrap: {
    width: "120px",
    height: "120px",
    borderRadius: "14px",
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
    border: "1px solid #e4e4e4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  noImage: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#777777",
  },
  itemInfo: {
    minWidth: 0,
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  itemNoBadge: {
    backgroundColor: "#111111",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: "999px",
  },
  statusBadge: {
    backgroundColor: "#f2f2f2",
    color: "#111111",
    fontSize: "12px",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #dddddd",
  },
  itemName: {
    margin: "0 0 14px 0",
    fontSize: "20px",
    fontWeight: 800,
    color: "#111111",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    backgroundColor: "#fafafa",
    border: "1px solid #ededed",
    borderRadius: "12px",
    padding: "12px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#666666",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#111111",
    wordBreak: "break-word",
  },
  actionArea: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignSelf: "stretch",
    justifyContent: "center",
    paddingLeft: "8px",
  },
  selectLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#111111",
  },
  selectBox: {
    width: "100%",
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #cfcfcf",
    padding: "0 12px",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: "14px",
    outline: "none",
  },
  saveButton: {
    height: "44px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#111111",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default AdminOrderDetailPage;