import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrder } from "../api/ordersApi";
import "../css/OrderWritePage.css";

// 구매하기를 누를 때 나오는 주문서 작성 페이지

const OrderWritePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [ordererName, setOrdererName] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [ordererEmail, setOrdererEmail] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const orderData = location.state;

  useEffect(() => {
    if (!orderData) {
      alert("잘못된 접근입니다.");
      navigate(-1);
    }
  }, [orderData, navigate]);

  useEffect(() => {
    if (window.kakao?.Postcode) return;

    const existingScript = document.getElementById("kakao-postcode-script");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "kakao-postcode-script";
    script.src =
      "//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;

    script.onerror = () => {
      alert("주소 검색 스크립트를 불러오지 못했습니다.");
    };

    document.body.appendChild(script);
  }, []);

  const handleAddressSearch = () => {
    if (!window.kakao?.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.kakao.Postcode({
      oncomplete: function (data) {
        let addr = "";
        let extraAddr = "";

        if (data.userSelectedType === "R") {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        if (data.userSelectedType === "R") {
          if (data.bname && /[동로가]$/.test(data.bname)) {
            extraAddr += data.bname;
          }

          if (data.buildingName && data.apartment === "Y") {
            extraAddr += extraAddr
              ? `, ${data.buildingName}`
              : data.buildingName;
          }

          if (extraAddr) {
            extraAddr = ` (${extraAddr})`;
          }
        }

        setZipCode(data.zonecode);
        setBaseAddress(addr + extraAddr);

        setTimeout(() => {
          const detailInput = document.getElementById("detailAddress");
          if (detailInput) {
            detailInput.focus();
          }
        }, 0);
      },
    }).open();
  };

  const product = useMemo(() => {
    if (!orderData) {
      return {
        productNo: 0,
        itemName: "",
        itemColor: "",
        itemSize: "",
        quantity: 0,
        unitPrice: 0,
        imageUrl: "",
      };
    }

    return {
      productNo: orderData.productNo,
      itemName: orderData.productName,
      itemColor: orderData.optionColor,
      itemSize: orderData.optionSize,
      quantity: orderData.quantity,
      unitPrice: orderData.productPrice,
      imageUrl: orderData.imageUrl,
      productOptionNo: orderData.productOptionNo,
    };
  }, [orderData]);

  const totalPrice = useMemo(() => {
    return Number(product.unitPrice ?? 0) * Number(product.quantity ?? 0);
  }, [product]);

  const handleSubmitOrder = async () => {
    if (submitting) return;

    if (!ordererName.trim()) {
      alert("주문자명을 입력해주세요.");
      return;
    }

    if (!ordererPhone.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }

    if (!ordererEmail.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (!receiverName.trim()) {
      alert("수령인명을 입력해주세요.");
      return;
    }

    if (!receiverPhone.trim()) {
      alert("수령인 연락처를 입력해주세요.");
      return;
    }

    if (!zipCode.trim() || !baseAddress.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      const orderRequest = {
        ordererName,
        ordererPhoneNumber: ordererPhone,
        ordererEmail,
        receiverName,
        receiverPhoneNumber: receiverPhone,
        receiverZipCode: zipCode,
        receiverBaseAddress: baseAddress,
        receiverDetailAddress: detailAddress,
        message,
        totalPrice,
        items: [
          {
            productOptionNo: product.productOptionNo,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            itemName: product.itemName,
            itemSize: product.itemSize,
            itemColor: product.itemColor,
            imageUrl: product.imageUrl,
          },
        ],
      };

      const response = await createOrder(orderRequest);

      navigate("/order/result", {
        state: {
          orderNo: response.orderNo,
          totalPrice,
          createdAt: response.createdAt || new Date().toISOString(),
          ordererName,
          items: [
            {
              itemName: product.itemName,
              itemColor: product.itemColor,
              itemSize: product.itemSize,
              quantity: product.quantity,
              unitPrice: product.unitPrice,
              imageUrl: product.imageUrl,
            },
          ],
        },
      });
    } catch (error) {
      console.error("주문 실패:", error);
      alert("주문 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderData) {
    return null;
  }

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
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.itemName}
                        className="order-item-image"
                      />
                    ) : (
                      <div className="order-item-image no-image">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  <div className="order-item-info">
                    <p className="order-item-name">{product.itemName}</p>

                    {product.itemColor || product.itemSize ? (
                      <p className="order-item-option">
                        옵션: {product.itemColor} / {product.itemSize}
                      </p>
                    ) : (
                      <p className="order-item-option">옵션 없음</p>
                    )}

                    <p className="order-item-quantity">
                      수량: {product.quantity}개
                    </p>
                  </div>

                  <div className="order-item-price-box">
                    <p className="unit-price">
                      {Number(product.unitPrice).toLocaleString()}원
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
                      readOnly
                    />
                    <button
                      type="button"
                      className="address-button"
                      onClick={handleAddressSearch}
                    >
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
                    readOnly
                  />
                </div>

                <div className="form-row full">
                  <label>상세주소</label>
                  <input
                    id="detailAddress"
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
              <h2>결제정보</h2>

              <div className="summary-detail">
                <div className="summary-row">
                  <span>구매상품</span>
                  <strong>{totalPrice.toLocaleString()}원</strong>
                </div>

                <div className="summary-row">
                  <span>배송비</span>
                  <strong>0원</strong>
                </div>

                <div className="summary-row">
                  <span>할인/부가결제</span>
                  <strong>-0원</strong>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row grand-total">
                <span>총 결제 금액</span>
                <strong>{totalPrice.toLocaleString()}원</strong>
              </div>

              <button
                type="button"
                className="submit-order-button"
                onClick={handleSubmitOrder}
                disabled={submitting}
              >
                {submitting ? "처리 중..." : "결제하기"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderWritePage;
