import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/user/Header';
import { useUser } from "../../context/UserContext";
import '../../css/user/MyPage.css';
import { getMyOrderList } from '../../api/user/ordersApi';
import apiClient, { API_SERVER_HOST } from '../../api/common/apiClient';
import Footer from '../../components/user/Footer';

// ================================================
// 헬퍼 함수
// ================================================

// 구매 횟수 기반 등급 계산
const getGrade = (count) => {
    if (count >= 30) return "VVIP";
    if (count >= 20) return "VIP";
    if (count >= 10) return "GOLD";
    if (count >= 5) return "SILVER";
    return "BASIC";
};

// 주문 상태 한글 변환
const getStatusLabel = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT': return '결제대기';
        case 'PAYMENT_COMPLETED': return '결제완료';
        case 'PREPARING': return '배송준비중';
        case 'SHIPPING': return '배송중';
        case 'DELIVERED': return '배송완료';
        case 'CANCEL_REQUESTED': return '취소요청';
        case 'CANCELED': return '주문취소';
        case 'REJECTED': return '환불 거절됨';
        case 'REFUND_REQUESTED': return '환불요청중';
        case 'REFUNDED': return '환불완료';
        default: return status || '상태미정';
    }
};

// 날짜 포맷 (yyyy.mm.dd)
const formatDate = (d) => (!d ? "-" : new Date(d).toLocaleDateString("ko-KR"));

// ================================================
// [컴포넌트] 등급 혜택 안내
// ================================================
const GradeInfo = ({ purchaseCount, currentGrade, memberName }) => {
    const grades = [
        { name: 'VVIP', condition: '30회 이상', benefit: '10% 할인 쿠폰 + 무료배송' },
        { name: 'VIP', condition: '20회 이상', benefit: '7% 할인 쿠폰 + 무료배송' },
        { name: 'GOLD', condition: '10회 이상', benefit: '5% 할인 쿠폰' },
        { name: 'SILVER', condition: '5회 이상', benefit: '3% 할인 쿠폰' },
        { name: 'BASIC', condition: '기본 등급', benefit: '신규가입 혜택 제공' },
    ];

    return (
        <div className="grade-info-wrapper">
            <div className="current-status-box">
                <p>현재 <strong>{memberName}</strong>님의 누적 구매 횟수는 <strong>{purchaseCount}회</strong>이며,</p>
                <p>적용된 멤버쉽 등급은 <span className={`badge-box badge-${currentGrade.toLowerCase()}`}>{currentGrade}</span> 입니다.</p>
            </div>
            <table className="custom-table grade-table">
                <thead>
                    <tr>
                        <th>등급명 (Grade)</th>
                        <th>조건 (Purchase)</th>
                        <th>혜택 (Benefits)</th>
                    </tr>
                </thead>
                <tbody>
                    {grades.map(g => (
                        <tr key={g.name} className={currentGrade === g.name ? 'row-highlight' : ''}>
                            <td><strong>{g.name}</strong></td>
                            <td>{g.condition}</td>
                            <td>{g.benefit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ================================================
// [컴포넌트] 주문 내역
// ================================================
const OrderHistory = ({ user }) => {
    const [pageData, setPageData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const data = await getMyOrderList(currentPage);
                setPageData(data);
            } catch (err) {
                console.error("주문 내역 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user, currentPage]);

    if (loading) return <div className="loading-container">데이터 로드 중...</div>;

    const { orderList = [], startPage = 0, endPage = 0, prev = false, next = false } = pageData || {};

    return (
        <div className="table-responsive">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>주문일자 (Date)</th>
                        <th>주문번호 (Order No)</th>
                        <th>금액 (Amount)</th>
                        <th>상태 (Status)</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList.length > 0 ? (
                        orderList.map(o => (
                            <tr key={o.orderNo} className="order-row-hover">
                                <td>
                                    <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                                        {new Date(o.createdAt).toLocaleDateString()}
                                    </Link>
                                </td>
                                <td>
                                    <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                                        {o.orderNo}
                                    </Link>
                                </td>
                                <td>
                                    <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                                        ₩{o.totalPrice?.toLocaleString()}
                                    </Link>
                                </td>
                                <td className={`status-${o.orderStatus?.toLowerCase()}`}>
                                    <Link to={`/my/order/detail/${o.orderNo}`} className="table-cell-link">
                                        {getStatusLabel(o.orderStatus)}
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" className="empty-row">최근 주문 내역이 없습니다.</td></tr>
                    )}
                </tbody>
            </table>

            {pageData && startPage > 0 && (
                <div className="pagination-wrapper">
                    <button className="paging-btn" disabled={!prev} onClick={() => setCurrentPage(startPage - 1)}>&lt;</button>
                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(num => (
                        <button key={num}
                            className={`paging-btn ${currentPage === num ? 'active' : ''}`}
                            onClick={() => setCurrentPage(num)}>{num}</button>
                    ))}
                    <button className="paging-btn" disabled={!next} onClick={() => setCurrentPage(endPage + 1)}>&gt;</button>
                </div>
            )}
        </div>
    );
};

// ================================================
// [컴포넌트] 상품 리뷰 목록
// ================================================
const ReviewHistory = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchReviews = useCallback(async () => {
        if (!user) return;
        try {
            const response = await apiClient.get('/api/reviews/my');
            setReviews(response.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    // 수정 페이지로 이동
    const handleEditNavigate = (review) => {
        navigate(`/my/review/edit/${review.reviewNo}`, { state: review });
    };

    const handleEdit = (review) => {
        navigate(`/my/review/edit/${review.reviewNo}`, { state: review });
    };

    const handleDelete = async (reviewNo) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await apiClient.delete(`/api/reviews/${reviewNo}`);

            alert("삭제되었습니다.");
            window.location.reload();
        } catch (err) {
            console.error("삭제 실패:", err.response?.data);
            alert(err.response?.data || "삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="loading-container">리뷰 로딩 중...</div>;

    return (
        <div className="table-responsive">
            <table className="custom-table" style={{ tableLayout: 'fixed' }}>
                <thead>
                    <tr>
                        <th style={{ width: '15%' }}>작성일</th>
                        <th style={{ width: '25%' }}>상품정보</th>
                        <th style={{ width: '35%' }}>내용</th>
                        <th style={{ width: '15%' }}>별점</th>
                        <th style={{ width: '10%' }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.length > 0 ? (
                        reviews.map(r => (
                            <tr key={r.reviewNo} className="order-row-hover">
                                <td className="text-center">{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td className="text-center">
                                    {/* color: inherit이 적용되어 파란색이 뜨지 않습니다 */}
                                    <Link to={`/product/detail/${r.productNo}`} className="product-link">
                                        {r.itemName}
                                    </Link>
                                </td>
                                <td className="text-center">
                                    <div className="review-title-text">{r.title}</div>
                                    <div className="review-content-text">{r.content}</div>
                                </td>
                                <td className="text-center">{'⭐'.repeat(r.rating)}</td>
                                <td className="text-center">
                                    <div className="review-action-btns">
                                        <button className="btn-mini" onClick={() => handleEdit(r)}>수정</button>
                                        <button className="btn-mini btn-del" onClick={() => handleDelete(r.reviewNo)}>삭제</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="empty-row">작성한 리뷰가 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
// ================================================
// [컴포넌트] 리뷰 수정 모달 (ReviewEditModal)
// ================================================
const ReviewEditModal = ({ review, onClose, onUpdateSuccess }) => {
    const [editData, setEditData] = useState({
        title: review.title || '',
        content: review.content || '',
        rating: review.rating || 5,
        userHeight: review.userHeight || '',
        userWeight: review.userWeight || '',
        sizeRating: review.sizeRating || 'NORMAL'
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(review.imageUrl ? `/upload/${review.imageUrl}` : null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", editData.title);
        formData.append("content", editData.content);
        formData.append("rating", editData.rating);
        formData.append("userHeight", editData.userHeight);
        formData.append("userWeight", editData.userWeight);
        formData.append("sizeRating", editData.sizeRating);

        if (imageFile) {
            formData.append("uploadFile", imageFile);
        }

        try {
            await apiClient.put(`/api/reviews/${review.reviewNo}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("리뷰가 수정되었습니다.");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            alert("수정 실패: " + err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '450px', maxHeight: '80vh', overflowY: 'auto' }}>
                <h4>리뷰 수정하기</h4>
                <form onSubmit={handleUpdate}>
                    <div className="edit-form-group">
                        <label>별점</label>
                        <select name="rating" value={editData.rating} onChange={handleChange}>
                            {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{'⭐'.repeat(num)}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="edit-form-group" style={{ flex: 1 }}>
                            <label>키 (cm)</label>
                            <input type="number" name="userHeight" value={editData.userHeight} onChange={handleChange} />
                        </div>
                        <div className="edit-form-group" style={{ flex: 1 }}>
                            <label>몸무게 (kg)</label>
                            <input type="number" name="userWeight" value={editData.userWeight} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="edit-form-group">
                        <label>리뷰 제목</label>
                        <input type="text" name="title" value={editData.title} onChange={handleChange} required />
                    </div>

                    <div className="edit-form-group">
                        <label>상세 내용</label>
                        <textarea name="content" value={editData.content} onChange={handleChange} rows="5" required />
                    </div>

                    <div className="edit-form-group">
                        <label>사진 변경</label>
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: '80px', marginTop: '10px', display: 'block' }} />}
                    </div>

                    <div className="modal-btns">
                        <button type="submit" className="btn-submit">수정 완료</button>
                        <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ================================================
// [컴포넌트] 쿠폰 내역 조회
// GET /api/member/coupons → 로그인한 회원의 보유 쿠폰 목록
// ================================================
const CouponHistory = ({ user }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL / UNUSED / USED

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!user) return;
            try {
                const res = await apiClient.get('/api/member/coupons');
                setCoupons(res.data);
            } catch (err) {
                console.error("쿠폰 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, [user]);

    if (loading) return <div className="loading-container">쿠폰 로딩 중...</div>;

    // 필터 적용
    const filtered = coupons.filter(c => {
        if (filter === "UNUSED") return c.usedYn === "N";
        if (filter === "USED") return c.usedYn === "Y";
        return true;
    });

    return (
        <div>
            {/* 필터 버튼 */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[
                    { key: "ALL", label: `전체 (${coupons.length})` },
                    { key: "UNUSED", label: `미사용 (${coupons.filter(c => c.usedYn === "N").length})` },
                    { key: "USED", label: `사용완료 (${coupons.filter(c => c.usedYn === "Y").length})` },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        style={{
                            padding: "6px 14px",
                            border: "1px solid #ddd",
                            background: filter === f.key ? "#111" : "#fff",
                            color: filter === f.key ? "#fff" : "#333",
                            cursor: "pointer",
                            fontSize: "13px",
                        }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* 쿠폰 목록 */}
            {filtered.length === 0 ? (
                <div className="empty-content">
                    <p>보유 중인 쿠폰이 없습니다.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.map(cp => (
                        <div key={cp.memberCouponNo} style={{
                            border: `1px solid ${cp.usedYn === "Y" ? "#e0e0e0" : "#111"}`,
                            padding: "16px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            opacity: cp.usedYn === "Y" ? 0.5 : 1,
                        }}>
                            {/* 왼쪽: 쿠폰 정보 */}
                            <div>
                                <p style={{ fontWeight: "500", fontSize: "15px", margin: "0 0 4px", color: "#111" }}>
                                    {cp.couponName}
                                </p>
                                <p style={{ fontSize: "13px", color: "#888", margin: "0 0 4px" }}>
                                    {cp.discountType === "RATE"
                                        ? `${cp.discountValue}% 할인`
                                        : `${Number(cp.discountValue).toLocaleString()}원 할인`}
                                </p>
                                <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
                                    {cp.endAt
                                        ? `유효기간: ${formatDate(cp.startAt)} ~ ${formatDate(cp.endAt)}`
                                        : "유효기간: 무기한"}
                                </p>
                            </div>

                            {/* 오른쪽: 사용 여부 뱃지 */}
                            <span style={{
                                padding: "4px 12px",
                                fontSize: "12px",
                                border: `1px solid ${cp.usedYn === "Y" ? "#ddd" : "#111"}`,
                                color: cp.usedYn === "Y" ? "#aaa" : "#111",
                                whiteSpace: "nowrap",
                            }}>
                                {cp.usedYn === "Y" ? "사용완료" : "미사용"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ================================================
// [메인] 마이페이지
// ================================================
const MyPage = () => {
    const { user, loading: userLoading } = useUser();
    const [activeMenu, setActiveMenu] = useState('주문내역조회');
    const navigate = useNavigate();

    // MyPage 컴포넌트 내부
    const purchaseCount = Number(user?.purchaseCount) || 0;
    const currentGrade = user?.grade || getGrade(purchaseCount);

    const getProgress = () => {
        if (purchaseCount >= 30) return 100;
        const targets = [5, 10, 20, 30];
        const nextTarget = targets.find(t => t > purchaseCount) || 30;
        const prevTarget = targets[targets.indexOf(nextTarget) - 1] || 0;

        // 해당 구간에서의 진행도 계산
        const segmentProgress = ((purchaseCount - prevTarget) / (nextTarget - prevTarget)) * 100;
        return Math.min(segmentProgress, 100);
    };

    // 다음 등급까지 남은 횟수 계산
    const getNextGradeInfo = () => {
        if (purchaseCount < 5) return 5 - purchaseCount;   // BASIC -> SILVER
        if (purchaseCount < 10) return 10 - purchaseCount; // SILVER -> GOLD
        if (purchaseCount < 20) return 20 - purchaseCount; // GOLD -> VIP
        if (purchaseCount < 30) return 30 - purchaseCount; // VIP -> VVIP
        return 0;
    };

    if (userLoading) return <div className="loading-container">정보 로딩 중...</div>;

    return (
        <div className="mypage-container">
            <Header />

            <div className="user-summary-bg">
                <section className="user-summary">
                    <div className="user-info">
                        <span className="welcome-text">WELCOME</span>
                        <h2>{user?.memberName || '회원'} 님</h2>
                        <button className="btn-grade-check" onClick={() => setActiveMenu('등급 혜택 안내')}>
                            멤버쉽 등급확인 {'>'}
                        </button>
                    </div>

                    <div className="grade-badge">
                        <span className="label">Grade (등급)</span>
                        <div className="grade-display-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span className={`badge-box badge-${currentGrade.toLowerCase()}`}>
                                {currentGrade}
                            </span>
                            <div className="grade-text-group">
                                <strong className={`grade-text-${currentGrade.toLowerCase()}`}>
                                    {currentGrade}
                                </strong>

                                {currentGrade !== 'VVIP' && (
                                    <>
                                        <span className="next-grade-info" style={{ display: 'block', fontSize: '11px', color: '#ff4d4f', marginTop: '4px' }}>
                                            다음 등급까지 {getNextGradeInfo()}회 남음
                                        </span>
                                        {/* [여기가 게이지 바가 들어갈 위치입니다] */}
                                        <div className="progress-bar-container" style={{ width: '120px', height: '6px', background: '#eee', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                                            <div className="progress-fill" style={{ width: `${getProgress()}%`, height: '100%', background: '#111', transition: 'width 0.5s ease-in-out' }}></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* 본문: 사이드바 + 컨텐츠 */}
            <div className="mypage-wrapper">
                <div className="mypage-body">

                    {/* 사이드바 메뉴 */}
                    <aside className="sidebar">
                        <MenuSection title="나의 쇼핑 정보"
                            items={['주문내역조회', '상품리뷰']}
                            activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                        <MenuSection title="나의 혜택 정보"
                            items={['쿠폰내역조회', '등급 혜택 안내']}
                            activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                        <MenuSection title="고객센터"
                            items={['자주 묻는 질문']}
                            activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                        <MenuSection title="설정"
                            items={['개인 정보 수정']}
                            activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                    </aside>

                    {/* 메인 컨텐츠 */}
                    <main className="content-area">
                        <h3 className="content-title">{activeMenu}</h3>

                        {activeMenu === '주문내역조회' && <OrderHistory user={user} />}
                        {activeMenu === '상품리뷰' && <ReviewHistory user={user} />}
                        {activeMenu === '쿠폰내역조회' && <CouponHistory user={user} />}
                        {activeMenu === '등급 혜택 안내' && (
                            <GradeInfo
                                purchaseCount={purchaseCount}
                                currentGrade={currentGrade}
                                memberName={user?.memberName}
                            />
                        )}

                        {/* 아직 구현 안 된 메뉴 */}
                        {!['주문내역조회', '상품리뷰', '쿠폰내역조회', '등급 혜택 안내'].includes(activeMenu) && (
                            <div className="empty-content">
                                <p>현재 {activeMenu} 메뉴는 준비 중입니다.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
};

// ================================================
// [컴포넌트] 사이드바 메뉴 섹션
// ================================================
const MenuSection = ({ title, items, activeMenu, setActiveMenu }) => {
    const navigate = useNavigate();
    return (
        <div className="menu-group">
            <h4>{title}</h4>
            <ul className="menu-list">
                {items.map(item => (
                    <li key={item}
                        className={`menu-item ${activeMenu === item ? 'active' : ''}`}
                        onClick={() => {
                            if (item === '자주 묻는 질문') navigate('/inquiry');
                            else setActiveMenu(item);
                        }}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyPage;