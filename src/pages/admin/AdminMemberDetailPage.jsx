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
    deleteAdminMember,
    getAdminMemberLoginHistory,
    insertAdminMemo,
    getAdminMemos,
    deleteAdminMemo,
    insertAdminPoint,
    getAdminPointBalance,
    getAdminPointPage,
    insertAdminCoupon,
    getAdminCoupons,
    updateAdminCouponDeleteYn,
    deleteAdminCoupon,
    issueCouponToMember,
    getAdminMemberCoupons,
    deleteAdminMemberCoupon,
    expireAdminMemberCoupon,
} from "../../api/admin/adminMemberApi";

// 회원 상태 한글 라벨
const STATUS_LABEL = { ACTIVE: "활성", DORMANT: "휴면", SUSPENDED: "정지" };

// 회원 상태별 뱃지 색상
const STATUS_STYLE = {
    ACTIVE: { background: "#e8f5e9", color: "#2e7d32" },
    DORMANT: { background: "#fff8e1", color: "#f57f17" },
    SUSPENDED: { background: "#fce4ec", color: "#c62828" },
};

// 주문 상태 한글 라벨
const ORDER_STATUS_LABEL = {
    PAYMENT_COMPLETED: "결제완료",
    PREPARING: "상품준비중",
    SHIPPING: "배송중",
    DELIVERED: "배송완료",
    CANCELED: "취소됨",
};

// 주문 상태별 뱃지 색상
const ORDER_STATUS_STYLE = {
    PAYMENT_COMPLETED: { background: "#e3f2fd", color: "#1565c0" },
    PREPARING: { background: "#fff8e1", color: "#f57f17" },
    SHIPPING: { background: "#e8f5e9", color: "#2e7d32" },
    DELIVERED: { background: "#ede7f6", color: "#4527a0" },
    CANCELED: { background: "#fce4ec", color: "#c62828" },
};

// 포인트 타입 한글 라벨
const POINT_TYPE_LABEL = {
    EARN: "적립",         // 주문 완료 시 자동 적립 또는 관리자 수동 적립
    USE: "사용",         // 주문 시 포인트 사용 차감
    EXPIRE: "만료",         // 유효기간 만료로 잔액 전체 소멸
    ADMIN: "관리자조정",   // 관리자가 직접 지급/차감
};

// 페이지네이션 그룹 크기 (한 번에 보여줄 페이지 번호 개수)
const PAGE_GROUP = 5;
// 관리자 메모 페이지당 표시 개수
const MEMO_SIZE = 5;
// 전체 쿠폰 목록 / 회원 보유 쿠폰 페이지당 표시 개수
const COUPON_SIZE = 5;

const AdminMemberDetailPage = () => {
    const { memberNo } = useParams(); // URL에서 회원번호 추출
    const navigate = useNavigate();

    // ── 회원 기본 정보 ──
    const [detail, setDetail] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(false);

    // ── 주문 내역 ──
    const [orderList, setOrderList] = useState([]);
    const [orderTotalCount, setOrderTotalCount] = useState(0);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderExpandedMap, setOrderExpandedMap] = useState({});

    // ── 장바구니 ──
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartExpandedMap, setCartExpandedMap] = useState({});

    // ── 1:1 문의 ──
    const [inquiryList, setInquiryList] = useState([]);
    const [inqTotalCount, setInqTotalCount] = useState(0);
    const [inqTotalPages, setInqTotalPages] = useState(1);
    const [inqPage, setInqPage] = useState(1);
    const [inqLoading, setInqLoading] = useState(false);
    const [inqExpandedMap, setInqExpandedMap] = useState({});

    // ── 로그인 이력 ──
    const [loginHistoryList, setLoginHistoryList] = useState([]);
    const [loginHistoryTotalCount, setLoginHistoryTotalCount] = useState(0);
    const [loginHistoryTotalPages, setLoginHistoryTotalPages] = useState(1);
    const [loginHistoryPage, setLoginHistoryPage] = useState(1);
    const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);

    // ── 관리자 메모 (전체 로드 후 클라이언트 사이드 5개씩 페이징) ──
    const [memoList, setMemoList] = useState([]);
    const [memoLoading, setMemoLoading] = useState(false);
    const [memoInput, setMemoInput] = useState("");
    const [memoPage, setMemoPage] = useState(1); // 클라이언트 사이드 페이지

    // ── 포인트 ──
    const [pointBalance, setPointBalance] = useState(0);   // 현재 잔액 (DB에서 SUM으로 계산)
    const [pointList, setPointList] = useState([]);
    const [pointTotalCount, setPointTotalCount] = useState(0);
    const [pointTotalPages, setPointTotalPages] = useState(1);
    const [pointPage, setPointPage] = useState(1);
    const [pointLoading, setPointLoading] = useState(false);
    const [pointInput, setPointInput] = useState("");       // 양수=지급, 음수=차감
    const [pointType, setPointType] = useState("ADMIN");

    // ── 쿠폰 ──
    const [allCoupons, setAllCoupons] = useState([]);           // 전체 쿠폰 목록 (발급 선택용)
    const [memberCoupons, setMemberCoupons] = useState([]);     // 이 회원이 보유한 쿠폰
    const [couponLoading, setCouponLoading] = useState(false);
    const [selectedCouponNo, setSelectedCouponNo] = useState(""); // 발급할 쿠폰 선택값
    // 발급 시 유효기간 입력 (쿠폰 생성 시가 아닌 발급 시 지정)
    const [issuanceStartAt, setIssuanceStartAt] = useState(""); // 발급 유효 시작일
    const [issuanceEndAt, setIssuanceEndAt] = useState(""); // 발급 유효 종료일
    // 쿠폰 생성 폼 초기값 (날짜 없음 - 발급 시 지정하는 방식)
    const [couponForm, setCouponForm] = useState({
        couponName: "",
        discountType: "RATE",  // RATE(비율%) / FIXED(고정금액)
        discountValue: "",
    });
    const [allCouponPage, setAllCouponPage] = useState(1); // 전체 쿠폰 클라이언트 페이지
    const [memberCouponPage, setMemberCouponPage] = useState(1); // 회원 보유 쿠폰 클라이언트 페이지

    // 페이지 진입 시 최초 데이터 로딩
    useEffect(() => {
        fetchDetail();
        fetchCartItems();
        fetchMemos();
        fetchPointBalance();
        fetchAllCoupons();
        fetchMemberCoupons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberNo]);

    // 각 섹션 페이지 변경 시 재조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchOrderPage(orderPage); }, [orderPage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchInquiryPage(inqPage); }, [inqPage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchLoginHistoryPage(loginHistoryPage); }, [loginHistoryPage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchPointPage(pointPage); }, [pointPage]);

    // 회원 기본 정보 조회
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

    // 주문 내역 페이징 조회
    const fetchOrderPage = async (page) => {
        setOrderLoading(true);
        try {
            const data = await getAdminMemberOrderPage(memberNo, { page, size: 5 });
            setOrderList(data.list);
            setOrderTotalCount(data.totalCount);
            setOrderTotalPages(data.totalPages);
            setOrderExpandedMap({});
        } catch (e) { console.error("주문 목록 조회 실패:", e); }
        finally { setOrderLoading(false); }
    };

    // 장바구니 조회
    const fetchCartItems = async () => {
        setCartLoading(true);
        try {
            const data = await getAdminMemberCartItems(memberNo);
            setCartItems(data);
        } catch (e) { console.error("장바구니 조회 실패:", e); }
        finally { setCartLoading(false); }
    };

    // 문의 내역 페이징 조회
    const fetchInquiryPage = async (page) => {
        setInqLoading(true);
        try {
            const data = await getAdminMemberInquiryPage(memberNo, { page, size: 5 });
            setInquiryList(data.list);
            setInqTotalCount(data.totalCount);
            setInqTotalPages(data.totalPages);
            setInqExpandedMap({});
        } catch (e) { console.error("문의 목록 조회 실패:", e); }
        finally { setInqLoading(false); }
    };

    // 로그인 이력 페이징 조회
    const fetchLoginHistoryPage = async (page) => {
        setLoginHistoryLoading(true);
        try {
            const data = await getAdminMemberLoginHistory(memberNo, { page, size: 10 });
            setLoginHistoryList(data.list);
            setLoginHistoryTotalCount(data.totalCount);
            setLoginHistoryTotalPages(data.totalPages);
        } catch (e) { console.error("로그인 이력 조회 실패:", e); }
        finally { setLoginHistoryLoading(false); }
    };

    // 관리자 메모 전체 조회 (클라이언트 사이드 페이징)
    const fetchMemos = async () => {
        setMemoLoading(true);
        try {
            const data = await getAdminMemos(memberNo);
            setMemoList(data);
            setMemoPage(1); // 새로 조회 시 첫 페이지로
        } catch (e) { console.error("메모 조회 실패:", e); }
        finally { setMemoLoading(false); }
    };

    // 포인트 잔액 조회 (DB에서 SUM으로 계산된 값)
    const fetchPointBalance = async () => {
        try {
            const data = await getAdminPointBalance(memberNo);
            setPointBalance(data);
        } catch (e) { console.error("포인트 잔액 조회 실패:", e); }
    };

    // 포인트 이력 페이징 조회 (5개씩)
    const fetchPointPage = async (page) => {
        setPointLoading(true);
        try {
            const data = await getAdminPointPage(memberNo, { page, size: 5 });
            setPointList(data.list);
            setPointTotalCount(data.totalCount);
            setPointTotalPages(data.totalPages);
        } catch (e) { console.error("포인트 이력 조회 실패:", e); }
        finally { setPointLoading(false); }
    };

    // 전체 쿠폰 목록 조회 (발급 select에 표시할 목록)
    const fetchAllCoupons = async () => {
        try {
            const data = await getAdminCoupons();
            setAllCoupons(data);
            setAllCouponPage(1); // 새로 조회 시 첫 페이지로
        } catch (e) { console.error("쿠폰 목록 조회 실패:", e); }
    };

    // 이 회원이 보유한 쿠폰 목록 조회
    const fetchMemberCoupons = async () => {
        setCouponLoading(true);
        try {
            const data = await getAdminMemberCoupons(memberNo);
            setMemberCoupons(data);
            setMemberCouponPage(1); // 새로 조회 시 첫 페이지로
        } catch (e) { console.error("회원 쿠폰 조회 실패:", e); }
        finally { setCouponLoading(false); }
    };

    // 포인트 지급/차감/만료 처리
    const handleInsertPoint = async () => {
        // EXPIRE(만료)는 숫자 입력 없이 현재 잔액 전체를 한번에 소멸
        if (pointType === "EXPIRE") {
            if (pointBalance <= 0) { alert("차감할 포인트 잔액이 없습니다."); return; }
            if (!window.confirm(`현재 잔액 ${pointBalance.toLocaleString()}P 전체를 만료 처리하시겠습니까?`)) return;
            try {
                await insertAdminPoint(memberNo, -pointBalance, "EXPIRE");
                fetchPointBalance();
                fetchPointPage(1);
                setPointPage(1);
            } catch (e) { alert("포인트 처리에 실패했습니다."); }
            return;
        }

        // EARN / USE / ADMIN 은 숫자 직접 입력
        const pointValue = parseInt(pointInput);
        if (!pointInput || isNaN(pointValue)) { alert("포인트를 숫자로 입력해주세요."); return; }
        if (pointValue === 0) { alert("0은 입력할 수 없습니다."); return; }

        // USE(사용)는 양수로 입력해도 자동으로 음수 변환하여 차감 처리
        const finalPoint = pointType === "USE" ? -Math.abs(pointValue) : pointValue;

        // 차감 시 잔액 부족 체크 (USE, ADMIN 음수 입력 모두 해당)
        if (finalPoint < 0 && pointBalance <= 0) {
            alert("잔액이 없어 차감할 수 없습니다.");
            return;
        }
        if (finalPoint < 0 && Math.abs(finalPoint) > pointBalance) {
            alert(`잔액이 부족합니다.\n현재 잔액: ${pointBalance.toLocaleString()}P`);
            return;
        }
        const label = finalPoint > 0 ? `${finalPoint}P 지급` : `${Math.abs(finalPoint)}P 차감`;
        if (!window.confirm(`${label} 하시겠습니까?`)) return;
        try {
            await insertAdminPoint(memberNo, finalPoint, pointType);
            setPointInput("");
            fetchPointBalance();
            fetchPointPage(1);
            setPointPage(1);
        } catch (e) { alert("포인트 처리에 실패했습니다."); }
    };

    // 관리자 메모 저장
    const handleInsertMemo = async () => {
        if (!memoInput.trim()) { alert("메모 내용을 입력해주세요."); return; }
        try {
            await insertAdminMemo(memberNo, memoInput);
            setMemoInput("");
            fetchMemos();
        } catch (e) { alert("메모 저장에 실패했습니다."); }
    };

    // 관리자 메모 삭제
    const handleDeleteMemo = async (memoNo) => {
        if (!window.confirm("메모를 삭제하시겠습니까?")) return;
        try {
            await deleteAdminMemo(memoNo);
            fetchMemos();
        } catch (e) { alert("메모 삭제에 실패했습니다."); }
    };

    // 쿠폰 생성 (날짜 없음 - 발급 시 지정하는 방식으로 변경)
    const handleInsertCoupon = async () => {
        if (!couponForm.couponName.trim()) { alert("쿠폰 이름을 입력해주세요."); return; }
        if (!couponForm.discountValue) { alert("할인 값을 입력해주세요."); return; }
        if (!window.confirm("쿠폰을 생성하시겠습니까?")) return;
        try {
            await insertAdminCoupon({
                couponName: couponForm.couponName,
                discountType: couponForm.discountType,
                discountValue: parseInt(couponForm.discountValue),
            });
            alert("쿠폰이 생성되었습니다.");
            setCouponForm({ couponName: "", discountType: "RATE", discountValue: "" });
            fetchAllCoupons();
        } catch (e) { alert("쿠폰 생성에 실패했습니다."); }
    };

    // 쿠폰 소프트 삭제 여부 토글 (delete_yn, N=정상 Y=삭제)
    const handleToggleCouponDeleteYn = async (couponNo, currentDeleteYn) => {
        const nextDeleteYn = currentDeleteYn === "N" ? "Y" : "N";
        const label = nextDeleteYn === "N" ? "활성화" : "비활성화";
        if (!window.confirm(`쿠폰을 ${label}하시겠습니까?`)) return;
        try {
            await updateAdminCouponDeleteYn(couponNo, nextDeleteYn);
            fetchAllCoupons();
        } catch (e) { alert("쿠폰 상태 변경에 실패했습니다."); }
    };

    // 쿠폰 삭제 (발급된 쿠폰이 있으면 실패)
    const handleDeleteCoupon = async (couponNo) => {
        if (!window.confirm("쿠폰을 삭제하시겠습니까?\n이미 발급된 쿠폰이 있으면 삭제할 수 없습니다.")) return;
        try {
            await deleteAdminCoupon(couponNo);
            alert("삭제되었습니다.");
            fetchAllCoupons();
        } catch (e) {
            alert(e.response?.data || "쿠폰 삭제에 실패했습니다.");
        }
    };

    // 이 회원에게 쿠폰 발급
    // 유효기간(startAt/endAt)은 발급 시 지정 (쿠폰 생성 시가 아닌 발급 시 결정)
    const handleIssueCoupon = async () => {
        if (!selectedCouponNo) { alert("발급할 쿠폰을 선택해주세요."); return; }
        if (!window.confirm("선택한 쿠폰을 발급하시겠습니까?")) return;
        try {
            await issueCouponToMember(
                memberNo,
                parseInt(selectedCouponNo),
                // date 타입 입력값을 LocalDateTime 형식으로 변환하여 전송
                issuanceStartAt ? `${issuanceStartAt}T00:00:00` : null,
                issuanceEndAt ? `${issuanceEndAt}T23:59:59` : null,
            );
            alert("쿠폰이 발급되었습니다.");
            setSelectedCouponNo("");
            setIssuanceStartAt("");
            setIssuanceEndAt("");
            fetchMemberCoupons();
        } catch (e) { alert("쿠폰 발급에 실패했습니다."); }
    };

    // 회원 보유 쿠폰 삭제
    const handleDeleteMemberCoupon = async (memberCouponNo) => {
        if (!window.confirm("회원의 쿠폰을 삭제하시겠습니까?")) return;
        try {
            await deleteAdminMemberCoupon(memberCouponNo);
            fetchMemberCoupons();
        } catch (e) { alert("쿠폰 삭제에 실패했습니다."); }
    };

    // 회원 보유 쿠폰 만료 처리
    const handleExpireMemberCoupon = async (memberCouponNo) => {
        if (!window.confirm("쿠폰을 만료 처리하시겠습니까?")) return;
        try {
            await expireAdminMemberCoupon(memberCouponNo);
            fetchMemberCoupons();
        } catch (e) { alert("쿠폰 만료 처리에 실패했습니다."); }
    };

    // 주문/장바구니/문의 행 접힘/펼침 토글
    const toggleOrder = (no) => setOrderExpandedMap((p) => ({ ...p, [no]: !p[no] }));
    const toggleCart = (no) => setCartExpandedMap((p) => ({ ...p, [no]: !p[no] }));
    const toggleInquiry = (no) => setInqExpandedMap((p) => ({ ...p, [no]: !p[no] }));

    // 회원 상태 변경
    const handleStatusChange = async () => {
        if (selectedStatus === detail.member.status) { alert("현재 상태와 동일합니다."); return; }
        if (!window.confirm(`상태를 [${STATUS_LABEL[selectedStatus]}]로 변경하시겠습니까?`)) return;
        try {
            await updateAdminMemberStatus(memberNo, selectedStatus);
            alert("상태가 변경되었습니다.");
            fetchDetail();
        } catch (e) { alert("상태 변경에 실패했습니다."); }
    };

    // 회원 삭제 (하드 딜리트 - 주문 내역 있으면 FK 제약으로 실패)
    const handleDelete = async () => {
        if (!window.confirm("정말로 이 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;
        try {
            const msg = await deleteAdminMember(memberNo);
            alert(msg || "삭제되었습니다.");
            navigate("/admin/members");
        } catch (e) {
            alert(e.response?.data || "삭제 중 오류가 발생했습니다.");
        }
    };

    // 날짜/금액/포인트/전화번호 포맷 함수
    const formatDate = (d) => (!d ? "-" : new Date(d).toLocaleDateString("ko-KR"));
    const formatDateTime = (d) => (!d ? "-" : new Date(d).toLocaleString("ko-KR"));
    const formatPrice = (n) => (!n ? "0원" : Number(n).toLocaleString() + "원");
    const formatPoint = (n) => (n > 0 ? `+${n.toLocaleString()}P` : `${n.toLocaleString()}P`);
    const formatPhone = (phone) => {
        if (!phone) return "-";
        const c = phone.replace(/-/g, "");
        return c.length === 11 ? c.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") : phone;
    };

    // 페이지 그룹 계산
    const orderGroup = Math.ceil(orderPage / PAGE_GROUP);
    const orderStart = (orderGroup - 1) * PAGE_GROUP + 1;
    const orderEnd = Math.min(orderStart + PAGE_GROUP - 1, orderTotalPages);

    const inqGroup = Math.ceil(inqPage / PAGE_GROUP);
    const inqStart = (inqGroup - 1) * PAGE_GROUP + 1;
    const inqEnd = Math.min(inqStart + PAGE_GROUP - 1, inqTotalPages);

    const lhGroup = Math.ceil(loginHistoryPage / PAGE_GROUP);
    const lhStart = (lhGroup - 1) * PAGE_GROUP + 1;
    const lhEnd = Math.min(lhStart + PAGE_GROUP - 1, loginHistoryTotalPages);

    const ptGroup = Math.ceil(pointPage / PAGE_GROUP);
    const ptStart = (ptGroup - 1) * PAGE_GROUP + 1;
    const ptEnd = Math.min(ptStart + PAGE_GROUP - 1, pointTotalPages);

    // 관리자 메모 클라이언트 사이드 페이징 계산
    const memoTotalPages = Math.max(1, Math.ceil(memoList.length / MEMO_SIZE));
    const pagedMemoList = memoList.slice((memoPage - 1) * MEMO_SIZE, memoPage * MEMO_SIZE);
    const memoGroup = Math.ceil(memoPage / PAGE_GROUP);
    const memoGroupStart = (memoGroup - 1) * PAGE_GROUP + 1;
    const memoGroupEnd = Math.min(memoGroupStart + PAGE_GROUP - 1, memoTotalPages);

    // 전체 쿠폰 목록 클라이언트 사이드 페이징 계산
    const allCouponTotalPages = Math.max(1, Math.ceil(allCoupons.length / COUPON_SIZE));
    const pagedAllCoupons = allCoupons.slice((allCouponPage - 1) * COUPON_SIZE, allCouponPage * COUPON_SIZE);
    const acGroup = Math.ceil(allCouponPage / PAGE_GROUP);
    const acGroupStart = (acGroup - 1) * PAGE_GROUP + 1;
    const acGroupEnd = Math.min(acGroupStart + PAGE_GROUP - 1, allCouponTotalPages);

    // 회원 보유 쿠폰 클라이언트 사이드 페이징 계산
    const memberCouponTotalPages = Math.max(1, Math.ceil(memberCoupons.length / COUPON_SIZE));
    const pagedMemberCoupons = memberCoupons.slice((memberCouponPage - 1) * COUPON_SIZE, memberCouponPage * COUPON_SIZE);
    const mcGroup = Math.ceil(memberCouponPage / PAGE_GROUP);
    const mcGroupStart = (mcGroup - 1) * PAGE_GROUP + 1;
    const mcGroupEnd = Math.min(mcGroupStart + PAGE_GROUP - 1, memberCouponTotalPages);

    if (loading) return (
        <><AdminHeader /><AdminLayout pageTitle="회원 상세">
            <p style={{ textAlign: "center", padding: "60px", color: "#999" }}>로딩 중...</p>
        </AdminLayout></>
    );
    if (!detail) return null;

    const { member } = detail;

    return (
        <>
            <AdminHeader />
            <AdminLayout pageTitle="회원 상세">

                {/* 상단 버튼 - 목록으로 / 수정하기 / 삭제하기 */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                    <button onClick={() => navigate("/admin/members")} style={btnGray}>← 목록으로</button>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => navigate(`/admin/member/edit/${memberNo}`)} style={btnDark}>수정하기</button>
                        <button onClick={handleDelete} style={btnRed}>삭제하기</button>
                    </div>
                </div>

                {/* 기본 정보 */}
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

                {/* 주소 정보 */}
                <div style={card}>
                    <h3 style={cardTitle}>주소 정보</h3>
                    <div style={grid2}>
                        <InfoRow label="우편번호" value={member.zipCode || "-"} />
                        <InfoRow label="기본 주소" value={member.basicAddress || "-"} />
                        <InfoRow label="상세 주소" value={member.detailAddress || "-"} />
                    </div>
                </div>

                {/* 계좌 정보 */}
                <div style={card}>
                    <h3 style={cardTitle}>계좌 정보</h3>
                    <div style={grid2}>
                        <InfoRow label="은행명" value={member.bankName || "-"} />
                        <InfoRow label="계좌번호" value={member.bankCode || "-"} />
                        <InfoRow label="예금주" value={member.accountHolderName || "-"} />
                    </div>
                </div>

                {/* 활동 정보 */}
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
                </div>

                {/* 상태 변경 */}
                <div style={card}>
                    <h3 style={cardTitle}>상태 변경</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}>
                            <option value="ACTIVE">활성 (ACTIVE)</option>
                            <option value="DORMANT">휴면 (DORMANT)</option>
                            <option value="SUSPENDED">정지 (SUSPENDED)</option>
                        </select>
                        <button onClick={handleStatusChange} style={btnDark}>변경 적용</button>
                    </div>
                    <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                        ※ SUSPENDED(정지) 처리된 회원은 로그인이 제한됩니다.
                    </p>
                </div>

                {/* 장바구니 현황 - 클릭 시 상세 옵션 펼침 */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <h3 style={sectionTitle}>장바구니 현황</h3>
                        <span style={sectionCount}>총 {cartItems.length}종류</span>
                    </div>
                    {cartLoading ? <LoadingText /> : cartItems.length === 0 ? <EmptyText text="장바구니가 비어있습니다." /> : (
                        cartItems.map((item) => (
                            <div key={item.cartItemNo} style={{ borderBottom: "1px solid #eee" }}>
                                <div onClick={() => toggleCart(item.cartItemNo)} style={accordionRow}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = cartExpandedMap[item.cartItemNo] ? "#fafafa" : "white"}>
                                    <span style={arrowStyle}>{cartExpandedMap[item.cartItemNo] ? "▼" : "▶"}</span>
                                    <span style={{ fontSize: "14px", color: "#222", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.productName}</span>
                                    <span style={subText}>{item.quantity}개</span>
                                    <span style={{ fontSize: "13px", color: "#222", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>{formatPrice(item.salePrice || item.price)}</span>
                                </div>
                                {cartExpandedMap[item.cartItemNo] && (
                                    <div style={accordionDetail}>
                                        <div style={detailFlex}>
                                            <span>상품번호: <b style={bStyle}>{item.productNo}</b></span>
                                            <span>사이즈: <b style={bStyle}>{item.optionSize || "-"}</b></span>
                                            <span>색상: <b style={bStyle}>{item.color || "-"}</b></span>
                                            <span>수량: <b style={bStyle}>{item.quantity}개</b></span>
                                            <span>정가: <b style={bStyle}>{formatPrice(item.price)}</b></span>
                                            {item.salePrice && <span>할인가: <b style={{ color: "#c62828" }}>{formatPrice(item.salePrice)}</b></span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* 주문 내역 - 클릭 시 배송지/주문자 상세 펼침 */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <h3 style={sectionTitle}>주문 내역</h3>
                        <span style={sectionCount}>총 {orderTotalCount}건</span>
                    </div>
                    {orderLoading ? <LoadingText /> : orderList.length === 0 ? <EmptyText text="주문 내역이 없습니다." /> : (
                        <>
                            {orderList.map((order) => (
                                <div key={order.orderNo} style={{ borderBottom: "1px solid #eee" }}>
                                    <div onClick={() => toggleOrder(order.orderNo)} style={accordionRow}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = orderExpandedMap[order.orderNo] ? "#fafafa" : "white"}>
                                        <span style={arrowStyle}>{orderExpandedMap[order.orderNo] ? "▼" : "▶"}</span>
                                        <span style={subText}>#{order.orderNo}</span>
                                        <span style={{ padding: "2px 10px", borderRadius: "10px", fontSize: "12px", whiteSpace: "nowrap", flexShrink: 0, ...(ORDER_STATUS_STYLE[order.orderStatus] || {}) }}>
                                            {ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus}
                                        </span>
                                        <span style={{ flex: 1, fontSize: "14px", color: "#222", fontWeight: "bold" }}>{formatPrice(order.totalPrice)}</span>
                                        {order.refundStatus && <span style={{ fontSize: "12px", color: "#c62828", whiteSpace: "nowrap", flexShrink: 0 }}>{order.refundStatus}</span>}
                                        <span style={subText}>{formatDate(order.createdAt)}</span>
                                    </div>
                                    {orderExpandedMap[order.orderNo] && (
                                        <div style={accordionDetail}>
                                            <div style={{ ...detailFlex, marginBottom: "10px" }}>
                                                <span>주문자: <b style={bStyle}>{order.ordererName}</b></span>
                                                <span>주문일: <b style={bStyle}>{formatDateTime(order.createdAt)}</b></span>
                                            </div>
                                            <div style={detailFlex}>
                                                <span>수령자: <b style={bStyle}>{order.receiverName}</b></span>
                                                <span>연락처: <b style={bStyle}>{formatPhone(order.receiverPhoneNumber)}</b></span>
                                            </div>
                                            <div style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
                                                배송지: <b style={bStyle}>[{order.receiverZipCode}] {order.receiverBaseAddress} {order.receiverDetailAddress}</b>
                                            </div>
                                            {order.message && <div style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>배송 메시지: <b style={bStyle}>{order.message}</b></div>}
                                            <button onClick={() => navigate(`/admin/order/detail/${order.orderNo}`)}
                                                style={{ marginTop: "10px", padding: "5px 14px", fontSize: "12px", background: "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                                                주문 상세 보기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {orderTotalPages > 1 && (
                                <Pagination page={orderPage} start={orderStart} end={orderEnd} totalPages={orderTotalPages}
                                    onPrev={() => setOrderPage(orderStart - 1)} onNext={() => setOrderPage(orderEnd + 1)} onPage={setOrderPage} />
                            )}
                        </>
                    )}
                </div>

                {/* 1:1 문의 내역 */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <h3 style={sectionTitle}>1:1 문의 내역</h3>
                        <span style={sectionCount}>총 {inqTotalCount}건</span>
                    </div>
                    {inqLoading ? <LoadingText /> : inquiryList.length === 0 ? <EmptyText text="문의 내역이 없습니다." /> : (
                        <>
                            {inquiryList.map((inq) => (
                                <div key={inq.inquiryNo} style={{ borderBottom: "1px solid #eee" }}>
                                    <div onClick={() => toggleInquiry(inq.inquiryNo)} style={accordionRow}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = inqExpandedMap[inq.inquiryNo] ? "#fafafa" : "white"}>
                                        <span style={arrowStyle}>{inqExpandedMap[inq.inquiryNo] ? "▼" : "▶"}</span>
                                        <span style={{ fontSize: "12px", color: "#666", background: "#f0f0f0", padding: "2px 8px", borderRadius: "10px", whiteSpace: "nowrap", flexShrink: 0 }}>{inq.category}</span>
                                        <span style={{ fontSize: "14px", color: "#222", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inq.title}</span>
                                        <span style={{
                                            fontSize: "12px", padding: "2px 10px", borderRadius: "10px", whiteSpace: "nowrap", flexShrink: 0,
                                            background: inq.status === "답변완료" ? "#e8f5e9" : "#fff3e0",
                                            color: inq.status === "답변완료" ? "#2e7d32" : "#e65100"
                                        }}>{inq.status}</span>
                                        <span style={subText}>{formatDate(inq.createdAt)}</span>
                                    </div>
                                    {inqExpandedMap[inq.inquiryNo] && (
                                        <div style={accordionDetail}>
                                            <div style={{ ...detailFlex, marginBottom: "12px", flexWrap: "wrap" }}>
                                                <span>문의번호: <b style={bStyle}>{inq.inquiryNo}</b></span>
                                                <span>카테고리: <b style={bStyle}>{inq.category}</b></span>
                                                <span>비밀글: <b style={bStyle}>{inq.secretYn === "Y" ? "🔒 비밀글" : "공개"}</b></span>
                                                <span>조회수: <b style={bStyle}>{inq.viewCount}</b></span>
                                                <span>등록일: <b style={bStyle}>{formatDateTime(inq.createdAt)}</b></span>
                                            </div>
                                            <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.8", whiteSpace: "pre-wrap", background: "#fff", padding: "12px", borderRadius: "4px", border: "1px solid #eee" }}>
                                                {inq.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {inqTotalPages > 1 && (
                                <Pagination page={inqPage} start={inqStart} end={inqEnd} totalPages={inqTotalPages}
                                    onPrev={() => setInqPage(inqStart - 1)} onNext={() => setInqPage(inqEnd + 1)} onPage={setInqPage} />
                            )}
                        </>
                    )}
                </div>

                {/* 로그인 이력 - 로그인 성공 시 자동 기록 (로그인 기능 구현 후 데이터 쌓임) */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <h3 style={sectionTitle}>로그인 이력</h3>
                        <span style={sectionCount}>총 {loginHistoryTotalCount}건</span>
                    </div>
                    {loginHistoryLoading ? <LoadingText /> : loginHistoryList.length === 0 ? <EmptyText text="로그인 이력이 없습니다." /> : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 12px", background: "#fafafa", borderBottom: "2px solid #eee" }}>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>로그인 일시</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>IP 주소</span>
                            </div>
                            {loginHistoryList.map((log) => (
                                <div key={log.logNo} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
                                    <span style={{ fontSize: "13px", color: "#222" }}>{formatDateTime(log.loginAt)}</span>
                                    <span style={{ fontSize: "13px", color: "#666" }}>{log.ipAddress || "-"}</span>
                                </div>
                            ))}
                            {loginHistoryTotalPages > 1 && (
                                <Pagination page={loginHistoryPage} start={lhStart} end={lhEnd} totalPages={loginHistoryTotalPages}
                                    onPrev={() => setLoginHistoryPage(lhStart - 1)} onNext={() => setLoginHistoryPage(lhEnd + 1)} onPage={setLoginHistoryPage} />
                            )}
                        </>
                    )}
                </div>

                {/* 포인트
                    - 잔액: DB에서 SUM(point)로 계산 (양수=적립 합산, 음수=차감 합산)
                    - EARN(적립): 양수 입력 → 포인트 지급
                    - USE(사용): 양수 입력해도 자동 음수 변환 → 포인트 차감
                    - ADMIN(관리자조정): 양수=지급, 음수=차감 직접 입력
                    - EXPIRE(만료): 입력 없이 버튼 클릭 → 잔액 전체 소멸
                    - 5개씩 페이징 */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <h3 style={sectionTitle}>포인트</h3>
                        <span style={{ fontSize: "15px", fontWeight: "bold", color: pointBalance >= 0 ? "#2e7d32" : "#c62828" }}>
                            잔액: {pointBalance.toLocaleString()}P
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
                        <select value={pointType} onChange={(e) => { setPointType(e.target.value); setPointInput(""); }}
                            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}>
                            <option value="ADMIN">관리자조정</option>
                            <option value="EARN">적립</option>
                            <option value="USE">사용</option>
                            <option value="EXPIRE">만료</option>
                        </select>
                        {/* EXPIRE 선택 시 입력창 숨김 - 잔액 전체 차감이므로 숫자 입력 불필요 */}
                        {pointType !== "EXPIRE" && (
                            <input type="number" value={pointInput} onChange={(e) => setPointInput(e.target.value)}
                                placeholder={pointType === "USE" ? "차감할 포인트 입력 (예: 500)" : "양수=지급, 음수=차감 (예: 1000 또는 -500)"}
                                style={{ flex: 1, padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }} />
                        )}
                        {/* EXPIRE 선택 시 잔액 전체 만료 안내 문구 */}
                        {pointType === "EXPIRE" && (
                            <span style={{ flex: 1, fontSize: "13px", color: "#c62828", padding: "8px 10px" }}>
                                현재 잔액 {pointBalance.toLocaleString()}P 전체가 만료 처리됩니다.
                            </span>
                        )}
                        <button onClick={handleInsertPoint} style={btnDark}>적용</button>
                    </div>
                    {pointLoading ? <LoadingText /> : pointList.length === 0 ? <EmptyText text="포인트 이력이 없습니다." /> : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 12px", background: "#fafafa", borderBottom: "2px solid #eee" }}>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>일시</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>타입</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888", textAlign: "right" }}>포인트</span>
                            </div>
                            {pointList.map((p) => (
                                <div key={p.pointNo} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
                                    <span style={{ fontSize: "13px", color: "#222" }}>{formatDateTime(p.createdAt)}</span>
                                    <span style={{ fontSize: "13px", color: "#666" }}>{POINT_TYPE_LABEL[p.type] || p.type}</span>
                                    {/* 양수면 초록(지급), 음수면 빨강(차감) */}
                                    <span style={{ fontSize: "13px", fontWeight: "bold", textAlign: "right", color: p.point > 0 ? "#2e7d32" : "#c62828" }}>
                                        {formatPoint(p.point)}
                                    </span>
                                </div>
                            ))}
                            {pointTotalPages > 1 && (
                                <Pagination page={pointPage} start={ptStart} end={ptEnd} totalPages={pointTotalPages}
                                    onPrev={() => setPointPage(ptStart - 1)} onNext={() => setPointPage(ptEnd + 1)} onPage={setPointPage} />
                            )}
                        </>
                    )}
                </div>

                {/* 쿠폰
                    - 새 쿠폰 생성: 이름/할인타입/할인값만 입력 (날짜는 발급 시 지정)
                    - 쿠폰 발급: 쿠폰 선택 + 유효기간(시작일/종료일) 발급 시 지정
                    - 전체 쿠폰 목록: 활성/비활성 토글(delete_yn) + 삭제
                    - 회원 보유 쿠폰: 만료일 표시 + 삭제/만료 처리 버튼 */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <h3 style={sectionTitle}>쿠폰</h3>
                        <span style={sectionCount}>보유 {memberCoupons.length}장</span>
                    </div>

                    {/* 새 쿠폰 생성 폼 - 날짜 없음 (발급 시 지정) */}
                    <div style={{ marginBottom: "20px", padding: "16px", background: "#f9f9f9", borderRadius: "6px", border: "1px solid #eee" }}>
                        <p style={{ fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "12px" }}>새 쿠폰 생성</p>

                        {/* 쿠폰 이름 */}
                        <div style={{ marginBottom: "8px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>쿠폰 이름</label>
                            <input placeholder="쿠폰 이름을 입력하세요" value={couponForm.couponName}
                                onChange={(e) => setCouponForm({ ...couponForm, couponName: e.target.value })}
                                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                        </div>

                        {/* 할인 타입 + 할인값 */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>할인 타입</label>
                                {/* RATE=비율(%), FIXED=고정금액(원) */}
                                <select value={couponForm.discountType}
                                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                    style={inputStyle}>
                                    <option value="RATE">비율 할인 (%)</option>
                                    <option value="FIXED">고정 할인 (원)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>
                                    {couponForm.discountType === "RATE" ? "할인율 (%)" : "할인금액 (원)"}
                                </label>
                                <input type="number"
                                    placeholder={couponForm.discountType === "RATE" ? "예: 10" : "예: 5000"}
                                    value={couponForm.discountValue}
                                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                    style={inputStyle} />
                            </div>
                        </div>

                        {/* 쿠폰 생성 버튼 */}
                        <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                            <button onClick={handleInsertCoupon} style={btnDark}>쿠폰 생성</button>
                            <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "12px" }}>
                                ※ 유효기간은 회원에게 발급할 때 지정합니다.
                            </span>
                        </div>
                    </div>

                    {/* 쿠폰 발급 - 쿠폰 선택 + 유효기간 발급 시 지정
                        언제 줄지 모르므로 쿠폰 생성 시가 아닌 발급 시 유효기간을 결정 */}
                    <div style={{ marginBottom: "20px", padding: "16px", background: "#f9f9f9", borderRadius: "6px", border: "1px solid #eee" }}>
                        <p style={{ fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "12px" }}>쿠폰 발급</p>

                        {/* 발급할 쿠폰 선택 - delete_yn=N 인 활성 쿠폰만 표시 */}
                        <div style={{ marginBottom: "8px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>쿠폰 선택</label>
                            <select value={selectedCouponNo} onChange={(e) => setSelectedCouponNo(e.target.value)}
                                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}>
                                <option value="">발급할 쿠폰 선택</option>
                                {/* delete_yn=N 인 정상 쿠폰만 표시 */}
                                {allCoupons.filter(c => c.deleteYn === "N").map((c) => (
                                    <option key={c.couponNo} value={c.couponNo}>
                                        {c.couponName} ({c.discountType === "RATE" ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}원`})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 유효기간 - 발급 시 지정 (선택사항, 없으면 무기한) */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>유효 시작일 (선택, 없으면 즉시)</label>
                                <input type="date" value={issuanceStartAt}
                                    onChange={(e) => setIssuanceStartAt(e.target.value)}
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>유효 종료일 (선택, 없으면 무기한)</label>
                                <input type="date" value={issuanceEndAt}
                                    onChange={(e) => setIssuanceEndAt(e.target.value)}
                                    style={inputStyle} />
                            </div>
                        </div>

                        <button onClick={handleIssueCoupon} style={btnDark}>발급</button>
                    </div>

                    {/* 전체 쿠폰 목록 - 활성/비활성 토글(delete_yn) + 삭제 버튼
                        삭제: 발급된 쿠폰이 있으면 FK 제약으로 실패 → 비활성화 후 삭제 권장 */}
                    <p style={{ fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "8px" }}>전체 쿠폰 목록</p>
                    {allCoupons.length === 0 ? <EmptyText text="등록된 쿠폰이 없습니다." /> : (
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 60px", padding: "8px 12px", background: "#fafafa", borderBottom: "2px solid #eee" }}>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>쿠폰명</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>할인</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>상태</span>
                                <span></span>
                                <span></span>
                            </div>
                            {pagedAllCoupons.map((c) => (
                                <div key={c.couponNo} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 60px", padding: "10px 12px", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
                                    <span style={{ fontSize: "13px", color: "#222" }}>{c.couponName}</span>
                                    <span style={{ fontSize: "13px", color: "#666" }}>
                                        {c.discountType === "RATE" ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}원`}
                                    </span>
                                    {/* 활성 여부 뱃지 - delete_yn=N 이면 활성, Y 이면 비활성 */}
                                    <span style={{
                                        fontSize: "12px", padding: "2px 10px", borderRadius: "10px", display: "inline-block",
                                        background: c.deleteYn === "N" ? "#e8f5e9" : "#fce4ec",
                                        color: c.deleteYn === "N" ? "#2e7d32" : "#c62828"
                                    }}>
                                        {c.deleteYn === "N" ? "활성" : "비활성"}
                                    </span>
                                    {/* 활성/비활성 토글 버튼 (delete_yn 변경) */}
                                    <button onClick={() => handleToggleCouponDeleteYn(c.couponNo, c.deleteYn)}
                                        style={{ padding: "4px 10px", fontSize: "12px", background: "#fff", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer" }}>
                                        {c.deleteYn === "N" ? "비활성화" : "활성화"}
                                    </button>
                                    {/* 쿠폰 삭제 버튼 - 발급된 쿠폰 있으면 실패 */}
                                    <button onClick={() => handleDeleteCoupon(c.couponNo)}
                                        style={{ padding: "4px 10px", fontSize: "12px", background: "#fff", color: "#c62828", border: "1px solid #c62828", borderRadius: "4px", cursor: "pointer" }}>
                                        삭제
                                    </button>
                                </div>
                            ))}
                            {/* 전체 쿠폰 페이지네이션 (5개 초과 시 표시) */}
                            {allCouponTotalPages > 1 && (
                                <Pagination page={allCouponPage} start={acGroupStart} end={acGroupEnd} totalPages={allCouponTotalPages}
                                    onPrev={() => setAllCouponPage(acGroupStart - 1)} onNext={() => setAllCouponPage(acGroupEnd + 1)} onPage={setAllCouponPage} />
                            )}
                        </div>
                    )}

                    {/* 회원 보유 쿠폰 목록 - 만료일 표시 + 삭제/만료 버튼 추가 */}
                    <p style={{ fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "8px" }}>회원 보유 쿠폰</p>
                    {couponLoading ? <LoadingText /> : memberCoupons.length === 0 ? <EmptyText text="보유한 쿠폰이 없습니다." /> : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", padding: "8px 12px", background: "#fafafa", borderBottom: "2px solid #eee" }}>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>쿠폰명</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>할인</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>만료일</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>발급일</span>
                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>사용여부</span>
                                <span></span>
                            </div>
                            {pagedMemberCoupons.map((mc) => (
                                <div key={mc.memberCouponNo} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", padding: "10px 12px", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
                                    <span style={{ fontSize: "13px", color: "#222" }}>{mc.couponName}</span>
                                    <span style={{ fontSize: "13px", color: "#666" }}>
                                        {mc.discountType === "RATE" ? `${mc.discountValue}%` : `${mc.discountValue.toLocaleString()}원`}
                                    </span>
                                    {/* 만료일 - member_coupon.end_at 표시 (발급 시 지정한 값) */}
                                    <span style={{ fontSize: "13px", color: "#666" }}>{mc.endAt ? formatDate(mc.endAt) : "무기한"}</span>
                                    <span style={{ fontSize: "13px", color: "#666" }}>{formatDate(mc.issuedAt)}</span>
                                    {/* 미사용=초록, 사용완료=회색 */}
                                    <span style={{
                                        fontSize: "12px", padding: "2px 10px", borderRadius: "10px", display: "inline-block",
                                        background: mc.usedYn === "N" ? "#e8f5e9" : "#f0f0f0",
                                        color: mc.usedYn === "N" ? "#2e7d32" : "#999"
                                    }}>
                                        {mc.usedYn === "N" ? "미사용" : "사용완료"}
                                    </span>
                                    {/* 삭제/만료 버튼 - 미사용 상태일 때만 표시 */}
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        {mc.usedYn === "N" && (
                                            <>
                                                <button onClick={() => handleExpireMemberCoupon(mc.memberCouponNo)}
                                                    style={{ padding: "4px 8px", fontSize: "11px", background: "#fff", color: "#f57f17", border: "1px solid #f57f17", borderRadius: "4px", cursor: "pointer" }}>
                                                    만료
                                                </button>
                                                <button onClick={() => handleDeleteMemberCoupon(mc.memberCouponNo)}
                                                    style={{ padding: "4px 8px", fontSize: "11px", background: "#fff", color: "#c62828", border: "1px solid #c62828", borderRadius: "4px", cursor: "pointer" }}>
                                                    삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* 회원 보유 쿠폰 페이지네이션 (5개 초과 시 표시) */}
                            {memberCouponTotalPages > 1 && (
                                <Pagination page={memberCouponPage} start={mcGroupStart} end={mcGroupEnd} totalPages={memberCouponTotalPages}
                                    onPrev={() => setMemberCouponPage(mcGroupStart - 1)} onNext={() => setMemberCouponPage(mcGroupEnd + 1)} onPage={setMemberCouponPage} />
                            )}
                        </>
                    )}
                </div>

                {/* 관리자 메모 - 이 회원에 대한 관리자 전용 메모 작성/삭제
                    클라이언트 사이드 5개씩 페이징 (전체 로드 후 잘라서 표시) */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <h3 style={sectionTitle}>관리자 메모</h3>
                        <span style={sectionCount}>총 {memoList.length}건</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                        <textarea value={memoInput} onChange={(e) => setMemoInput(e.target.value)}
                            placeholder="관리자 메모를 입력하세요." rows={2}
                            style={{ flex: 1, padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", resize: "vertical" }} />
                        <button onClick={handleInsertMemo} style={{ ...btnDark, alignSelf: "flex-end" }}>저장</button>
                    </div>
                    {memoLoading ? <LoadingText /> : memoList.length === 0 ? <EmptyText text="등록된 메모가 없습니다." /> : (
                        <>
                            {/* 현재 페이지 메모만 표시 (5개씩) */}
                            {pagedMemoList.map((memo) => (
                                <div key={memo.memoNo} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px", borderBottom: "1px solid #f0f0f0", gap: "12px" }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: "14px", color: "#222", margin: "0 0 4px 0", whiteSpace: "pre-wrap" }}>{memo.content}</p>
                                        <span style={{ fontSize: "12px", color: "#aaa" }}>{formatDateTime(memo.createdAt)}</span>
                                    </div>
                                    <button onClick={() => handleDeleteMemo(memo.memoNo)}
                                        style={{ padding: "4px 10px", fontSize: "12px", background: "#fff", color: "#c62828", border: "1px solid #c62828", borderRadius: "4px", cursor: "pointer", flexShrink: 0 }}>
                                        삭제
                                    </button>
                                </div>
                            ))}
                            {/* 메모 페이지네이션 (5개 초과 시 표시) */}
                            {memoTotalPages > 1 && (
                                <Pagination page={memoPage} start={memoGroupStart} end={memoGroupEnd} totalPages={memoTotalPages}
                                    onPrev={() => setMemoPage(memoGroupStart - 1)} onNext={() => setMemoPage(memoGroupEnd + 1)} onPage={setMemoPage} />
                            )}
                        </>
                    )}
                </div>

            </AdminLayout>
        </>
    );
};

// 정보 행 컴포넌트 (label: 라벨텍스트, value: 표시값)
const InfoRow = ({ label, value }) => (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
        <span style={labelStyle}>{label}</span>
        <span style={{ fontSize: "14px", color: "#222" }}>{value}</span>
    </div>
);

// 로딩 중 표시 컴포넌트
const LoadingText = () => <p style={{ textAlign: "center", padding: "20px", color: "#999" }}>로딩 중...</p>;

// 데이터 없을 때 표시 컴포넌트
const EmptyText = ({ text }) => <p style={{ fontSize: "13px", color: "#aaa", padding: "16px 0" }}>{text}</p>;

// 공통 페이지네이션 컴포넌트
// page: 현재 페이지 / start~end: 현재 그룹의 시작~끝 페이지 번호
// totalPages: 전체 페이지 수 / onPrev/onNext: 이전/다음 그룹 이동 / onPage: 특정 페이지 이동
const Pagination = ({ page, start, end, totalPages, onPrev, onNext, onPage }) => (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
        <button onClick={onPrev} disabled={start === 1} style={{ ...pageBtn, color: start === 1 ? "#ccc" : "#333" }}>&lt;</button>
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
            <button key={p} onClick={() => onPage(p)}
                style={{ ...pageBtn, background: page === p ? "#222" : "#fff", color: page === p ? "#fff" : "#333" }}>{p}</button>
        ))}
        <button onClick={onNext} disabled={end === totalPages} style={{ ...pageBtn, color: end === totalPages ? "#ccc" : "#333" }}>&gt;</button>
    </div>
);

// 공통 스타일
const card = { background: "#fff", border: "1px solid #eee", borderRadius: "8px", padding: "20px 24px", marginBottom: "16px" };
const cardTitle = { fontSize: "15px", fontWeight: "bold", marginBottom: "16px", color: "#222", borderBottom: "2px solid #222", paddingBottom: "8px" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" };
const labelStyle = { display: "inline-block", width: "120px", fontSize: "13px", color: "#888", fontWeight: "bold" };
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "2px solid #222", paddingBottom: "8px" };
const sectionTitle = { fontSize: "15px", fontWeight: "bold", color: "#222", margin: 0 };
const sectionCount = { fontSize: "13px", color: "#888" };
const accordionRow = { display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", cursor: "pointer" };
const accordionDetail = { background: "#f9f9f9", padding: "14px 24px", borderTop: "1px solid #eee" };
const detailFlex = { display: "flex", gap: "20px", fontSize: "13px", color: "#666", flexWrap: "wrap" };
const arrowStyle = { fontSize: "12px", color: "#aaa", width: "16px", flexShrink: 0 };
const subText = { fontSize: "13px", color: "#888", whiteSpace: "nowrap", flexShrink: 0 };
const bStyle = { color: "#222" };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" };
const btnGray = { padding: "8px 18px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer", fontSize: "14px" };
const btnDark = { padding: "8px 18px", background: "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" };
const btnRed = { padding: "8px 18px", background: "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" };
const pageBtn = { padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer", fontSize: "13px" };

export default AdminMemberDetailPage;
