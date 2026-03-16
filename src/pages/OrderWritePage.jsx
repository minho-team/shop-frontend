import { useState } from "react";
import "../css/OrderWritePage.css";

// 구매하기를 누를 때 나오는 주문서 작성 페이지

const OrderWritePage = () => {
  const [ordererName, setOrdererName] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [ordererEmail, setOrdererEmail] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [message, setMessage] = useState("");

  // 임시 상품 데이터
  const product = {
    itemName: "라이더 자켓",
    itemColor: "블랙",
    itemSize: "M",
    quantity: 1,
    unitPrice: 59000,
  };

  // 총 결제 금액
  const totalPrice = product.unitPrice * product.quantity;

  return (
    <div className="order-page">
      <div className="order-container">
        <div className="order-header">
          <h1 className="order-title">주문 / 결제</h1>

          <div className="order-stepper">
            <div className="step completed">
              <span>01</span>
              <p>상품선택</p>
            </div>

            <div className="step active">
              <span>02</span>
              <p>주문서작성</p>
            </div>

            <div className="step">
              <span>03</span>
              <p>주문완료</p>
            </div>
          </div>
        </div>

        <div className="order-layout">
          <div className="order-main">
            <section className="order-section">
              <div className="section-header">
                <h2>주문상품</h2>
                <span>1개 상품</span>
              </div>

              <div className="order-item-list">
                <div className="order-item-card">
                  <div className="order-item-image-wrap">
                    <img
                      src={product.imageUrl}
                      alt={product.itemName}
                      className="order-item-image"
                    />
                  </div>

                  <div className="order-item-info">
                    <p className="order-item-name">{product.itemName}</p>
                    <p className="order-item-option">
                      옵션: {product.itemColor} / {product.itemSize}
                    </p>
                    <p className="order-item-quantity">
                      수량: {product.quantity}개
                    </p>
                  </div>

                  <div className="order-item-price-box">
                    <p className="unit-price">
                      {product.unitPrice.toLocaleString()}원
                    </p>
                    <p className="total-price">
                      {totalPrice.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="order-section">
              <div className="section-header">
                <h2>주문자 정보</h2>
              </div>

              <div className="form-grid">
                <div className="form-row">
                  <label>주문자명</label>
                  <input
                    type="text"
                    placeholder="주문자명을 입력해주세요"
                    value={ordererName}
                    onChange={(e) => setOrdererName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label>연락처</label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={ordererPhone}
                    onChange={(e) => setOrdererPhone(e.target.value)}
                  />
                </div>

                <div className="form-row full">
                  <label>이메일</label>
                  <input
                    type="text"
                    placeholder="example@email.com"
                    value={ordererEmail}
                    onChange={(e) => setOrdererEmail(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="order-section">
              <div className="section-header">
                <h2>배송지 정보</h2>
                <button
                  type="button"
                  className="copy-button"
                  onClick={() => {
                    setReceiverName(ordererName);
                    setReceiverPhone(ordererPhone);
                  }}
                >
                  주문자 정보와 동일
                </button>
              </div>

              <div className="form-grid">
                <div className="form-row">
                  <label>수령인명</label>
                  <input
                    type="text"
                    placeholder="수령인명을 입력해주세요"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label>수령인 연락처</label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                  />
                </div>

                <div className="form-row full">
                  <label>우편번호</label>
                  <div className="zip-input-group">
                    <input
                      type="text"
                      placeholder="우편번호"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                    <button type="button" className="address-button">
                      주소 찾기
                    </button>
                  </div>
                </div>

                <div className="form-row full">
                  <label>기본주소</label>
                  <input
                    type="text"
                    placeholder="기본주소를 입력해주세요"
                    value={baseAddress}
                    onChange={(e) => setBaseAddress(e.target.value)}
                  />
                </div>

                <div className="form-row full">
                  <label>상세주소</label>
                  <input
                    type="text"
                    placeholder="상세주소를 입력해주세요"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                  />
                </div>

                <div className="form-row full">
                  <label>배송메시지</label>
                  <textarea
                    placeholder="배송 요청사항을 입력해주세요"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="order-sidebar">
            <div className="summary-box">
              <h2>결제예정금액</h2>

              <div className="summary-row total">
                <span>총 결제예정금액</span>
                <strong>{totalPrice.toLocaleString()}원</strong>
              </div>

              <button type="button" className="submit-order-button">
                주문하기
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderWritePage;
