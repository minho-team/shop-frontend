import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import {
    getAdminMemberDetail,
    getAdminMemberOrderPage,
    getAdminMemberInquiryPage,
    getAdminMemberCartItems,
    updateAdminMemberStatus,
    getAdminMemberMemos,
    addAdminMemberMemo,
    deleteAdminMemberMemo,
    getAdminMemberCoupons,
    getAdminAllCouponList,
    createAdminCoupon,
    issueAdminMemberCoupon,
} from "../../api/admin/adminMemberApi";

const STATUS_LABEL = { ACTIVE: "활성", DORMANT: "휴면", SUSPENDED: "정지" };
const STATUS_STYLE = {
    ACTIVE: { background: "#e8f5e9", color: "#2e7d32" },
    DORMANT: { background: "#fff8e1", color: "#f57f17" },
    SUSPENDED: { background: "#fce4ec", color: "#c62828" },
};
const PROVIDER_LABEL = { LOCAL: "일반 가입", KAKAO: "카카오 로그인" };
const PROVIDER_STYLE = {
    LOCAL: { background: "#f5f5f5", color: "#444" },
    KAKAO: { background: "#fff9c4", color: "#e65100" },
};
const ORDER_STATUS_LABEL = {
    PENDING_PAYMENT: "결제대기", PAYMENT_COMPLETED: "결제완료",
    PREPARING: "상품준비중", SHIPPING: "배송중",
    DELIVERED: "배송완료", CANCELED: "취소됨",
};
const ORDER_STATUS_STYLE = {
    PENDING_PAYMENT: { background: "#f5f5f5", color: "#888" },
    PAYMENT_COMPLETED: { background: "#e3f2fd", color: "#1565c0" },
    PREPARING: { background: "#fff8e1", color: "#f57f17" },
    SHIPPING: { background: "#e8f5e9", color: "#2e7d32" },
    DELIVERED: { background: "#ede7f6", color: "#4527a0" },
    CANCELED: { background: "#fce4ec", color: "#c62828" },
};

const PAGE_SIZE = 5;
const PAGE_GROUP = 5;

// 페이지네이션 컴포넌트
const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const group = Math.ceil(page / PAGE_GROUP);
    const startPage = (group - 1) * PAGE_GROUP + 1;
    const endPage = Math.min(startPage + PAGE_GROUP - 1, totalPages);
    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
            {group > 1 && <button style={pageBtn} onClick={() => onPageChange(startPage - 1)}>◀</button>}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
                <button key={p} style={{ ...pageBtn, background: p === page ? "#222" : "#fff", color: p === page ? "#fff" : "#222" }}
                    onClick={() => onPageChange(p)}>{p}</button>
            ))}
            {endPage < totalPages && <button style={pageBtn} onClick={() => onPageChange(endPage + 1)}>▶</button>}
        </div>
    );
};

const AdminMemberDetailPage = () => {
    const { memberNo } = useParams();
    const navigate = useNavigate();

    // 기본 상태
    const [detail, setDetail] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(false);

    // 주문 상태 (서버 페이징)
    const [orderList, setOrderList] = useState([]);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderExpandedMap, setOrderExpandedMap] = useState({});

    // 장바구니 상태 (클라이언트 페이징)
    const [cartItems, setCartItems] = useState([]);
    const [cartPage, setCartPage] = useState(1);
    const [cartLoading, setCartLoading] = useState(false);

    // 문의 상태 (서버 페이징)
    const [inquiryList, setInquiryList] = useState([]);
    const [inqTotalPages, setInqTotalPages] = useState(1);
    const [inqPage, setInqPage] = useState(1);
    const [inqLoading, setInqLoading] = useState(false);
    const [inqExpandedMap, setInqExpandedMap] = useState({});

    // 메모 상태 (클라이언트 페이징)
    const [memos, setMemos] = useState([]);
    const [memoPage, setMemoPage] = useState(1);
    const [memoContent, setMemoContent] = useState("");

    // 쿠폰 상태 (클라이언트 페이징)
    const [coupons, setCoupons] = useState([]);
    const [couponPage, setCouponPage] = useState(1);
    const [couponMasterList, setCouponMasterList] = useState([]);
    const [selectedCouponNo, setSelectedCouponNo] = useState("");
    const [validDays, setValidDays] = useState(30);

    // 쿠폰 생성 폼 상태
    const [newCoupon, setNewCoupon] = useState({
        couponName: "",
        discountType: "RATE",
        discountValue: "",
    });

    // 초기 로드
    useEffect(() => {
        fetchDetail();
        fetchCartItems();
        fetchMemos();
        fetchCoupons();
        fetchCouponMasterList();
    }, [memberNo]);

    useEffect(() => { fetchOrderPage(orderPage); }, [orderPage]);
    useEffect(() => { fetchInquiryPage(inqPage); }, [inqPage]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await getAdminMemberDetail(memberNo);
            setDetail(data);
            setSelectedStatus(data.member.status);
        } catch (e) {
            alert("회원 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderPage = async (page) => {
        setOrderLoading(true);
        try {
            const data = await getAdminMemberOrderPage(memberNo, { page, size: PAGE_SIZE });
            setOrderList(data.list);
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
            const data = await getAdminMemberInquiryPage(memberNo, { page, size: PAGE_SIZE });
            setInquiryList(data.list);
            setInqTotalPages(data.totalPages);
            setInqExpandedMap({});
        } catch (e) {
            console.error("문의 목록 조회 실패:", e);
        } finally {
            setInqLoading(false);
        }
    };

    const fetchMemos = async () => {
        try {
            const data = await getAdminMemberMemos(memberNo);
            setMemos(data);
        } catch (e) {
            console.error("메모 조회 실패:", e);
        }
    };

    const fetchCoupons = async () => {
        try {
            const data = await getAdminMemberCoupons(memberNo);
            setCoupons(data);
        } catch (e) {
            console.error("쿠폰 조회 실패:", e);
        }
    };

    const fetchCouponMasterList = async () => {
        try {
            const data = await getAdminAllCouponList();
            setCouponMasterList(data);
        } catch (e) {
            console.error("쿠폰 마스터 목록 조회 실패:", e);
        }
    };

    const handleAddMemo = async () => {
        if (!memoContent.trim()) return;
        try {
            await addAdminMemberMemo({ memberNo: Number(memberNo), content: memoContent });
            setMemoContent("");
            setMemoPage(1);
            fetchMemos();
        } catch (e) {
            alert("메모 등록에 실패했습니다.");
        }
    };

    const handleDeleteMemo = async (memoNo) => {
        if (!window.confirm("메모를 삭제하시겠습니까?")) return;
        try {
            await deleteAdminMemberMemo(memoNo);
            fetchMemos();
        } catch (e) {
            alert("메모 삭제 실패");
        }
    };

    // 쿠폰 생성
    const handleCreateCoupon = async () => {
        if (!newCoupon.couponName.trim()) { alert("쿠폰명을 입력해주세요."); return; }
        if (!newCoupon.discountValue || Number(newCoupon.discountValue) <= 0) { alert("할인 값을 입력해주세요."); return; }
        if (newCoupon.discountType === "RATE" && Number(newCoupon.discountValue) > 100) { alert("비율 할인은 1~100 사이로 입력해주세요."); return; }
        try {
            await createAdminCoupon({
                couponName: newCoupon.couponName,
                discountType: newCoupon.discountType,
                discountValue: Number(newCoupon.discountValue),
            });
            alert("쿠폰이 생성되었습니다.");
            setNewCoupon({ couponName: "", discountType: "RATE", discountValue: "" });
            fetchCouponMasterList();
        } catch (e) {
            alert("쿠폰 생성에 실패했습니다.");
        }
    };

    // 쿠폰 발급
    const handleIssueCoupon = async () => {
        if (!selectedCouponNo) { alert("발급할 쿠폰을 선택해주세요."); return; }
        if (!window.confirm(`선택한 쿠폰을 ${validDays}일 유효기간으로 발급하시겠습니까?`)) return;
        try {
            await issueAdminMemberCoupon(memberNo, selectedCouponNo, validDays);
            alert("쿠폰이 발급되었습니다.");
            setSelectedCouponNo("");
            setCouponPage(1);
            fetchCoupons();
        } catch (e) {
            alert("쿠폰 발급에 실패했습니다.");
        }
    };

    const handleStatusChange = async () => {
        if (selectedStatus === detail.member.status) { alert("현재 상태와 동일합니다."); return; }
        if (!window.confirm(`상태를 [${STATUS_LABEL[selectedStatus]}]로 변경하시겠습니까?`)) return;
        try {
            await updateAdminMemberStatus(memberNo, selectedStatus);
            alert("상태가 변경되었습니다.");
            fetchDetail();
        } catch (e) {
            alert("상태 변경에 실패했습니다.");
        }
    };

    const toggleOrder = (no) => setOrderExpandedMap((p) => ({ ...p, [no]: !p[no] }));
    const toggleInquiry = (no) => setInqExpandedMap((p) => ({ ...p, [no]: !p[no] }));

    const formatDate = (d) => (!d ? "-" : new Date(d).toLocaleDateString("ko-KR"));
    const formatDateTime = (d) => (!d ? "-" : new Date(d).toLocaleString("ko-KR"));
    const formatPrice = (n) => (!n && n !== 0 ? "-" : Number(n).toLocaleString() + "원");
    const formatPhone = (phone) => {
        if (!phone) return "-";
        const c = phone.replace(/-/g, "");
        return c.length === 11 ? c.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") : phone;
    };

    // 클라이언트 페이징 유틸
    const paginate = (list, page) => list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = (list) => Math.max(1, Math.ceil(list.length / PAGE_SIZE));

    if (loading) return (
        <><AdminHeader /><AdminLayout pageTitle="회원 상세">
            <p style={{ textAlign: "center", padding: "60px", color: "#999" }}>로딩 중...</p>
        </AdminLayout></>
    );
    if (!detail) return null;

    const { member } = detail;

    // 클라이언트 페이징 적용
    const pagedMemos = paginate(memos, memoPage);
    const pagedCart = paginate(cartItems, cartPage);
    const pagedCoupons = paginate(coupons, couponPage);

    return (
        <>
            <AdminHeader />
            <AdminLayout pageTitle="회원 상세">

                {/* 상단 버튼 - 삭제하기 제거 */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                    <button onClick={() => navigate("/admin/members")} style={btnGray}>← 목록으로</button>
                    <button onClick={() => navigate(`/admin/member/edit/${memberNo}`)} style={btnDark}>수정하기</button>
                </div>

                {/* 기본 정보 */}
                <div style={card}>
                    <h3 style={cardTitle}>기본 정보</h3>
                    <div style={grid2}>
                        <InfoRow label="회원번호" value={member.memberNo} />
                        <InfoRow label="아이디" value={member.memberId} />
                        <InfoRow label="이름" value={member.name || "-"} />
                        <InfoRow label="닉네임" value={member.nickName || "-"} />
                        <InfoRow label="이메일" value={member.email || "-"} />
                        <InfoRow label="전화번호" value={formatPhone(member.phoneNumber)} />
                        <InfoRow label="성별" value={member.gender || "-"} />
                        <InfoRow label="생년월일" value={formatDate(member.birthday)} />
                        <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
                            <span style={labelStyle}>가입경로</span>
                            <span style={{ padding: "3px 12px", borderRadius: "12px", fontSize: "13px", ...(PROVIDER_STYLE[member.provider] || {}) }}>
                                {PROVIDER_LABEL[member.provider] || member.provider || "-"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 주소 정보 */}
                <div style={card}>
                    <h3 style={cardTitle}>주소 정보</h3>
                    <div style={grid2}>
                        <InfoRow label="우편번호" value={member.zipCode || "-"} />
                        <InfoRow label="기본 주소" value={member.basicAddress || "-"} />
                        <InfoRow label="상세 주소" value={member.detailAddress || "-"} />
                    </div>
                </div>

                {/* 활동 정보 + 상태 변경 */}
                <div style={card}>
                    <h3 style={cardTitle}>활동 정보</h3>
                    <div style={grid2}>
                        <InfoRow label="가입일" value={formatDateTime(member.createdAt)} />
                        <InfoRow label="구매 횟수" value={`${member.purchaseCount}회`} />
                        <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
                            <span style={labelStyle}>현재 상태</span>
                            <span style={{ padding: "3px 12px", borderRadius: "12px", fontSize: "13px", ...(STATUS_STYLE[member.status] || {}) }}>
                                {STATUS_LABEL[member.status] || member.status}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
                        <span style={labelStyle}>상태 변경</span>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }}>
                            <option value="ACTIVE">활성</option>
                            <option value="DORMANT">휴면</option>
                            <option value="SUSPENDED">정지</option>
                        </select>
                        <button onClick={handleStatusChange} style={btnDark}>변경 적용</button>
                    </div>
                </div>

                {/* 관리자 메모 */}
                <div style={card}>
                    <h3 style={cardTitle}>관리자 전용 메모 ({memos.length}개)</h3>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                        <input type="text" value={memoContent}
                            onChange={(e) => setMemoContent(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddMemo()}
                            placeholder="회원에 대한 특이사항을 기록하세요."
                            style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }} />
                        <button onClick={handleAddMemo} style={btnDark}>등록</button>
                    </div>
                    {memos.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#aaa" }}>등록된 메모가 없습니다.</p>
                    ) : (
                        <>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {pagedMemos.map(memo => (
                                    <li key={memo.memoNo} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                                        <div>
                                            <span style={{ fontSize: "14px", color: "#333" }}>{memo.content}</span>
                                            <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "12px" }}>{formatDateTime(memo.createdAt)}</span>
                                        </div>
                                        <button onClick={() => handleDeleteMemo(memo.memoNo)}
                                            style={{ border: "none", background: "none", color: "#ff4d4f", cursor: "pointer", fontSize: "12px" }}>삭제</button>
                                    </li>
                                ))}
                            </ul>
                            <Pagination page={memoPage} totalPages={totalPages(memos)} onPageChange={setMemoPage} />
                        </>
                    )}
                </div>

                {/* 쿠폰 생성 */}
                <div style={card}>
                    <h3 style={cardTitle}>쿠폰 생성</h3>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <input type="text" value={newCoupon.couponName}
                            onChange={(e) => setNewCoupon({ ...newCoupon, couponName: e.target.value })}
                            placeholder="쿠폰명 입력"
                            style={{ flex: 2, minWidth: "160px", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }} />
                        <select value={newCoupon.discountType}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }}>
                            <option value="RATE">비율 (%)</option>
                            <option value="FIXED">고정 금액 (원)</option>
                        </select>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <input type="number" value={newCoupon.discountValue}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                placeholder={newCoupon.discountType === "RATE" ? "1~100" : "금액"}
                                min="1" max={newCoupon.discountType === "RATE" ? "100" : undefined}
                                style={{ width: "90px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }} />
                            <span style={{ fontSize: "13px", color: "#666" }}>{newCoupon.discountType === "RATE" ? "%" : "원"}</span>
                        </div>
                        <button onClick={handleCreateCoupon} style={btnDark}>쿠폰 생성</button>
                    </div>
                </div>

                {/* 쿠폰 발급 */}
                <div style={card}>
                    <h3 style={cardTitle}>쿠폰 발급</h3>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <select value={selectedCouponNo} onChange={(e) => setSelectedCouponNo(e.target.value)}
                            style={{ flex: 1, minWidth: "200px", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }}>
                            <option value="">발급할 쿠폰을 선택하세요</option>
                            {couponMasterList.map(c => (
                                <option key={c.couponNo} value={c.couponNo}>
                                    {c.couponName} ({c.discountType === "RATE" ? `${c.discountValue}%` : `${Number(c.discountValue).toLocaleString()}원`} 할인)
                                </option>
                            ))}
                        </select>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "13px", color: "#666" }}>유효기간</span>
                            <input type="number" value={validDays} onChange={(e) => setValidDays(Number(e.target.value))}
                                min="1" style={{ width: "70px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }} />
                            <span style={{ fontSize: "13px", color: "#666" }}>일</span>
                        </div>
                        <button onClick={handleIssueCoupon} style={btnDark}>발급</button>
                    </div>
                </div>

                {/* 보유 쿠폰 내역 */}
                <div style={card}>
                    <h3 style={cardTitle}>보유 쿠폰 내역 ({coupons.length}개)</h3>
                    {coupons.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#aaa" }}>보유 중인 쿠폰이 없습니다.</p>
                    ) : (
                        <>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
                                        <th style={th}>쿠폰명</th>
                                        <th style={{ ...th, textAlign: "center" }}>할인 혜택</th>
                                        <th style={{ ...th, textAlign: "center" }}>사용 여부</th>
                                        <th style={{ ...th, textAlign: "right" }}>유효기간</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedCoupons.map(cp => (
                                        <tr key={cp.memberCouponNo} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={td}>{cp.couponName}</td>
                                            <td style={{ ...td, textAlign: "center" }}>
                                                {cp.discountType === "RATE"
                                                    ? `${cp.discountValue}% 할인`
                                                    : `${Number(cp.discountValue).toLocaleString()}원 할인`}
                                            </td>
                                            <td style={{ ...td, textAlign: "center" }}>
                                                <span style={{
                                                    padding: "2px 8px", borderRadius: "10px", fontSize: "11px",
                                                    background: cp.usedYn === "Y" ? "#eee" : "#e3f2fd",
                                                    color: cp.usedYn === "Y" ? "#999" : "#1565c0",
                                                }}>
                                                    {cp.usedYn === "Y" ? "사용완료" : "미사용"}
                                                </span>
                                            </td>
                                            <td style={{ ...td, textAlign: "right", color: "#888" }}>
                                                {cp.endAt ? `${formatDate(cp.startAt)} ~ ${formatDate(cp.endAt)}` : "무기한"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination page={couponPage} totalPages={totalPages(coupons)} onPageChange={setCouponPage} />
                        </>
                    )}
                </div>

                {/* 장바구니 */}
                <div style={card}>
                    <h3 style={cardTitle}>장바구니 현황 ({cartItems.length}개)</h3>
                    {cartLoading ? (
                        <p style={{ color: "#aaa", fontSize: "13px" }}>로딩 중...</p>
                    ) : cartItems.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#aaa" }}>장바구니에 담긴 상품이 없습니다.</p>
                    ) : (
                        <>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
                                        <th style={th}>상품명</th>
                                        <th style={{ ...th, textAlign: "center" }}>색상</th>
                                        <th style={{ ...th, textAlign: "center" }}>사이즈</th>
                                        <th style={{ ...th, textAlign: "center" }}>수량</th>
                                        <th style={{ ...th, textAlign: "right" }}>가격</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedCart.map(item => (
                                        <tr key={item.cartItemNo} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={td}>{item.productName}</td>
                                            <td style={{ ...td, textAlign: "center" }}>{item.color || "-"}</td>
                                            <td style={{ ...td, textAlign: "center" }}>{item.optionSize || "-"}</td>
                                            <td style={{ ...td, textAlign: "center" }}>{item.quantity}</td>
                                            <td style={{ ...td, textAlign: "right" }}>
                                                {item.discountRate > 0 ? (
                                                    <>
                                                        <span style={{ textDecoration: "line-through", color: "#aaa", marginRight: "6px" }}>
                                                            {formatPrice(item.price)}
                                                        </span>
                                                        {formatPrice(Math.floor(item.price * (1 - item.discountRate / 100)))}
                                                    </>
                                                ) : formatPrice(item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination page={cartPage} totalPages={totalPages(cartItems)} onPageChange={setCartPage} />
                        </>
                    )}
                </div>

                {/* 주문 내역 */}
                <div style={card}>
                    <h3 style={cardTitle}>주문 내역</h3>
                    {orderLoading ? (
                        <p style={{ color: "#aaa", fontSize: "13px" }}>로딩 중...</p>
                    ) : orderList.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#aaa" }}>주문 내역이 없습니다.</p>
                    ) : (
                        <>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
                                        <th style={th}>주문번호</th>
                                        <th style={th}>주문자</th>
                                        <th style={{ ...th, textAlign: "center" }}>상태</th>
                                        <th style={{ ...th, textAlign: "right" }}>금액</th>
                                        <th style={{ ...th, textAlign: "right" }}>주문일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderList.map(order => (
                                        <>
                                            <tr key={order.orderNo}
                                                onClick={() => toggleOrder(order.orderNo)}
                                                style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
                                                <td style={td}>{order.orderNo}</td>
                                                <td style={td}>{order.ordererName}</td>
                                                <td style={{ ...td, textAlign: "center" }}>
                                                    <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", ...(ORDER_STATUS_STYLE[order.orderStatus] || {}) }}>
                                                        {ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus}
                                                    </span>
                                                </td>
                                                <td style={{ ...td, textAlign: "right" }}>{formatPrice(order.totalPrice)}</td>
                                                <td style={{ ...td, textAlign: "right", color: "#888" }}>{formatDate(order.createdAt)}</td>
                                            </tr>
                                            {orderExpandedMap[order.orderNo] && (
                                                <tr key={`order-detail-${order.orderNo}`}>
                                                    <td colSpan={5} style={{ padding: "12px 16px", background: "#fafafa", fontSize: "13px", borderBottom: "1px solid #eee" }}>
                                                        <strong>수령인:</strong> {order.receiverName} / <strong>연락처:</strong> {order.receiverPhoneNumber}<br />
                                                        <strong>배송지:</strong> {order.receiverBaseAddress} {order.receiverDetailAddress}<br />
                                                        {order.message && <><strong>배송메모:</strong> {order.message}</>}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination page={orderPage} totalPages={orderTotalPages} onPageChange={setOrderPage} />
                        </>
                    )}
                </div>

                {/* 1:1 문의 내역 */}
                <div style={card}>
                    <h3 style={cardTitle}>1:1 문의 내역</h3>
                    {inqLoading ? (
                        <p style={{ color: "#aaa", fontSize: "13px" }}>로딩 중...</p>
                    ) : inquiryList.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#aaa" }}>문의 내역이 없습니다.</p>
                    ) : (
                        <>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
                                        <th style={th}>제목</th>
                                        <th style={{ ...th, textAlign: "center" }}>카테고리</th>
                                        <th style={{ ...th, textAlign: "center" }}>상태</th>
                                        <th style={{ ...th, textAlign: "right" }}>작성일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inquiryList.map(inq => (
                                        <>
                                            <tr key={inq.inquiryNo}
                                                onClick={() => toggleInquiry(inq.inquiryNo)}
                                                style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
                                                <td style={td}>{inq.title}</td>
                                                <td style={{ ...td, textAlign: "center" }}>{inq.category || "-"}</td>
                                                <td style={{ ...td, textAlign: "center" }}>
                                                    <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", background: "#f0f0f0", color: "#555" }}>
                                                        {inq.status}
                                                    </span>
                                                </td>
                                                <td style={{ ...td, textAlign: "right", color: "#888" }}>{formatDate(inq.createdAt)}</td>
                                            </tr>
                                            {inqExpandedMap[inq.inquiryNo] && (
                                                <tr key={`inq-detail-${inq.inquiryNo}`}>
                                                    <td colSpan={4} style={{ padding: "12px 16px", background: "#fafafa", fontSize: "13px", color: "#444", borderBottom: "1px solid #eee" }}>
                                                        {inq.content}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination page={inqPage} totalPages={inqTotalPages} onPageChange={setInqPage} />
                        </>
                    )}
                </div>

            </AdminLayout>
        </>
    );
};

const InfoRow = ({ label, value }) => (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
        <span style={labelStyle}>{label}</span>
        <span style={{ fontSize: "14px", color: "#222" }}>{value}</span>
    </div>
);

const card = { background: "#fff", border: "1px solid #eee", borderRadius: "8px", padding: "20px 24px", marginBottom: "16px" };
const cardTitle = { fontSize: "15px", fontWeight: "bold", marginBottom: "16px", color: "#222", borderBottom: "2px solid #222", paddingBottom: "8px" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" };
const labelStyle = { display: "inline-block", width: "120px", fontSize: "13px", color: "#888", fontWeight: "bold" };
const btnGray = { padding: "8px 18px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer", fontSize: "14px" };
const btnDark = { padding: "8px 18px", background: "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" };
const pageBtn = { padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer", fontSize: "13px" };
const th = { padding: "10px", textAlign: "left", fontWeight: "bold", color: "#555" };
const td = { padding: "10px", color: "#333" };

export default AdminMemberDetailPage;