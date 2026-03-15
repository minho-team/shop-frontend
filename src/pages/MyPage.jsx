import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useUser } from "../context/UserContext";
import '../css/MyPage.css';
import { getMyOrderList } from '../api/ordersApi';
import Footer from '../components/Footer';

const getStatusLabel = (status) => {
    switch (status) {
        case 'PAYMENT_COMPLETED': return '결제완료';
        case 'PREPARING': return '배송준비중';
        case 'SHIPPING': return '배송중';
        case 'DELIVERED': return '배송완료';
        case 'CANCELED': return '주문취소';
        case 'REQUESTED': return '반품신청';
        case 'COMPLETED': return '환불완료';
        default: return status || '상태미정';
    }
};

/**
 * [컴포넌트] 주문 내역 테이블
 */
const OrderHistory = ({ currentUser, type }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {

                const data = await getMyOrderList();
                setOrders(data.orderList || []);
            } catch (err) {
                console.error("데이터 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [currentUser, type, user]);

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
                    {orders.length > 0 ? (
                        orders.map(o => (
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
                        <tr>
                            <td colSpan="4" className="empty-row">
                                최근 주문 내역이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

/**
 * [컴포넌트] 나의 상품 리뷰 목록
 */
const ReviewHistory = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user) return;
            try {
                setReviews([
                    { id: 1, itemName: '프리미엄 티셔츠', content: '재질이 너무 좋아요!', rating: 5, createdAt: '2026-03-10' },
                    { id: 2, itemName: '슬림핏 청바지', content: '사이즈가 딱 맞네요.', rating: 4, createdAt: '2026-03-05' }
                ]);
            } catch (err) {
                console.error("리뷰 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [user]);

    if (loading) return <div className="loading-container">리뷰 로딩 중...</div>;

    return (
        <div className="table-responsive">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>작성일</th>
                        <th>상품정보</th>
                        <th>내용</th>
                        <th>별점</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.length > 0 ? (
                        reviews.map(r => (
                            <tr key={r.id}>
                                <td>{r.createdAt}</td>
                                <td>{r.itemName}</td>
                                <td style={{ textAlign: 'left' }}>{r.content}</td>
                                <td>{'⭐'.repeat(r.rating)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" className="empty-row">작성한 리뷰가 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};


/**
 * [메인 페이지] 마이페이지
 */
const MyPage = () => {
    const { user, loading: userLoading } = useUser();
    const [activeMenu, setActiveMenu] = useState('주문내역조회');
    const navigate = useNavigate();


    if (userLoading) return <div className="loading-container">정보 로딩 중...</div>;

    return (
        <div className="mypage-container">
            <Header />

            {/* 유저 상단 대시보드 */}
            <div className="user-summary-bg">
                <section className="user-summary">
                    <div className="user-info">
                        <span className="welcome-text">WELCOME</span>
                        {/* DB에서 가져온 이름 표시, 없으면 '손님' 혹은 로딩 표시 */}
                        <h2>{user?.memberName || '회원'} 님</h2>
                        <button className="btn-grade-check">멤버쉽 등급확인 {'>'}</button>
                    </div>
                    <div className="grade-badge">
                        <span className="label">Grade (등급)</span>
                        {/* DB에서 가져온 등급 표시, 소문자일 경우를 대비해 대문자로 변환(toUpperCase) */}
                        <strong className={`grade-${user?.memberGrade?.toLowerCase() || 'common'}`}>
                            {user?.memberGrade || 'BASIC'}
                        </strong>
                    </div>
                </section>
            </div>

            <div className="mypage-wrapper">
                <div className="mypage-body">
                    {/* 좌측 사이드바 */}
                    <aside className="sidebar">
                        <MenuSection
                            title="나의 쇼핑 정보"
                            items={['주문내역조회', '상품리뷰', '관심목록 조회']}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                        <MenuSection
                            title="나의 혜택 정보"
                            items={['쿠폰내역조회']}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                        <MenuSection
                            title="고객센터"
                            items={['자주 묻는 질문']}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                        <MenuSection
                            title="설정"
                            items={['개인 정보 수정']}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                    </aside>

                    {/* 우측 콘텐츠 영역 */}
                    <main className="content-area">
                        <h3 className="content-title">{activeMenu}</h3>

                        {activeMenu === '주문내역조회' && (
                            <div className="order-content-wrapper">
                                <div className="order-tab-container">
                                    <button className="modern-tab-btn active">주문배송조회</button>
                                </div>
                                <div className="order-list-section">
                                    <OrderHistory currentUser={user} type="DELIVERY" />
                                </div>
                            </div>
                        )}

                        {activeMenu === '상품리뷰' && (
                            <div className="order-content-wrapper">
                                <div className="order-tab-container">
                                    <button className="modern-tab-btn active">내가 작성한 리뷰</button>
                                </div>
                                <div className="order-list-section">
                                    <ReviewHistory user={user} />
                                </div>
                            </div>
                        )}

                        {/* 나머지 메뉴 처리 */}
                        {!['주문내역조회', '상품리뷰'].includes(activeMenu) && (
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

const MenuSection = ({ title, items, activeMenu, setActiveMenu }) => {
    const navigate = useNavigate();

    return (
        <div className="menu-group">
            <h4>{title}</h4>
            <ul className="menu-list">
                {items.map(item => (
                    <li
                        key={item}
                        className={`menu-item ${activeMenu === item ? 'active' : ''}`}
                        onClick={() => {
                            if (item === '자주 묻는 질문') {
                                navigate('/inquiry');
                            } else {
                                setActiveMenu(item);
                            }
                        }}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default MyPage;