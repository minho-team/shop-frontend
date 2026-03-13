import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // 푸터 링크를 위해 추가
import Header from '../components/Header';
import { useUser } from "../context/UserContext";
import '../css/MyPage.css';
import { getMyOrderList } from '../api/myPageApi';



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
                setOrders(data.orderList);

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
                            <tr key={o.orderNo}>
                                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td>{o.orderNo}</td>
                                <td>₩{o.totalPrice?.toLocaleString()}</td>
                                <td className={`status-${o.orderStatus?.toLowerCase()}`}>
                                    {o.orderStatus}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="empty-row">
                                {type === 'DELIVERY' ? "최근 주문 내역이 없습니다." : "취소/교환/반품 내역이 없습니다."}
                            </td>
                        </tr>
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
    const [orderTab, setOrderTab] = useState('delivery');

    if (userLoading) return <div className="loading-container">정보 로딩 중...</div>;

    return (
        <div className="mypage-container">
            <Header />

            {/* 유저 상단 대시보드 */}
            <div className="user-summary-bg">
                <section className="user-summary">
                    <div className="user-info">
                        <span className="welcome-text">WELCOME</span>
                        <h2>{user?.memberName || '홍길동'} 님</h2>
                        <button className="btn-grade-check">멤버쉽 등급확인 {'>'}</button>
                    </div>
                    <div className="grade-badge">
                        <span className="label">Grade (등급)</span>
                        <strong className="grade-silver">SILVER</strong>
                    </div>
                </section>
            </div>

            <div className="mypage-wrapper">
                <div className="mypage-body">
                    {/* 좌측 사이드바 */}
                    <aside className="sidebar">
                        <MenuSection
                            title="나의 쇼핑 정보"
                            items={['주문내역조회', '상품리뷰', '관심목록 조회', '최근 본 상품']}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                        <MenuSection
                            title="나의 혜택 정보"
                            items={['쿠폰내역조회', '적립금 내역']}
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
                            items={['개인 정보 수정', '배송지 관리']}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                    </aside>

                    {/* 우측 콘텐츠 영역 */}
                    <main className="content-area">
                        <h3 className="content-title">{activeMenu}</h3>

                        {activeMenu === '주문내역조회' ? (
                            <div className="order-content-wrapper">
                                <div className="order-tab-container">
                                    <button
                                        className={`modern-tab-btn ${orderTab === 'delivery' ? 'active' : ''}`}
                                        onClick={() => setOrderTab('delivery')}
                                    >
                                        주문배송조회 <span>(최근 3개월)</span>
                                    </button>
                                    <button
                                        className={`modern-tab-btn ${orderTab === 'cancel' ? 'active' : ''}`}
                                        onClick={() => setOrderTab('cancel')}
                                    >
                                        취소/교환/반품 내역
                                    </button>
                                </div>

                                <div className="order-list-section">
                                    <OrderHistory
                                        currentUser={user}
                                        type={orderTab === 'delivery' ? 'DELIVERY' : 'CANCEL'}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="empty-content">
                                <p>현재 {activeMenu} 메뉴는 준비 중입니다.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/*========== 푸터 영역 추가 ===========*/}
            <footer className="footer">
                <div className="footer-top-menu">
                    <Link to="/" className="footer-top-link">홈으로</Link>
                    <Link to="/company" className="footer-top-link">회사소개</Link>
                    <Link to="/terms" className="footer-top-link">이용약관</Link>
                    <Link to="/privacy" className="footer-top-link strong">개인정보처리방침</Link>
                    <Link to="/guide" className="footer-top-link">이용안내</Link>
                </div>

                <div className="footer-main">
                    <div className="footer-col footer-company">
                        <h2 className="footer-logo">민호팀</h2>
                        <p>COMPANY : 민호팀(주) / CEO : 민호</p>
                        <p>CALL CENTER : 1111-2222</p>
                        <p>ADDRESS : 서울특별시 강남구 테헤란로14길 6 남도빌딩 2F, 3F, 4F, 5F, 6F</p>
                        <p>개인정보관리책임자 : 민호</p>
                        <p>사업자등록번호 : 333-33-33333 <a href="/" className="footer-inline-link">[사업자정보확인]</a></p>
                        <p>통신판매업 신고번호 : 제3333-서울-0333호</p>
                    </div>

                    <div className="footer-col footer-center">
                        <div className="footer-block">
                            <h3>CS CENTER</h3>
                            <strong className="footer-phone">1111-2222</strong>
                            <p>월 - 금 : 09:00 ~ 17:50 / 토,일,공휴일 CLOSE</p>
                            <p>점심시간 : 12:50 ~ 14:00</p>
                        </div>
                        <div className="footer-divider" />
                        <div className="footer-block">
                            <h3>RETURN / EXCHANGE</h3>
                            <p>서울특별시 강남구 테헤란로14길 6 남도빌딩 2F, 3F, 4F, 5F, 6F (민호팀)</p>
                        </div>
                    </div>

                    <div className="footer-col footer-bank">
                        <h3>BANK ACCOUNT</h3>
                        <p>신한 111-222-333333</p>
                        <p>예금주: 민호팀</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const MenuSection = ({ title, items, activeMenu, setActiveMenu }) => (
    <div className="menu-group">
        <h4>{title}</h4>
        <ul className="menu-list">
            {items.map(item => (
                <li
                    key={item}
                    className={`menu-item ${activeMenu === item ? 'active' : ''}`}
                    onClick={() => setActiveMenu(item)}
                >
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

export default MyPage;