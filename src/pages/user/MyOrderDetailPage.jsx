import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../../api/user/ordersApi';
import apiClient from '../../api/common/apiClient';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import '../../css/user/MyOrderDetailPage.css';

const API_BASE_URL = "http://localhost:8080";

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
    const [reviewedItems, setReviewedItems] = useState({});

    const getImageUrl = (url) => {
        if (!url) return '/default-product.png';
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getOrderDetail(orderNo);
                // 데이터 구조 확인을 위해 콘솔 출력 추가
                console.log("주문 상세 데이터 응답:", data);
                console.log("주문 상품 목록:", data.items);
                setOrderData(data);

                if (data.order && data.order.orderStatus === 'DELIVERED' && data.items) {
                    const reviewStatus = {};
                    await Promise.all(data.items.map(async (item) => {
                        try {
                            const res = await apiClient.get(`/api/reviews/check/${item.orderItemNo}`);
                            reviewStatus[item.orderItemNo] = res.data;
                        } catch (e) {
                            console.error(`리뷰 상태 확인 실패 (No: ${item.orderItemNo}):`, e);
                        }
                    }));
                    setReviewedItems(reviewStatus);
                }
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
                    <header className="detail-header">
                        <h3 className="content-title" style={{ margin: 0 }}>주문 상세 정보</h3>
                        <button className="btn-back-list" onClick={() => navigate(-1)}>목록으로</button>
                    </header>

                    <div className="order-summary-box">
                        <div className="summary-item"><span>주문번호</span> <strong>{orderInfo.orderNo}</strong></div>
                        <div className="summary-item"><span>주문일자</span> <strong>{new Date(orderInfo.createdAt).toLocaleDateString()}</strong></div>
                        <div className="summary-item"><span>주문상태</span> <strong>{getStatusLabel(orderInfo.orderStatus)}</strong></div>
                    </div>

                    <div className="order-items-detail-section" style={{ marginTop: '50px', borderTop: '2px solid #333', paddingTop: '30px' }}>
                        <h4 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>주문 상품 상세 내역</h4>

                        {orderData.items && orderData.items.map((item) => (
                            <div key={item.orderItemNo} className="item-detail-card" style={{ display: 'flex', padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px', alignItems: 'center' }}>
                                <img
                                    src={getImageUrl(item.imageUrl)}
                                    alt={item.itemName}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginRight: '25px' }}
                                />

                                <div className="item-info-text" style={{ flex: 1 }}>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{item.itemName}</h5>
                                    <p style={{ margin: '5px 0', color: '#666' }}>옵션: {item.itemColor} / {item.itemSize}</p>
                                    <p style={{ margin: '5px 0' }}>수량: <strong>{item.quantity}</strong>개</p>
                                </div>

                                <div className="item-action-area" style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#d9534f' }}>
                                        ₩{(item.unitPrice * item.quantity).toLocaleString()}
                                    </p>

                                    {orderInfo.orderStatus === 'DELIVERED' && (
                                        reviewedItems[item.orderItemNo] ? (
                                            <button
                                                className="btn-write-review disabled"
                                                disabled
                                                style={{ background: '#eee', color: '#999', cursor: 'default', border: '1px solid #ddd' }}
                                            >
                                                작성 완료
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-write-review"
                                                onClick={() => {
                                                    if (!item.orderItemNo || !item.productNo) {
                                                        alert("상품 정보가 누락되어 리뷰를 작성할 수 없습니다.");
                                                        return;
                                                    }
                                                    navigate(`/my/review/write/${item.orderItemNo}`, {
                                                        state: {
                                                            productNo: item.productNo,
                                                            orderItemNo: item.orderItemNo,
                                                            itemName: item.itemName,
                                                            itemColor: item.itemColor,
                                                            itemSize: item.itemSize,
                                                            imageUrl: item.imageUrl
                                                        }
                                                    });
                                                }}
                                            >
                                                리뷰 작성하기
                                            </button>
                                        )
                                    )}
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