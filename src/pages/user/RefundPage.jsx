import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/user/Footer";
import Header from "../../components/user/Header";
import { useMemo, useState } from "react";
import { createRefund } from "../../api/user/refundApi";
import { API_SERVER_HOST } from "../../api/common/apiClient";

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

const RefundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const refundTarget = location.state;

  const [form, setForm] = useState({
    refundReason: "CHANGE_OF_MIND",
    detailReason: "",
    refundQuantity: 1,
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

  if (!form.agreeYn) {
    alert("환불 유의사항에 동의해주세요.");
    return;
  }

  const payload = {
    orderNo: refundTarget.orderNo,
    refundReason: `${form.refundReason}${form.detailReason ? ` - ${form.detailReason}` : ""}`,
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
        <div style={styles.page}>
          <div style={styles.emptyBox}>
            <h2 style={styles.emptyTitle}>환불 대상 정보가 없습니다.</h2>
            <p style={styles.emptyDesc}>
              주문 상세 페이지에서 환불하기 버튼을 눌러 진입해주세요.
            </p>
            <button style={styles.darkButton} onClick={() => navigate(-1)}>
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
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.heroBox}>
            <p style={styles.heroSub}>REFUND REQUEST</p>
            <h1 style={styles.heroTitle}>환불 신청서</h1>
            <p style={styles.heroDesc}>
              선택한 주문상품에 대해 환불 사유와 수량을 작성해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.formWrap}>
            <div style={styles.sectionBox}>
              <h2 style={styles.sectionTitle}>환불 대상 상품</h2>

              <div style={styles.productCard}>
                <div style={styles.imageWrap}>
                  <img
                    src={getImageUrl(refundTarget.imageUrl)}
                    alt={refundTarget.itemName}
                    style={styles.image}
                  />
                </div>

                <div style={styles.productInfo}>
                  <p style={styles.productName}>{refundTarget.itemName}</p>
                  <p style={styles.productMeta}>
                    옵션: {refundTarget.itemColor || "-"} / {refundTarget.itemSize || "-"}
                  </p>
                  <p style={styles.productMeta}>주문번호: {refundTarget.orderNo}</p>
                  <p style={styles.productMeta}>주문상품번호: {refundTarget.orderItemNo}</p>
                  <p style={styles.productMeta}>
                    주문상태: {refundTarget.orderStatus || "-"}
                  </p>
                </div>

                <div style={styles.priceBox}>
                  <p style={styles.priceLabel}>주문금액</p>
                  <p style={styles.priceValue}>
                    {(Number(refundTarget.unitPrice) * Number(refundTarget.quantity)).toLocaleString()}원
                  </p>
                  <p style={styles.priceSub}>
                    {Number(refundTarget.unitPrice).toLocaleString()}원 × {refundTarget.quantity}개
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.sectionBox}>
              <h2 style={styles.sectionTitle}>환불 정보 입력</h2>

              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>환불 사유</label>
                  <select
                    name="refundReason"
                    value={form.refundReason}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    {REFUND_REASON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>환불 수량</label>
                  <input
                    type="number"
                    min={1}
                    max={maxQuantity}
                    name="refundQuantity"
                    value={form.refundQuantity}
                    onChange={handleQuantityChange}
                    style={styles.input}
                  />
                  <p style={styles.helperText}>최대 환불 가능 수량: {maxQuantity}개</p>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>상세 사유</label>
                <textarea
                  name="detailReason"
                  value={form.detailReason}
                  onChange={handleChange}
                  placeholder="상세 사유를 입력해주세요."
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.sectionBox}>
              <h2 style={styles.sectionTitle}>환불 예상 금액</h2>

              <div style={styles.amountCard}>
                <div style={styles.amountRow}>
                  <span style={styles.amountLabel}>선택 수량</span>
                  <span style={styles.amountValue}>{form.refundQuantity}개</span>
                </div>
                <div style={styles.amountRow}>
                  <span style={styles.amountLabel}>상품 단가</span>
                  <span style={styles.amountValue}>
                    {Number(unitPrice).toLocaleString()}원
                  </span>
                </div>
                <div style={styles.amountDivider} />
                <div style={styles.amountRow}>
                  <span style={styles.totalLabel}>환불 예상 금액</span>
                  <span style={styles.totalValue}>
                    {refundAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.sectionBox}>
              <h2 style={styles.sectionTitle}>유의사항</h2>

              <ul style={styles.noticeList}>
                <li>환불 신청 후 관리자 확인 절차가 진행될 수 있습니다.</li>
                <li>부분 환불 시 선택한 수량 기준으로 환불 금액이 계산됩니다.</li>
                <li>실제 환불 완료 금액은 검수 결과에 따라 달라질 수 있습니다.</li>
              </ul>

              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  name="agreeYn"
                  checked={form.agreeYn}
                  onChange={handleChange}
                />
                <span>위 내용을 확인했고 환불 신청에 동의합니다.</span>
              </label>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                style={styles.lightButton}
                onClick={() => navigate(-1)}
              >
                취소
              </button>
              <button type="submit" style={styles.darkButton}>
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

const styles = {
  page: {
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    padding: "40px 20px 80px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  heroBox: {
    backgroundColor: "#111111",
    color: "#ffffff",
    borderRadius: "18px",
    padding: "32px",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  heroSub: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "1.8px",
    opacity: 0.8,
  },
  heroTitle: {
    margin: "10px 0 8px 0",
    fontSize: "32px",
    fontWeight: 800,
  },
  heroDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#d3d3d3",
  },
  formWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionBox: {
    backgroundColor: "#ffffff",
    border: "1px solid #e8e8e8",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    margin: "0 0 18px 0",
    fontSize: "22px",
    fontWeight: 800,
    color: "#111111",
  },
  productCard: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 220px",
    gap: "20px",
    alignItems: "center",
  },
  imageWrap: {
    width: "140px",
    height: "140px",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #e5e5e5",
    backgroundColor: "#f8f8f8",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  productInfo: {
    minWidth: 0,
  },
  productName: {
    margin: "0 0 12px 0",
    fontSize: "22px",
    fontWeight: 800,
    color: "#111111",
  },
  productMeta: {
    margin: "6px 0",
    fontSize: "14px",
    color: "#555555",
  },
  priceBox: {
    border: "1px solid #ececec",
    backgroundColor: "#fafafa",
    borderRadius: "14px",
    padding: "18px",
    textAlign: "right",
  },
  priceLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#666666",
  },
  priceValue: {
    margin: "10px 0 6px 0",
    fontSize: "24px",
    fontWeight: 800,
    color: "#111111",
  },
  priceSub: {
    margin: 0,
    fontSize: "13px",
    color: "#777777",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#111111",
  },
  input: {
    height: "46px",
    border: "1px solid #d8d8d8",
    borderRadius: "12px",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  select: {
    height: "46px",
    border: "1px solid #d8d8d8",
    borderRadius: "12px",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  textarea: {
    minHeight: "140px",
    border: "1px solid #d8d8d8",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  helperText: {
    margin: 0,
    fontSize: "12px",
    color: "#777777",
  },
  amountCard: {
    border: "1px solid #ececec",
    borderRadius: "16px",
    padding: "20px",
    backgroundColor: "#fcfcfc",
  },
  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  amountLabel: {
    fontSize: "14px",
    color: "#666666",
  },
  amountValue: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#111111",
  },
  amountDivider: {
    height: "1px",
    backgroundColor: "#e6e6e6",
    margin: "14px 0",
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#111111",
  },
  totalValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#111111",
  },
  noticeList: {
    margin: "0 0 18px 0",
    paddingLeft: "18px",
    color: "#444444",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111111",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  lightButton: {
    minWidth: "120px",
    height: "48px",
    borderRadius: "12px",
    border: "1px solid #d4d4d4",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  darkButton: {
    minWidth: "160px",
    height: "48px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#111111",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyBox: {
    maxWidth: "700px",
    margin: "80px auto",
    textAlign: "center",
    border: "1px solid #ececec",
    borderRadius: "18px",
    padding: "50px 24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  emptyTitle: {
    margin: "0 0 12px 0",
    fontSize: "28px",
    fontWeight: 800,
    color: "#111111",
  },
  emptyDesc: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    color: "#666666",
  },
};

export default RefundPage;