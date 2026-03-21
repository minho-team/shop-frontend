import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../../api/user/ordersApi';
import apiClient, { API_SERVER_HOST } from '../../api/common/apiClient';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import '../../css/user/MyOrderDetailPage.css';

const getStatusLabel = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT': return '결제대기';
        case 'PAYMENT_COMPLETED': return '결제완료';
        case 'PREPARING': return '배송준비중';
        case 'SHIPPING': return '배송중';
        case 'DELIVERED': return '배송완료';
        case 'CANCEL_REQUESTED': return '취소요청';
        case 'CANCELED': return '주문취소';
        case 'REFUND_REQUESTED': return '환불요청중';
        case 'REFUNDED': return '환불완료';
        default: return status || '상태미정';
    }
};

const canRefund = (status) => {
    return status === 'PAYMENT_COMPLETED' || status === 'DELIVERED';
};

const canWriteReview = (status) => {
    return status === 'PAYMENT_COMPLETED' || status === 'DELIVERED';
};

const buttonBaseStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    marginBottom: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    boxSizing: 'border-box'
};

const activeButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
};

const disabledButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#eee',
    color: '#999',
    border: '1px solid #ddd',
    cursor: 'default'
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
        return `${API_SERVER_HOST}${url}`;
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getOrderDetail(orderNo);
                console.log("주문 상세 데이터 응답:", data);
                console.log("주문 상품 목록:", data.items);

                setOrderData(data);

                if (data.items) {
                    const reviewStatus = {};

                    await Promise.all(
                        data.items.map(async (item) => {
                            if (canWriteReview(item.orderItemStatus)) {
                                try {
                                    const res = await apiClient.get(`/api/reviews/check/${item.orderItemNo}`);
                                    reviewStatus[item.orderItemNo] = res.data;
                                } catch (e) {
                                    console.error(`리뷰 상태 확인 실패 (No: ${item.orderItemNo}):`, e);
                                }
                            }
                        })
                    );

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

    const handleRefundClick = (item, orderInfo) => {
        navigate('/refund/write', {
            state: {
                orderNo: orderInfo.orderNo,
                orderItemNo: item.orderItemNo,
                productNo: item.productNo,
                itemName: item.itemName,
                itemColor: item.itemColor,
                itemSize: item.itemSize,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * item.quantity,
                orderStatus: item.orderItemStatus,
            },
        });
    };

    const handleReviewClick = (item) => {
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
    };

    if (loading) return <div className="loading-container">정보 로딩 중...</div>;
    if (!orderData || !orderData.order) return <div className="empty-content">주문 내역이 없습니다.</div>;

    const orderInfo = orderData.order;
    const itemCount = orderData.items ? orderData.items.length : 0;

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
                        <div className="summary-item"><span>주문 상품 개수</span> <strong>{itemCount}개</strong></div>
                    </div>

                    <div
                        className="order-items-detail-section"
                        style={{ marginTop: '50px', borderTop: '2px solid #333', paddingTop: '30px' }}
                    >
                        <h4 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                            주문 상품 상세 내역
                        </h4>

                        {orderData.items && orderData.items.map((item) => (
                            <div
                                key={item.orderItemNo}
                                className="item-detail-card"
                                style={{
                                    display: 'flex',
                                    padding: '20px',
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    marginBottom: '15px',
                                    alignItems: 'center'
                                }}
                            >
                                <img
                                    src={getImageUrl(item.imageUrl)}
                                    alt={item.itemName}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        marginRight: '25px'
                                    }}
                                />

                                <div className="item-info-text" style={{ flex: 1 }}>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{item.itemName}</h5>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        옵션: {item.itemColor} / {item.itemSize}
                                    </p>
                                    <p style={{ margin: '5px 0' }}>
                                        수량: <strong>{item.quantity}</strong>개
                                    </p>
                                    <p style={{ margin: '5px 0' }}>
                                        상태: <strong>{getStatusLabel(item.orderItemStatus)}</strong>
                                    </p>
                                </div>

                                <div className="item-action-area" style={{ textAlign: 'right' }}>
                                    <p
                                        style={{
                                            margin: '0 0 10px 0',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            color: '#d9534f'
                                        }}
                                    >
                                        ₩{(item.unitPrice * item.quantity).toLocaleString()}
                                    </p>

                                    {item.orderItemStatus === 'REFUND_REQUESTED' ? (
                                        <button
                                            disabled
                                            style={disabledButtonStyle}
                                        >
                                            환불요청중
                                        </button>
                                    ) : item.orderItemStatus === 'REFUNDED' ? (
                                        <button
                                            disabled
                                            style={disabledButtonStyle}
                                        >
                                            환불완료
                                        </button>
                                    ) : (
                                        canRefund(item.orderItemStatus) && (
                                            <button
                                                onClick={() => handleRefundClick(item, orderInfo)}
                                                style={activeButtonStyle}
                                            >
                                                환불하기
                                            </button>
                                        )
                                    )}

                                    {canWriteReview(item.orderItemStatus) && (
                                        reviewedItems[item.orderItemNo] ? (
                                            <button
                                                disabled
                                                style={disabledButtonStyle}
                                            >
                                                작성 완료
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReviewClick(item)}
                                                style={activeButtonStyle}
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
};

export default MyOrderDetailPage;