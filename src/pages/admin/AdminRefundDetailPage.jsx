import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminRefundDetail,
  updateAdminRefundStatus,
} from "../../api/admin/adminRefundApi";
import "../../css/admin/AdminRefundDetail.css";

const statusLabelMap = {
  REQUESTED: "환불요청",
  APPROVED: "승인완료",
  REJECTED: "거절",
  COMPLETED: "환불완료",
};

const refundReasonLabelMap = {
  CHANGE_OF_MIND: "단순변심",
  DEFECTIVE: "상품불량",
  WRONG_ITEM: "오배송",
  LATE_DELIVERY: "배송지연",
  ETC: "기타",
};

const AdminRefundDetailPage = () => {
  const { refundNo } = useParams();
  const navigate = useNavigate();

  const [refundDetail, setRefundDetail] = useState(null);
  const [refundStatus, setRefundStatus] = useState("REQUESTED");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRefundDetail = async () => {
    try {
      setLoading(true);
      const data = await getAdminRefundDetail(refundNo);
      setRefundDetail(data);
      setRefundStatus(data.refundStatus || "REQUESTED");
    } catch (error) {
      console.error("환불 상세 조회 실패:", error);
      alert("환불 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundDetail();
  }, [refundNo]);

  const handleSaveStatus = async () => {
    try {
      setSaving(true);
      const result = await updateAdminRefundStatus(refundNo, refundStatus);
      alert(result.message || "환불 상태가 변경되었습니다.");
      fetchRefundDetail();
    } catch (error) {
      console.error("환불 상태 변경 실패:", error);
      alert("환불 상태 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const getRefundReasonLabel = (reason) => {
    if (!reason || !String(reason).trim()) {
      return "환불 사유가 없습니다.";
    }

    const reasonText = String(reason).trim();

    if (!reasonText.includes(" - ")) {
      return refundReasonLabelMap[reasonText] || reasonText;
    }

    const [reasonCode, ...restParts] = reasonText.split(" - ");
    const reasonDetail = restParts.join(" - ").trim();
    const reasonLabel = refundReasonLabelMap[reasonCode] || reasonCode;

    return reasonDetail ? `${reasonLabel} - ${reasonDetail}` : reasonLabel;
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <AdminLayout>
          <div className="admin-refund-detail-page">불러오는 중...</div>
        </AdminLayout>
      </>
    );
  }

  if (!refundDetail) {
    return (
      <>
        <AdminHeader />
        <AdminLayout>
          <div className="admin-refund-detail-page">환불 정보를 찾을 수 없습니다.</div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <AdminLayout>
        <div className="admin-refund-detail-page">
          <div className="detail-top">
            <div>
              <h2>환불 상세</h2>
            </div>
            <button className="back-btn" onClick={() => navigate("/admin/orders/refunds")}>
              목록으로
            </button>
          </div>

          <div className="detail-card">
            <div className="detail-grid">
              <div>
                <span className="label">환불번호</span>
                <strong>{refundDetail.refundNo}</strong>
              </div>
              <div>
                <span className="label">주문번호</span>
                <strong>{refundDetail.orderNo}</strong>
              </div>
              <div>
                <span className="label">회원ID</span>
                <strong>{refundDetail.memberId}</strong>
              </div>
              <div>
                <span className="label">은행명</span>
                <strong>{refundDetail.bankName}</strong>
              </div>
              <div>
                <span className="label">계좌번호</span>
                <strong>{refundDetail.bankCode}</strong>
              </div>

              <div>
                <span className="label">회원명</span>
                <strong>{refundDetail.name}</strong>
              </div>
              <div>
                <span className="label">요청일시</span>
                <strong>
                  {refundDetail.requestedAt?.replace("T", " ").slice(0, 16)}
                </strong>
              </div>
              <div>
                <span className="label">총 환불금액</span>
                <strong>
                  {Number(refundDetail.totalRefundAmount).toLocaleString()}원
                </strong>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>환불 사유</h3>
            <div className="refund-reason-box">
              {getRefundReasonLabel(refundDetail.refundReason)}
            </div>
          </div>

          <div className="detail-card">
            <h3>환불 상품</h3>
            <table className="refund-item-table">
              <thead>
                <tr>
                  <th>주문상품번호</th>
                  <th>상품명</th>
                  <th>옵션</th>
                  <th>환불수량</th>
                  <th>환불금액</th>
                  <th>상품 환불상태</th>
                </tr>
              </thead>
              <tbody>
                {refundDetail.items?.map((item) => (
                  <tr key={item.refundItemNo}>
                    <td>{item.orderItemNo}</td>
                    <td>{item.itemName}</td>
                    <td>
                      {item.itemColor} / {item.itemSize}
                    </td>
                    <td>{item.refundQuantity}</td>
                    <td>{Number(item.refundAmount).toLocaleString()}원</td>
                    <td>
                      {statusLabelMap[item.refundItemStatus] || item.refundItemStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-card">
            <h3>환불 상태 변경</h3>
            <div className="status-edit-box">
              <select
                value={refundStatus}
                onChange={(e) => setRefundStatus(e.target.value)}
              >
                <option value="REQUESTED">환불요청</option>
                <option value="APPROVED">승인완료</option>
                <option value="REJECTED">거절</option>
                <option value="COMPLETED">환불완료</option>
              </select>

              <button onClick={handleSaveStatus} disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>

            <p className="status-guide">
              현재 헤더 상태:{" "}
              <strong>
                {statusLabelMap[refundDetail.refundStatus] || refundDetail.refundStatus}
              </strong>
            </p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminRefundDetailPage;