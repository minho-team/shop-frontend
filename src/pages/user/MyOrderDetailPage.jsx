import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail, cancelOrder } from '../../api/user/ordersApi';
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
        case 'REJECTED': return '환불 거절됨';
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
                                    console.error(`리뷰 상태 확인 실패:`, e);
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

    const handleCancelOrder = async (orderNo) => {
        if (!window.confirm("정말 주문을 취소하시겠습니까? 결제 전 주문은 즉시 취소됩니다.")) {
            return;
        }
        try {
            await cancelOrder(orderNo);
            alert("주문이 성공적으로 취소되었습니다.");
            window.location.reload();
        } catch (err) {
            console.error("주문 취소 실패:", err);
            alert(err.response?.data?.message || err.response?.data || "주문 취소 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <div className="loading-container">정보 로딩 중...</div>;
    if (!orderData || !orderData.order) return <div className="empty-content">주문 내역이 없습니다.</div>;

    const orderInfo = orderData.order;
    const items = orderData.items || [];

    // 금액 계산 로직
    const totalItemPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const couponDiscount = totalItemPrice - orderInfo.totalPrice;

    return (
        <div className="mypage-container">
            <Header />
            <div className="mypage-wrapper">
                <main className="content-area">
                    <header className="detail-header">
                        <h3 className="content-title">주문 상세 정보</h3>
                        <button className="btn-back-list" onClick={() => navigate(-1)}>목록으로</button>
                    </header>

                    {/* 주문 요약 정보 */}
                    <div className="order-summary-box">
                        <div className="summary-item"><span>주문번호</span> <strong>{orderInfo.orderNo}</strong></div>
                        <div className="summary-item"><span>주문일자</span> <strong>{new Date(orderInfo.createdAt).toLocaleDateString()}</strong></div>
                        <div className="summary-item"><span>주문 상품 개수</span> <strong>{items.length}개</strong></div>
                        <div className="summary-item"><span>결제 금액</span> <strong>{Number(orderInfo.totalPrice).toLocaleString()}원</strong></div>
                    </div>

                    {/* 결제 및 환불 내역 상세 박스 */}
                    <div className="payment-detail-box">
                        <h4 className="section-title-small">결제 및 환불 내역 상세</h4>
                        <div className="payment-info-content">
                            <div className="info-row">
                                <span>주문 상품 총액</span>
                                <span>₩{totalItemPrice.toLocaleString()}</span>
                            </div>
                            <div className="info-row discount">
                                <span>쿠폰 할인 금액</span>
                                <span className="price-red">- ₩{couponDiscount.toLocaleString()}</span>
                            </div>
                            <div className="info-row total-highlight">
                                <span>{orderInfo.orderStatus.includes('REFUND') ? '최종 환불 예정 금액' : '실제 결제 금액'}</span>
                                <strong>₩{orderInfo.totalPrice.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>

                    {/* 주문 상품 상세 내역 */}
                    <div className="order-items-detail-section">
                        <h4 className="section-title">주문 상품 상세 내역</h4>

                        {items.map((item) => (
                            <div key={item.orderItemNo} className="item-detail-card">
                                <img src={getImageUrl(item.imageUrl)} alt={item.itemName} />

                                <div className="item-info-text">
                                    <h5>{item.itemName}</h5>
                                    <p className="item-option">옵션: {item.itemColor} / {item.itemSize}</p>
                                    <p className="item-quantity">수량: <strong>{item.quantity}</strong>개</p>
                                    <p className="item-status">상태: <strong>{getStatusLabel(item.orderItemStatus)}</strong></p>
                                </div>

                                <div className="item-action-area">
                                    <p className="item-total-price">
                                        ₩{(item.unitPrice * item.quantity).toLocaleString()}
                                    </p>

                                    {/* 1. 결제대기 상태 처리 */}
                                    {item.orderItemStatus === 'PENDING_PAYMENT' && (
                                        <div className="pending-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                            <button
                                                onClick={() => navigate('/order/write', {
                                                    state: {
                                                        ...orderData,
                                                        existingOrderNo: orderInfo.orderNo
                                                    }
                                                })}
                                                className="btn-action btn-action-active"
                                            >
                                                결제하기
                                            </button>
                                            <button
                                                onClick={() => handleCancelOrder(orderInfo.orderNo)}
                                                className="btn-action btn-action-danger"
                                            >
                                                주문취소
                                            </button>
                                        </div>
                                    )}

                                    {/* 2. 환불 관련 처리 */}
                                    {item.orderItemStatus === 'REFUND_REQUESTED' ? (
                                        <button disabled className="btn-action btn-action-disabled">환불요청중</button>
                                    ) : item.orderItemStatus === 'REFUNDED' ? (
                                        <button disabled className="btn-action btn-action-disabled">환불완료</button>
                                    ) : (
                                        canRefund(item.orderItemStatus) && (
                                            <button onClick={() => handleRefundClick(item, orderInfo)} className="btn-action btn-action-active">환불하기</button>
                                        )
                                    )}

                                    {/* 3. 리뷰 관련 처리 */}
                                    {canWriteReview(item.orderItemStatus) && (
                                        reviewedItems[item.orderItemNo] ? (
                                            <button disabled className="btn-action btn-action-disabled">작성 완료</button>
                                        ) : (
                                            <button onClick={() => handleReviewClick(item)} className="btn-action btn-action-active">리뷰 작성하기</button>
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