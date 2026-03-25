import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getAdminMemberDetail,
  getAdminMemberOrderPage,
  getAdminMemberInquiryPage,
  getAdminMemberCartItems,
  updateAdminMemberStatus,
  deleteAdminMember,
} from "../../api/admin/adminMemberApi";

// 상태 한글 / 뱃지
const STATUS_LABEL = { ACTIVE: "활성", DORMANT: "휴면", SUSPENDED: "정지" };
const STATUS_STYLE = {
  ACTIVE: { background: "#e8f5e9", color: "#2e7d32" },
  DORMANT: { background: "#fff8e1", color: "#f57f17" },
  SUSPENDED: { background: "#fce4ec", color: "#c62828" },
};

// 주문 상태 한글 / 뱃지
const ORDER_STATUS_LABEL = {
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELED: "취소됨",
};
const ORDER_STATUS_STYLE = {
  PAYMENT_COMPLETED: { background: "#e3f2fd", color: "#1565c0" },
  PREPARING: { background: "#fff8e1", color: "#f57f17" },
  SHIPPING: { background: "#e8f5e9", color: "#2e7d32" },
  DELIVERED: { background: "#ede7f6", color: "#4527a0" },
  CANCELED: { background: "#fce4ec", color: "#c62828" },
};

// 페이지 그룹 크기
const PAGE_GROUP = 5;

const AdminMemberDetailPage = () => {
  const { memberNo } = useParams();
  const navigate = useNavigate();

  // 기본 회원 상세 데이터
  const [detail, setDetail] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ── 주문 섹션 상태 ──
  const [orderList, setOrderList] = useState([]);
  const [orderTotalCount, setOrderTotalCount] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderExpandedMap, setOrderExpandedMap] = useState({});

  // ── 장바구니 섹션 상태 ──
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartExpandedMap, setCartExpandedMap] = useState({});

  // ── 문의 섹션 상태 ──
  const [inquiryList, setInquiryList] = useState([]);
  const [inqTotalCount, setInqTotalCount] = useState(0);
  const [inqTotalPages, setInqTotalPages] = useState(1);
  const [inqPage, setInqPage] = useState(1);
  const [inqLoading, setInqLoading] = useState(false);
  const [inqExpandedMap, setInqExpandedMap] = useState({});

  // ================================================
  // 페이지 진입 시 회원 상세 + 장바구니 조회
  // ================================================
  useEffect(() => {
    fetchDetail();
    fetchCartItems();
  }, [memberNo]);

  // 주문 페이지 변경 시 재조회
  useEffect(() => {
    fetchOrderPage(orderPage);
  }, [orderPage]);

  // 문의 페이지 변경 시 재조회
  useEffect(() => {
    fetchInquiryPage(inqPage);
  }, [inqPage]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await getAdminMemberDetail(memberNo);
      setDetail(data);
      setSelectedStatus(data.member.status);
    } catch (e) {
      console.error("회원 상세 조회 실패:", e);
      alert("회원 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderPage = async (page) => {
    setOrderLoading(true);
    try {
      const data = await getAdminMemberOrderPage(memberNo, { page, size: 5 });
      setOrderList(data.list);
      setOrderTotalCount(data.totalCount);
      setOrderTotalPages(data.totalPages);
      setOrderExpandedMap({});
    } catch (e) {
      console.error("주문 목록 조회 실패:", e);
    } finally {
      setOrderLoading(false);
    }
  };

  const fetchCartItems = async () => {
    setCartLoading(true);
    try {
      const data = await getAdminMemberCartItems(memberNo);
      setCartItems(data);
    } catch (e) {
      console.error("장바구니 조회 실패:", e);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchInquiryPage = async (page) => {
    setInqLoading(true);
    try {
      const data = await getAdminMemberInquiryPage(memberNo, { page, size: 5 });
      setInquiryList(data.list);
      setInqTotalCount(data.totalCount);
      setInqTotalPages(data.totalPages);
      setInqExpandedMap({});
    } catch (e) {
      console.error("문의 목록 조회 실패:", e);
    } finally {
      setInqLoading(false);
    }
  };

  // 접힘/펼침 토글
  const toggleOrder = (no) =>
    setOrderExpandedMap((p) => ({ ...p, [no]: !p[no] }));
  const toggleCart = (no) =>
    setCartExpandedMap((p) => ({ ...p, [no]: !p[no] }));
  const toggleInquiry = (no) =>
    setInqExpandedMap((p) => ({ ...p, [no]: !p[no] }));

  // 상태 변경
  const handleStatusChange = async () => {
    if (selectedStatus === detail.member.status) {
      alert("현재 상태와 동일합니다.");
      return;
    }
    if (
      !window.confirm(
        `상태를 [${STATUS_LABEL[selectedStatus]}]로 변경하시겠습니까?`,
      )
    )
      return;
    try {
      await updateAdminMemberStatus(memberNo, selectedStatus);
      alert("상태가 변경되었습니다.");
      fetchDetail();
    } catch (e) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  // 회원 삭제
  const handleDelete = async () => {
    if (
      !window.confirm(
        "정말로 이 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
      )
    )
      return;
    try {
      const msg = await deleteAdminMember(memberNo);
      alert(msg || "삭제되었습니다.");
      navigate("/admin/members");
    } catch (e) {
      alert(e.response?.data || "삭제 중 오류가 발생했습니다.");
    }
  };

  // 포맷 함수들
  const formatDate = (d) =>
    !d ? "-" : new Date(d).toLocaleDateString("ko-KR");
  const formatDateTime = (d) =>
    !d ? "-" : new Date(d).toLocaleString("ko-KR");
  const formatPrice = (n) => (!n ? "0원" : Number(n).toLocaleString() + "원");
  const formatPhone = (phone) => {
    if (!phone) return "-";
    const c = phone.replace(/-/g, "");
    return c.length === 11
      ? c.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
      : phone;
  };

  // 페이지 그룹 계산
  const orderGroup = Math.ceil(orderPage / PAGE_GROUP);
  const orderStartPage = (orderGroup - 1) * PAGE_GROUP + 1;
  const orderEndPage = Math.min(
    orderStartPage + PAGE_GROUP - 1,
    orderTotalPages,
  );

  const inqGroup = Math.ceil(inqPage / PAGE_GROUP);
  const inqStartPage = (inqGroup - 1) * PAGE_GROUP + 1;
  const inqEndPage = Math.min(inqStartPage + PAGE_GROUP - 1, inqTotalPages);

  if (loading)
    return (
      <AdminLayout pageTitle="회원 상세">
        <p style={{ textAlign: "center", padding: "60px", color: "#999" }}>
          로딩 중...
        </p>
      </AdminLayout>
    );
  if (!detail) return null;

  const { member } = detail;

  return (
    <>
      <AdminLayout pageTitle="회원 상세">
        {/* 상단 버튼 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <button onClick={() => navigate("/admin/members")} style={btnGray}>
            ← 목록으로
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate(`/admin/member/edit/${memberNo}`)}
              style={btnDark}
            >
              수정하기
            </button>
            <button onClick={handleDelete} style={btnRed}>
              삭제하기
            </button>
          </div>
        </div>

        {/* ── 기본 정보 ── */}
        <div style={card}>
          <h3 style={cardTitle}>기본 정보</h3>
          <div style={grid2}>
            <InfoRow label="회원번호" value={member.memberNo} />
            <InfoRow label="아이디" value={member.memberId} />
            <InfoRow label="이름" value={member.name} />
            <InfoRow label="닉네임" value={member.nickName} />
            <InfoRow label="이메일" value={member.email} />
            <InfoRow label="전화번호" value={formatPhone(member.phoneNumber)} />
            <InfoRow label="성별" value={member.gender || "-"} />
            <InfoRow label="생년월일" value={formatDate(member.birthday)} />
          </div>
        </div>

        {/* ── 주소 정보 ── */}
        <div style={card}>
          <h3 style={cardTitle}>주소 정보</h3>
          <div style={grid2}>
            <InfoRow label="우편번호" value={member.zipCode || "-"} />
            <InfoRow label="기본 주소" value={member.basicAddress || "-"} />
            <InfoRow label="상세 주소" value={member.detailAddress || "-"} />
          </div>
        </div>

        {/* ── 계좌 정보 ── */}
        <div style={card}>
          <h3 style={cardTitle}>계좌 정보</h3>
          <div style={grid2}>
            <InfoRow label="은행명" value={member.bankName || "-"} />
            <InfoRow label="계좌번호" value={member.bankCode || "-"} />
            <InfoRow label="예금주" value={member.accountHolderName || "-"} />
          </div>
        </div>

        {/* ── 활동 정보 ── */}
        <div style={card}>
          <h3 style={cardTitle}>활동 정보</h3>
          <div style={grid2}>
            <InfoRow label="가입일" value={formatDateTime(member.createdAt)} />
            <InfoRow label="구매 횟수" value={`${member.purchaseCount}회`} />
            <div
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={labelStyle}>현재 상태</span>
              <span
                style={{
                  padding: "3px 12px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  ...(STATUS_STYLE[member.status] || {}),
                }}
              >
                {STATUS_LABEL[member.status] || member.status}
              </span>
            </div>
          </div>
        </div>

        {/* ── 상태 변경 ── */}
        <div style={card}>
          <h3 style={cardTitle}>상태 변경</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "8px 14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="ACTIVE">활성 (ACTIVE)</option>
              <option value="DORMANT">휴면 (DORMANT)</option>
              <option value="SUSPENDED">정지 (SUSPENDED)</option>
            </select>
            <button onClick={handleStatusChange} style={btnDark}>
              변경 적용
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            ※ SUSPENDED(정지) 처리된 회원은 로그인이 제한됩니다.
          </p>
        </div>

        {/* ── 장바구니 현황 (접이식) ── */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "2px solid #222",
              paddingBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#222",
                margin: 0,
              }}
            >
              장바구니 현황
            </h3>
            <span style={{ fontSize: "13px", color: "#888" }}>
              총 {cartItems.length}종류
            </span>
          </div>

          {cartLoading ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#999" }}>
              로딩 중...
            </p>
          ) : cartItems.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa", padding: "16px 0" }}>
              장바구니가 비어있습니다.
            </p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemNo}
                style={{ borderBottom: "1px solid #eee" }}
              >
                {/* 요약 행 */}
                <div
                  onClick={() => toggleCart(item.cartItemNo)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 8px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = cartExpandedMap[
                      item.cartItemNo
                    ]
                      ? "#fafafa"
                      : "white")
                  }
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#aaa",
                      width: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {cartExpandedMap[item.cartItemNo] ? "▼" : "▶"}
                  </span>
                  {/* 상품명 */}
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#222",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.productName}
                  </span>
                  {/* 수량 */}
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {item.quantity}개
                  </span>
                  {/* 가격 */}
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#222",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {formatPrice(item.salePrice || item.price)}
                  </span>
                </div>

                {/* 펼쳐진 상세 */}
                {cartExpandedMap[item.cartItemNo] && (
                  <div
                    style={{
                      background: "#f9f9f9",
                      padding: "14px 24px",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "24px",
                        fontSize: "13px",
                        color: "#666",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        상품번호:{" "}
                        <b style={{ color: "#222" }}>{item.productNo}</b>
                      </span>
                      <span>
                        사이즈:{" "}
                        <b style={{ color: "#222" }}>
                          {item.optionSize || "-"}
                        </b>
                      </span>
                      <span>
                        색상:{" "}
                        <b style={{ color: "#222" }}>{item.color || "-"}</b>
                      </span>
                      <span>
                        수량: <b style={{ color: "#222" }}>{item.quantity}개</b>
                      </span>
                      <span>
                        정가:{" "}
                        <b style={{ color: "#222" }}>
                          {formatPrice(item.price)}
                        </b>
                      </span>
                      {item.salePrice && (
                        <span>
                          할인가:{" "}
                          <b style={{ color: "#c62828" }}>
                            {formatPrice(item.salePrice)}
                          </b>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── 주문 내역 (접이식 + 페이징) ── */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "2px solid #222",
              paddingBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#222",
                margin: 0,
              }}
            >
              주문 내역
            </h3>
            <span style={{ fontSize: "13px", color: "#888" }}>
              총 {orderTotalCount}건
            </span>
          </div>

          {orderLoading ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#999" }}>
              로딩 중...
            </p>
          ) : orderList.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa", padding: "16px 0" }}>
              주문 내역이 없습니다.
            </p>
          ) : (
            <>
              {orderList.map((order) => (
                <div
                  key={order.orderNo}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  {/* 요약 행 */}
                  <div
                    onClick={() => toggleOrder(order.orderNo)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 8px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = orderExpandedMap[
                        order.orderNo
                      ]
                        ? "#fafafa"
                        : "white")
                    }
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        width: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {orderExpandedMap[order.orderNo] ? "▼" : "▶"}
                    </span>
                    {/* 주문번호 */}
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#888",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      #{order.orderNo}
                    </span>
                    {/* 주문 상태 뱃지 */}
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        ...(ORDER_STATUS_STYLE[order.orderStatus] || {}),
                      }}
                    >
                      {ORDER_STATUS_LABEL[order.orderStatus] ||
                        order.orderStatus}
                    </span>
                    {/* 총금액 */}
                    <span
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        color: "#222",
                        fontWeight: "bold",
                      }}
                    >
                      {formatPrice(order.totalPrice)}
                    </span>
                    {/* 환불상태 */}
                    {order.refundStatus && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#c62828",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {order.refundStatus}
                      </span>
                    )}
                    {/* 주문일 */}
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* 펼쳐진 상세 */}
                  {orderExpandedMap[order.orderNo] && (
                    <div
                      style={{
                        background: "#f9f9f9",
                        padding: "14px 24px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          fontSize: "13px",
                          color: "#666",
                          flexWrap: "wrap",
                          marginBottom: "10px",
                        }}
                      >
                        <span>
                          주문자:{" "}
                          <b style={{ color: "#222" }}>{order.ordererName}</b>
                        </span>
                        <span>
                          주문일:{" "}
                          <b style={{ color: "#222" }}>
                            {formatDateTime(order.createdAt)}
                          </b>
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          fontSize: "13px",
                          color: "#666",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          수령자:{" "}
                          <b style={{ color: "#222" }}>{order.receiverName}</b>
                        </span>
                        <span>
                          연락처:{" "}
                          <b style={{ color: "#222" }}>
                            {formatPhone(order.receiverPhoneNumber)}
                          </b>
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginTop: "6px",
                        }}
                      >
                        배송지:{" "}
                        <b style={{ color: "#222" }}>
                          [{order.receiverZipCode}] {order.receiverBaseAddress}{" "}
                          {order.receiverDetailAddress}
                        </b>
                      </div>
                      {order.message && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            marginTop: "6px",
                          }}
                        >
                          배송 메시지:{" "}
                          <b style={{ color: "#222" }}>{order.message}</b>
                        </div>
                      )}
                      {/* 주문 상세 페이지 이동 버튼 */}
                      <button
                        onClick={() =>
                          navigate(`/admin/order/detail/${order.orderNo}`)
                        }
                        style={{
                          marginTop: "10px",
                          padding: "5px 14px",
                          fontSize: "12px",
                          background: "#222",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        주문 상세 보기
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* 주문 페이지네이션 */}
              {orderTotalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "16px",
                  }}
                >
                  <button
                    onClick={() => setOrderPage(orderStartPage - 1)}
                    disabled={orderStartPage === 1}
                    style={{
                      ...pageBtn,
                      color: orderStartPage === 1 ? "#ccc" : "#333",
                    }}
                  >
                    &lt;
                  </button>
                  {Array.from(
                    { length: orderEndPage - orderStartPage + 1 },
                    (_, i) => orderStartPage + i,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setOrderPage(p)}
                      style={{
                        ...pageBtn,
                        background: orderPage === p ? "#222" : "#fff",
                        color: orderPage === p ? "#fff" : "#333",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setOrderPage(orderEndPage + 1)}
                    disabled={orderEndPage === orderTotalPages}
                    style={{
                      ...pageBtn,
                      color: orderEndPage === orderTotalPages ? "#ccc" : "#333",
                    }}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 1:1 문의 내역 (접이식 + 페이징) ── */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "2px solid #222",
              paddingBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#222",
                margin: 0,
              }}
            >
              1:1 문의 내역
            </h3>
            <span style={{ fontSize: "13px", color: "#888" }}>
              총 {inqTotalCount}건
            </span>
          </div>

          {inqLoading ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#999" }}>
              로딩 중...
            </p>
          ) : inquiryList.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa", padding: "16px 0" }}>
              문의 내역이 없습니다.
            </p>
          ) : (
            <>
              {inquiryList.map((inq) => (
                <div
                  key={inq.inquiryNo}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  {/* 요약 행 */}
                  <div
                    onClick={() => toggleInquiry(inq.inquiryNo)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 8px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = inqExpandedMap[
                        inq.inquiryNo
                      ]
                        ? "#fafafa"
                        : "white")
                    }
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        width: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {inqExpandedMap[inq.inquiryNo] ? "▼" : "▶"}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        background: "#f0f0f0",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {inq.category}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#222",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {inq.title}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "2px 10px",
                        borderRadius: "10px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        background:
                          inq.status === "답변완료" ? "#e8f5e9" : "#fff3e0",
                        color:
                          inq.status === "답변완료" ? "#2e7d32" : "#e65100",
                      }}
                    >
                      {inq.status}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>

                  {/* 펼쳐진 상세 */}
                  {inqExpandedMap[inq.inquiryNo] && (
                    <div
                      style={{
                        background: "#f9f9f9",
                        padding: "16px 24px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          fontSize: "12px",
                          color: "#888",
                          marginBottom: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          문의번호:{" "}
                          <b style={{ color: "#444" }}>{inq.inquiryNo}</b>
                        </span>
                        <span>
                          카테고리:{" "}
                          <b style={{ color: "#444" }}>{inq.category}</b>
                        </span>
                        <span>
                          비밀글:{" "}
                          <b style={{ color: "#444" }}>
                            {inq.secretYn === "Y" ? "🔒 비밀글" : "공개"}
                          </b>
                        </span>
                        <span>
                          조회수:{" "}
                          <b style={{ color: "#444" }}>{inq.viewCount}</b>
                        </span>
                        <span>
                          등록일:{" "}
                          <b style={{ color: "#444" }}>
                            {formatDateTime(inq.createdAt)}
                          </b>
                        </span>
                        {inq.updatedAt && (
                          <span>
                            수정일:{" "}
                            <b style={{ color: "#444" }}>
                              {formatDateTime(inq.updatedAt)}
                            </b>
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#333",
                          lineHeight: "1.8",
                          whiteSpace: "pre-wrap",
                          background: "#fff",
                          padding: "12px",
                          borderRadius: "4px",
                          border: "1px solid #eee",
                        }}
                      >
                        {inq.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 문의 페이지네이션 */}
              {inqTotalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "16px",
                  }}
                >
                  <button
                    onClick={() => setInqPage(inqStartPage - 1)}
                    disabled={inqStartPage === 1}
                    style={{
                      ...pageBtn,
                      color: inqStartPage === 1 ? "#ccc" : "#333",
                    }}
                  >
                    &lt;
                  </button>
                  {Array.from(
                    { length: inqEndPage - inqStartPage + 1 },
                    (_, i) => inqStartPage + i,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setInqPage(p)}
                      style={{
                        ...pageBtn,
                        background: inqPage === p ? "#222" : "#fff",
                        color: inqPage === p ? "#fff" : "#333",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setInqPage(inqEndPage + 1)}
                    disabled={inqEndPage === inqTotalPages}
                    style={{
                      ...pageBtn,
                      color: inqEndPage === inqTotalPages ? "#ccc" : "#333",
                    }}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

// 정보 행 컴포넌트
const InfoRow = ({ label, value }) => (
  <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
    <span style={labelStyle}>{label}</span>
    <span style={{ fontSize: "14px", color: "#222" }}>{value}</span>
  </div>
);

// 공통 스타일
const card = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: "8px",
  padding: "20px 24px",
  marginBottom: "16px",
};
const cardTitle = {
  fontSize: "15px",
  fontWeight: "bold",
  marginBottom: "16px",
  color: "#222",
  borderBottom: "2px solid #222",
  paddingBottom: "8px",
};
const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 40px",
};
const labelStyle = {
  display: "inline-block",
  width: "120px",
  fontSize: "13px",
  color: "#888",
  fontWeight: "bold",
};
const th = {
  padding: "10px 12px",
  fontWeight: "bold",
  textAlign: "center",
  borderBottom: "1px solid #ddd",
};
const td = {
  padding: "10px 12px",
  textAlign: "center",
  borderBottom: "1px solid #f0f0f0",
};
const btnGray = {
  padding: "8px 18px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  background: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};
const btnDark = {
  padding: "8px 18px",
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
};
const btnRed = {
  padding: "8px 18px",
  background: "#c62828",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
};
const pageBtn = {
  padding: "6px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  background: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};

export default AdminMemberDetailPage;
