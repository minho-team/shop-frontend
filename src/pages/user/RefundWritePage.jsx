import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/user/Footer";
import Header from "../../components/user/Header";
import { useMemo, useState } from "react";
import { createRefund } from "../../api/user/refundApi";
import { API_SERVER_HOST } from "../../api/common/apiClient";
import "../../css/user/RefundWritePage.css";

const REFUND_REASON_OPTIONS = [
  { value: "CHANGE_OF_MIND", label: "단순변심" },
  { value: "DEFECTIVE", label: "상품불량" },
  { value: "WRONG_ITEM", label: "오배송" },
  { value: "LATE_DELIVERY", label: "배송지연" },
  { value: "ETC", label: "기타" },
];

const getImageUrl = (url) => {
  if (!url) return "/default-product.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_SERVER_HOST}${url}`;
};

const RefundWritePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const refundTarget = location.state;

  const [form, setForm] = useState({
    refundReason: "CHANGE_OF_MIND",
    detailReason: "",
    refundQuantity: 1,
    bankName: "",
    bankCode: "",
    agreeYn: false,
  });

  const maxQuantity = refundTarget?.quantity || 1;
  const unitPrice = refundTarget?.unitPrice || 0;

  const refundAmount = useMemo(() => {
    return Number(form.refundQuantity) * Number(unitPrice);
  }, [form.refundQuantity, unitPrice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuantityChange = (e) => {
    let value = Number(e.target.value);

    if (Number.isNaN(value) || value < 1) value = 1;
    if (value > maxQuantity) value = maxQuantity;

    setForm((prev) => ({
      ...prev,
      refundQuantity: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!refundTarget) {
      alert("환불 대상 정보가 없습니다.");
      return;
    }

    if (!form.bankName.trim()) {
      alert("은행명을 입력해주세요.");
      return;
    }

    if (!form.bankCode.trim()) {
      alert("계좌번호를 입력해주세요.");
      return;
    }

    if (!form.agreeYn) {
      alert("환불 유의사항에 동의해주세요.");
      return;
    }

    const payload = {
      orderNo: refundTarget.orderNo,
      refundReason: `${form.refundReason}${form.detailReason ? ` - ${form.detailReason}` : ""}`,
      bankName: form.bankName,
      bankCode: form.bankCode || "000",
      items: [
        {
          orderItemNo: refundTarget.orderItemNo,
          refundQuantity: Number(form.refundQuantity),
          refundAmount: refundAmount,
        },
      ],
    };

    try {
      await createRefund(payload);
      alert("환불 신청이 완료되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("환불 신청 실패:", error);
      alert("환불 신청에 실패했습니다.");
    }
  };

  if (!refundTarget) {
    return (
      <>
        <Header />
        <div className="refund-page">
          <div className="refund-empty-box">
            <h2 className="refund-empty-title">환불 대상 정보가 없습니다.</h2>
            <p className="refund-empty-desc">
              주문 상세 페이지에서 환불하기 버튼을 눌러 진입해주세요.
            </p>
            <button className="refund-dark-button" onClick={() => navigate(-1)}>
              이전 페이지로
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="refund-page">
        <div className="refund-container">
          <div className="refund-hero-box">
            <p className="refund-hero-sub">REFUND REQUEST</p>
            <h1 className="refund-hero-title">환불 신청서</h1>
            <p className="refund-hero-desc">
              선택한 주문상품에 대해 환불 사유와 수량을 작성해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="refund-form-wrap">
            <div className="refund-section-box">
              <h2 className="refund-section-title">환불 대상 상품</h2>

              <div className="refund-product-card">
                <div className="refund-image-wrap">
                  <img
                    src={getImageUrl(refundTarget.imageUrl)}
                    alt={refundTarget.itemName}
                    className="refund-image"
                  />
                </div>

                <div className="refund-product-info">
                  <p className="refund-product-name">{refundTarget.itemName}</p>
                  <p className="refund-product-meta">
                    옵션: {refundTarget.itemColor || "-"} / {refundTarget.itemSize || "-"}
                  </p>
                  <p className="refund-product-meta">주문번호: {refundTarget.orderNo}</p>
                  <p className="refund-product-meta">주문상품번호: {refundTarget.orderItemNo}</p>
                  <p className="refund-product-meta">
                    주문상태: {refundTarget.orderStatus || "-"}
                  </p>
                </div>

                <div className="refund-price-box">
                  <p className="refund-price-label">주문금액</p>
                  <p className="refund-price-value">
                    {(Number(refundTarget.unitPrice) * Number(refundTarget.quantity)).toLocaleString()}원
                  </p>
                  <p className="refund-price-sub">
                    {Number(refundTarget.unitPrice).toLocaleString()}원 × {refundTarget.quantity}개
                  </p>
                </div>
              </div>
            </div>

            <div className="refund-section-box">
              <h2 className="refund-section-title">환불 정보 입력</h2>

              <div className="refund-form-grid refund-form-grid-2">
                <div className="refund-field-group">
                  <label className="refund-label">환불 사유</label>
                  <select
                    name="refundReason"
                    value={form.refundReason}
                    onChange={handleChange}
                    className="refund-select"
                  >
                    {REFUND_REASON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="refund-field-group">
                  <label className="refund-label">환불 수량</label>
                  <input
                    type="number"
                    min={1}
                    max={maxQuantity}
                    name="refundQuantity"
                    value={form.refundQuantity}
                    onChange={handleQuantityChange}
                    className="refund-input"
                  />
                  <p className="refund-helper-text">최대 환불 가능 수량: {maxQuantity}개</p>
                </div>

                <div className="refund-field-group">
                  <label className="refund-label">은행명</label>
                  <input
                    type="text"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    placeholder="예: 국민은행"
                    className="refund-input"
                  />
                </div>

                <div className="refund-field-group">
                  <label className="refund-label">계좌번호</label>
                  <input
                    type="text"
                    name="bankCode"
                    value={form.bankCode}
                    onChange={handleChange}
                    placeholder="계좌번호를 입력해주세요"
                    className="refund-input"
                  />
                </div>
              </div>

              <div className="refund-field-group">
                <label className="refund-label">상세 사유</label>
                <textarea
                  name="detailReason"
                  value={form.detailReason}
                  onChange={handleChange}
                  placeholder="상세 사유를 입력해주세요."
                  className="refund-textarea"
                />
              </div>
            </div>

            <div className="refund-section-box">
              <h2 className="refund-section-title">환불 예상 금액</h2>

              <div className="refund-amount-card">
                <div className="refund-amount-row">
                  <span className="refund-amount-label">선택 수량</span>
                  <span className="refund-amount-value">{form.refundQuantity}개</span>
                </div>
                <div className="refund-amount-row">
                  <span className="refund-amount-label">상품 단가</span>
                  <span className="refund-amount-value">
                    {Number(unitPrice).toLocaleString()}원
                  </span>
                </div>
                <div className="refund-amount-divider" />
                <div className="refund-amount-row">
                  <span className="refund-total-label">환불 예상 금액</span>
                  <span className="refund-total-value">
                    {refundAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            <div className="refund-section-box">
              <h2 className="refund-section-title">유의사항</h2>

              <ul className="refund-notice-list">
                <li>환불 신청 후 관리자 확인 절차가 진행될 수 있습니다.</li>
                <li>부분 환불 시 선택한 수량 기준으로 환불 금액이 계산됩니다.</li>
                <li>실제 환불 완료 금액은 검수 결과에 따라 달라질 수 있습니다.</li>
              </ul>

              <label className="refund-check-label">
                <input
                  type="checkbox"
                  name="agreeYn"
                  checked={form.agreeYn}
                  onChange={handleChange}
                />
                <span>위 내용을 확인했고 환불 신청에 동의합니다.</span>
              </label>
            </div>

            <div className="refund-button-row">
              <button
                type="button"
                className="refund-light-button"
                onClick={() => navigate(-1)}
              >
                취소
              </button>
              <button
                type="submit"
                className="refund-dark-button"
              >
                환불 신청하기
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RefundWritePage;