import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderDetail } from '../api/ordersApi';
import Header from '../components/Header';
import '../css/MyOrderDetailPage.css';
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
    if (!orderData) return <div className="empty-content">주문 내역이 없습니다.</div>;

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
                        <div className="summary-item">주문번호 <strong>{orderData.orderNo}</strong></div>
                        <div className="summary-item">주문일자 <strong>{new Date(orderData.createdAt).toLocaleDateString()}</strong></div>
                        <div className="summary-item">주문상태 <strong>{getStatusLabel(orderData.orderStatus)}</strong></div>
                    </div>

                    {/* 상품 정보 테이블 */}
                    <h4 className="section-title">주문 상품 정보</h4>
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>상품정보</th>
                                <th>수량</th>
                                <th>금액</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderData.items && orderData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="product-info-td">
                                        <img src={item.imageUrl || '/default-product.png'} alt={item.itemName} className="product-img" />
                                        <div>
                                            <p className="product-name">{item.itemName}</p>
                                            <small style={{ color: '#888' }}>[옵션: {item.itemColor} / {item.itemSize}]</small>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0 10px' }}>{item.quantity}개</td>
                                    <td style={{ padding: '0 10px' }}>₩{item.unitPrice?.toLocaleString()}</td>
                                    <td className="status-delivery">{getStatusLabel(orderData.orderStatus)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* 하단 상세 정보 그리드 */}
                    <div className="info-grid-container" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>

                        {/* 1. 주문자 정보 (새로 추가) */}
                        <div className="info-card">
                            <h4 className="section-title" style={{ marginTop: 0 }}>주문자 정보</h4>
                            <div className="delivery-text">
                                <p><strong>이름 :</strong> {orderData.ordererName}</p>
                                <p><strong>연락처 :</strong> {orderData.ordererPhoneNumber}</p>
                                <p><strong>이메일 :</strong> {orderData.ordererEmail}</p>
                                {/* 가입 시 주소는 보통 주문서의 주소와 같거나 Member 테이블 정보이므로 
                주문 테이블에 저장된 정보를 우선 표기합니다. */}
                            </div>
                        </div>
                        <div className="info-card">
                            <h4 className="section-title" style={{ marginTop: 0 }}>결제 정보</h4>
                            <div className="info-row"><span>주문금액</span><span>₩{orderData.totalPrice?.toLocaleString()}</span></div>
                            <div className="info-row"><span>배송비</span><span>₩0</span></div>
                            <div className="info-row total">
                                <span>최종 결제금액</span>
                                <span className="price-red">₩{orderData.totalPrice?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="info-card">
                            <h4 className="section-title" style={{ marginTop: 0 }}>배송지 정보</h4>
                            <div className="delivery-text">
                                <p><strong>받는분 :</strong> {orderData.receiverName}</p>
                                <p><strong>연락처 :</strong> {orderData.receiverPhoneNumber}</p>
                                <p><strong>주소 :</strong> [{orderData.receiverZipCode}] {orderData.receiverBaseAddress} {orderData.receiverDetailAddress}</p>
                                <p><strong>배송메시지 :</strong> {orderData.message || '없음'}</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div >
            <Footer />

        </div >
    );
}

export default MyOrderDetailPage;