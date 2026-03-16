import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../api/ordersApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/MyOrderDetailPage.css';

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

const MyOrderDetailPage = () => {
    const { orderNo } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getOrderDetail(orderNo);
                setOrderData(data);
            } catch (err) {
                console.error("상세 내역 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [orderNo]);

    if (loading) return <div className="loading-container">정보 로딩 중...</div>;
    if (!orderData || !orderData.order) return <div className="empty-content">주문 내역이 없습니다.</div>;

    const orderInfo = orderData.order;

    return (
        <div className="mypage-container">
            <Header />

            <div className="mypage-wrapper">
                <main className="content-area" style={{ paddingTop: '50px' }}>
                    {/* 상단 헤더 */}
                    <header className="detail-header">
                        <h3 className="content-title" style={{ margin: 0 }}>주문 상세 정보</h3>
                        <button className="btn-back-list" onClick={() => navigate(-1)}>목록으로</button>
                    </header>

                    {/* 주문 요약 정보 */}
                    <div className="order-summary-box">
                        <div className="summary-item"><span>주문번호</span> <strong>{orderInfo.orderNo}</strong></div>
                        <div className="summary-item"><span>주문일자</span> <strong>{new Date(orderInfo.createdAt).toLocaleDateString()}</strong></div>
                        <div className="summary-item"><span>주문상태</span> <strong>{getStatusLabel(orderInfo.orderStatus)}</strong></div>
                    </div>

                    {/* 하단 상세 정보 그리드 */}
                    <div className="info-grid-container">

                        {/* 1. 주문자 정보 (회원 가입 주소 포함) */}
                        <div className="info-card">
                            <h4 className="section-title" style={{ marginTop: 0 }}>주문자 정보</h4>
                            <div className="delivery-text">
                                <p><strong>이름 :</strong> <span>{orderInfo.ordererName}</span></p>
                                <p><strong>연락처 :</strong> <span>{orderInfo.ordererPhoneNumber}</span></p>
                                <p><strong>이메일 :</strong> <span>{orderInfo.ordererEmail}</span></p>
                                <p>
                                    <strong>가입 주소 :</strong>
                                    <span>
                                        {orderData.ordererBasicAddress ?
                                            `[${orderData.ordererZipCode}] ${orderData.ordererBasicAddress} ${orderData.ordererDetailAddress}`
                                            : '등록된 주소 정보가 없습니다.'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* 2. 결제 정보 */}
                        <div className="info-card">
                            <h4 className="section-title" style={{ marginTop: 0 }}>결제 정보</h4>
                            <div className="info-row"><span>주문금액</span><span>₩{orderInfo.totalPrice?.toLocaleString()}</span></div>
                            <div className="info-row"><span>배송비</span><span>₩0</span></div>
                            <div className="info-row total">
                                <span>최종 결제금액</span>
                                <span className="price-red">₩{orderInfo.totalPrice?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* 3. 배송지 정보 */}
                        <div className="info-card">
                            <h4 className="section-title" style={{ marginTop: 0 }}>배송지 정보</h4>
                            <div className="delivery-text">
                                <p><strong>받는분 :</strong> <span>{orderInfo.receiverName}</span></p>
                                <p><strong>연락처 :</strong> <span>{orderInfo.receiverPhoneNumber}</span></p>
                                <p>
                                    <strong>주소 :</strong>
                                    <span>[{orderInfo.receiverZipCode}] {orderInfo.receiverBaseAddress} {orderInfo.receiverDetailAddress}</span>
                                </p>
                                <p><strong>배송메시지 :</strong> <span>{orderInfo.message || '없음'}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="order-items-detail-section" style={{ marginTop: '50px', borderTop: '2px solid #333', paddingTop: '30px' }}>
                        <h4 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>주문 상품 상세 내역</h4>
                        {orderData.items && orderData.items.map((item) => (
                            <div key={item.orderItemNo} className="item-detail-card" style={{ display: 'flex', padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px', alignItems: 'center' }}>
                                <img
                                    src={item.imageUrl || '/default-product.png'}
                                    alt={item.itemName}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginRight: '25px' }}
                                />
                                <div className="item-info-text" style={{ flex: 1 }}>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{item.itemName}</h5>
                                    <p style={{ margin: '5px 0', color: '#666' }}>옵션: {item.itemColor} / {item.itemSize}</p>
                                    <p style={{ margin: '5px 0' }}>수량: <strong>{item.quantity}</strong>개</p>
                                </div>
                                <div className="item-price-text" style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#888', textDecoration: 'line-through' }}>
                                        단가: ₩{item.unitPrice?.toLocaleString()}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#d9534f' }}>
                                        합계: ₩{(item.unitPrice * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </main>
            </div>


            <Footer />
        </div>
    );
}

export default MyOrderDetailPage;