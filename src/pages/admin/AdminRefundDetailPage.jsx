import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  callDecideRefund,
  getAdminRefundDetail,
} from "../../api/admin/adminRefundApi";
import "../../css/admin/AdminRefundDetail.css";

const statusLabelMap = {
  REQUESTED: "환불요청",
  APPROVED: "승인완료",
  REJECTED: "거절",
  COMPLETED: "환불완료",
  REFUND_FAILED: "환불실패"
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
  const [loading, setLoading] = useState(false);

  const fetchRefundDetail = async () => {
    try {
      setLoading(true);
      const data = await getAdminRefundDetail(refundNo);
      setRefundDetail(data);
    } catch (error) {
      console.error("환불 상세 조회 실패:", error);
      alert("환불 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const decideRefund = async (refundNo, status) => {

    //확인을 누르면 isConfirm에 true가 들어감
    const isConfirm = window.confirm(
      status === 'APPROVED' ? '승인하시겠습니까?' : '거절하시겠습니까?'
    );

    //취소 눌렀으면 그냥 함수 종료
    if (!isConfirm) return;


    const data = await callDecideRefund(refundNo, status);

    await fetchRefundDetail();
  }

  useEffect(() => {
    fetchRefundDetail();
  }, [refundNo]);


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


  //거절이나 완료가 된 상태라면(환불처리가 끝난 상태라면 true)
const isFinished =
  refundDetail?.refundStatus === 'COMPLETED' ||
  refundDetail?.refundStatus === 'REJECTED';


  if (loading) {
    return (
      <>
        <AdminLayout pageTitle="환불 상세">
          <div className="admin-refund-detail-page">불러오는 중...</div>
        </AdminLayout>
      </>
    );
  }

  if (!refundDetail) {
    return (
      <>
        <AdminLayout pageTitle="환불 상세">
          <div className="admin-refund-detail-page">
            환불 정보를 찾을 수 없습니다.
          </div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <AdminLayout pageTitle="환불 상세">
        <div className="admin-refund-detail-page">
          <div className="detail-top">
            <div>
              <h2>환불 상세</h2>
              <p>주문번호 {refundDetail.orderNo}</p>
            </div>
            <button
              className="back-btn"
              onClick={() => navigate("/admin/orders/refunds")}
            >
              목록으로
            </button>
          </div>

          <div className="detail-card">
            <div className="detail-grid">
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
                      {statusLabelMap[item.refundItemStatus] ||
                        item.refundItemStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



          {!isFinished &&
            <div className="detail-card">
              <h3>환불 의사 결정</h3>
              <div className="status-edit-box">
                <button onClick={() => decideRefund(refundNo, 'APPROVED')}> 승인 </button>
                <button onClick={() => decideRefund(refundNo, 'REJECTED')}> 거절 </button>
              </div>
            </div>
          }




        </div>
      </AdminLayout>
    </>
  );
};

export default AdminRefundDetailPage;
