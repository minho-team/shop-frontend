import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/user/OrderResultPage.css";

const API_BASE_URL = "http://localhost:8080";

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

const formatPrice = (value) => Number(value ?? 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
};

const OrderResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const orderResult = location.state;

  useEffect(() => {
    if (!orderResult) {
      alert("잘못된 접근입니다.");
      navigate("/", { replace: true });
    }
  }, [orderResult, navigate]);

  if (!orderResult) {
    return null;
  }

  const {
    orderNo,
    totalPrice,
    createdAt,
    ordererName,
    items = [],
  } = orderResult;

  const productPrice = items.reduce((sum, item) => {
    return sum + Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0);
  }, 0);

  const discountPrice = Math.max(0, productPrice - Number(totalPrice ?? 0));

  return (
    <div className="order-result-page">
      <div className="order-result-container">
        <section className="result-top-box">
          <p className="result-breadcrumb">
            장바구니 &gt; 주문/결제 &gt;{" "}
            <span className="active-breadcrumb">주문완료</span>
          </p>

          <div className="result-icon">✓</div>

          <h1 className="result-main-title">주문이 완료되었습니다</h1>

          <p className="result-message">
            주문해주셔서 감사합니다.
            <br />
            상품을 정성껏 준비해서 보내드릴게요.
          </p>

          <div className="result-order-info">
            <p>
              <span>주문번호</span>
              <strong>{orderNo}</strong>
            </p>
            <p>
              <span>주문일시</span>
              <strong>{formatDate(createdAt)}</strong>
            </p>
            <p>
              <span>주문자</span>
              <strong>{ordererName || "-"}</strong>
            </p>
          </div>

          <div className="result-button-wrap">
            <button
              type="button"
              className="result-line-button"
              onClick={() => navigate(`/my/order/detail/${orderNo}`)}
            >
              주문상세보기
            </button>

            <button
              type="button"
              className="result-dark-button"
              onClick={() => navigate("/")}
            >
              쇼핑계속하기
            </button>
          </div>
        </section>

        <section className="result-card">
          <div className="card-header">
            <h2>주문상품정보</h2>
            <span>{items.length}개 상품</span>
          </div>

          <div className="order-item-list">
            {items.map((item, index) => (
              <div className="order-item-card" key={index}>
                <div className="order-item-image-wrap">
                  {item.imageUrl ? (
                    <img
                      src={getImageSrc(item.imageUrl)}
                      alt={item.itemName}
                      className="order-item-image"
                    />
                  ) : (
                    <div className="order-item-image no-image">이미지 없음</div>
                  )}
                </div>

                <div className="order-item-info">
                  <p className="order-item-name">{item.itemName}</p>

                  {item.itemColor || item.itemSize ? (
                    <p className="order-item-option">
                      옵션: {item.itemColor || "-"} / {item.itemSize || "-"}
                    </p>
                  ) : (
                    <p className="order-item-option">옵션 없음</p>
                  )}

                  <p className="order-item-quantity">수량: {item.quantity}개</p>
                </div>

                <div className="order-item-price-box">
                  <p className="unit-price">{formatPrice(item.unitPrice)}원</p>
                  <p className="total-price">
                    {formatPrice(
                      Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0),
                    )}
                    원
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="result-card payment-card">
          <div className="card-header">
            <h2>결제정보</h2>
          </div>

          <div className="summary-detail">
            <div className="summary-row">
              <span>상품금액</span>
              <strong>{formatPrice(productPrice)}원</strong>
            </div>

            <div className="summary-row">
              <span>배송비</span>
              <strong>0원</strong>
            </div>

            <div className="summary-row discount-row">
              <span>할인/부가결제</span>
              <strong>
                {discountPrice > 0 ? `-${formatPrice(discountPrice)}원` : "0원"}
              </strong>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row grand-total">
            <span>총 결제금액</span>
            <strong>{formatPrice(totalPrice)}원</strong>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderResultPage;
