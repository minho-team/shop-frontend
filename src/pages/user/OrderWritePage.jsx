import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { preparePayment, getMyCoupons } from "../../api/user/ordersApi";
import "../../css/user/OrderWritePage.css";
import { API_SERVER_HOST } from "../../api/common/apiClient";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import Header from "../../components/user/Header";
import { useUser } from "../../context/UserContext";

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_SERVER_HOST}${imageUrl}`;
};

const normalizePhone = (phone = "") =>
  String(phone)
    .replace(/[^0-9]/g, "")
    .trim();

const isValidPhone = (phone) => /^\d{10,11}$/.test(phone);

const isValidEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim());

const getMemberName = (member) => member?.memberName || member?.name || "";

const getMemberPhone = (member) =>
  normalizePhone(member?.phoneNumber || member?.memberPhoneNumber || "");

const getMemberEmail = (member) => member?.email || member?.memberEmail || "";

const getMemberZipCode = (member) =>
  member?.zipCode || member?.memberZipCode || "";

const getMemberBaseAddress = (member) =>
  member?.basicAddress ||
  member?.baseAddress ||
  member?.receiverBaseAddress ||
  member?.memberBaseAddress ||
  "";

const getMemberDetailAddress = (member) =>
  member?.detailAddress ||
  member?.receiverDetailAddress ||
  member?.memberDetailAddress ||
  "";

// 구매하기를 누를 때 나오는 주문서 작성 페이지
const OrderWritePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const hasAppliedMemberInfo = useRef(false);

  const [ordererName, setOrdererName] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [ordererEmail, setOrdererEmail] = useState("");
  const [ordererEmailError, setOrdererEmailError] = useState("");

  const handleOrdererEmailChange = (e) => {
    const value = e.target.value;
    setOrdererEmail(value);

    if (!value.trim()) {
      setOrdererEmailError("");
      return;
    }

    if (!isValidEmail(value)) {
      setOrdererEmailError("이메일 형식에 맞게 입력해주세요.");
      return;
    }

    setOrdererEmailError("");
  };

  const handleOrdererEmailBlur = () => {
    if (!ordererEmail.trim()) {
      setOrdererEmailError("");
      return;
    }

    if (!isValidEmail(ordererEmail)) {
      setOrdererEmailError("이메일 형식에 맞게 입력해주세요.");
      return;
    }

    setOrdererEmailError("");
  };

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [myCoupons, setMyCoupons] = useState([]);
  const [selectedMemberCouponNo, setSelectedMemberCouponNo] = useState(null);

  const orderData = location.state;
  const orderedCartItemNos = location.state?.orderedCartItemNos || [];
  const orderSource = location.state?.orderSource || "direct";

  const applyMemberInfo = (member, options = {}) => {
    const { includeOrderer = true, includeShipping = true } = options;

    if (!member) return;

    const memberName = getMemberName(member);
    const memberPhone = getMemberPhone(member);
    const memberEmail = getMemberEmail(member);
    const memberZipCode = getMemberZipCode(member);
    const memberBaseAddress = getMemberBaseAddress(member);
    const memberDetailAddress = getMemberDetailAddress(member);

    if (includeOrderer) {
      setOrdererName(memberName);
      setOrdererPhone(memberPhone);
      setOrdererEmail(memberEmail);
    }

    if (includeShipping) {
      setReceiverName(memberName);
      setReceiverPhone(memberPhone);
      setZipCode(memberZipCode);
      setBaseAddress(memberBaseAddress);
      setDetailAddress(memberDetailAddress);
    }
  };

  const toOrderItem = (item, isCartItem = false) => ({
    cartItemNo: isCartItem ? item.cartItemNo : null,
    productOptionNo: item.productOptionNo,
    itemName: item.productName,
    itemColor: isCartItem ? item.color : item.optionColor,
    itemSize: isCartItem ? item.sizeName : item.optionSize,
    quantity: item.quantity,
    unitPrice: isCartItem ? item.price : item.productPrice,
    imageUrl: item.imageUrl,
  });

  const orderItems = useMemo(() => {
    if (!orderData) return [];

    return Array.isArray(orderData.cartItems)
      ? orderData.cartItems.map((item) => toOrderItem(item, true))
      : [toOrderItem(orderData)];
  }, [orderData]);

  useEffect(() => {
    if (!orderData) {
      alert("잘못된 접근입니다.");
      navigate(-1);
    }
  }, [orderData, navigate]);

  useEffect(() => {
    if (!user || hasAppliedMemberInfo.current) return;

    applyMemberInfo(user, {
      includeOrderer: true,
      includeShipping: true,
    });

    hasAppliedMemberInfo.current = true;
  }, [user]);

  useEffect(() => {
    getMyCoupons()
      .then((data) => setMyCoupons(Array.isArray(data) ? data : []))
      .catch(() => setMyCoupons([]));
  }, []);

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

  const totalPrice = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      return sum + Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0);
    }, 0);
  }, [orderItems]);

  const availableCoupons = useMemo(() => {
    const now = new Date();
    return myCoupons.filter(
      (c) =>
        c.usedYn === "N" &&
        (!c.endAt || new Date(c.endAt) >= now) &&
        (!c.startAt || new Date(c.startAt) <= now),
    );
  }, [myCoupons]);

  const discountAmount = useMemo(() => {
    if (!selectedMemberCouponNo) return 0;
    const coupon = availableCoupons.find(
      (c) => Number(c.memberCouponNo) === Number(selectedMemberCouponNo),
    );
    if (!coupon) return 0;
    if (coupon.discountType === "FIXED") return Number(coupon.discountValue);
    if (coupon.discountType === "RATE")
      return Math.floor((totalPrice * Number(coupon.discountValue)) / 100);
    return 0;
  }, [selectedMemberCouponNo, availableCoupons, totalPrice]);

  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const resultItems = useMemo(() => {
    return orderItems.map((item) => ({
      cartItemNo: item.cartItemNo ?? null,
      productOptionNo: item.productOptionNo,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemName: item.itemName,
      itemSize: item.itemSize,
      itemColor: item.itemColor,
      imageUrl: getImageSrc(item.imageUrl),
    }));
  }, [orderItems]);

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

    if (!isValidEmail(ordererEmail)) {
      setOrdererEmailError("이메일 형식에 맞게 입력해주세요.");
      alert("이메일 형식에 맞게 입력해주세요.");
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

    const normalizedOrdererPhone = normalizePhone(ordererPhone);
    const normalizedReceiverPhone = normalizePhone(receiverPhone);

    if (!isValidPhone(normalizedOrdererPhone)) {
      alert(
        "주문자 연락처를 올바른 형식으로 입력해주세요. ('-' 제외 10~11자리 숫자)",
      );
      return;
    }

    if (!isValidPhone(normalizedReceiverPhone)) {
      alert(
        "수령인 연락처를 올바른 형식으로 입력해주세요. ('-' 제외 10~11자리 숫자)",
      );
      return;
    }

    try {
      setSubmitting(true);

      const orderRequest = {
        ordererName,
        ordererPhoneNumber: normalizedOrdererPhone,
        ordererEmail: ordererEmail.trim(),
        receiverName,
        receiverPhoneNumber: normalizedReceiverPhone,
        receiverZipCode: zipCode,
        receiverBaseAddress: baseAddress,
        receiverDetailAddress: detailAddress,
        message,
        totalPrice: finalPrice,
        memberCouponNo: selectedMemberCouponNo || null,
        items: resultItems,
      };

      // 1. 서버에 주문/결제 준비 요청
      const prepared = await preparePayment(orderRequest);

      // 장바구니에서 온 주문이면 orderId 기준으로 cartItemNo 저장
      if (orderSource === "cart" && orderedCartItemNos.length > 0) {
        sessionStorage.setItem(
          `cartOrder:${prepared.orderId}`,
          JSON.stringify(orderedCartItemNos),
        );
      }

      // 쿠폰 사용 시 orderId 기준으로 memberCouponNo 저장 (결제 확정 시 사용처리)
      if (selectedMemberCouponNo) {
        sessionStorage.setItem(
          `couponOrder:${prepared.orderId}`,
          String(selectedMemberCouponNo),
        );
      }

      // prepared 예시:
      // {
      //   orderNo: 1,
      //   orderId: "ORDER_1_20260322",
      //   orderName: "맨투맨 외 2건",
      //   amount: 30000,
      //   customerName: "홍길동",
      //   customerEmail: "a@a.com",
      //   customerMobilePhone: "01012341234"
      // }

      // 2. 토스 SDK 로드
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      // 3. 결제창 인스턴스 생성
      const payment = tossPayments.payment({
        customerKey: `member_${prepared.orderNo}`,
      });

      // 4. 결제창 호출
      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: prepared.amount,
        },
        orderId: prepared.orderId,
        orderName: prepared.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: prepared.customerEmail,
        customerName: prepared.customerName,
        customerMobilePhone: prepared.customerMobilePhone,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderData) {
    return null;
  }

  return (
    <>
      <Header />
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
                  <span>{orderItems.length}개 상품</span>
                </div>

                <div className="order-item-list">
                  {orderItems.map((item, index) => {
                    const itemTotalPrice =
                      Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0);

                    return (
                      <div
                        className="order-item-card"
                        key={item.productOptionNo ?? index}
                      >
                        <div className="order-item-image-wrap">
                          {item.imageUrl ? (
                            <img
                              src={getImageSrc(item.imageUrl)}
                              alt={item.itemName}
                              className="order-item-image"
                            />
                          ) : (
                            <div className="order-item-image no-image">
                              이미지 없음
                            </div>
                          )}
                        </div>

                        <div className="order-item-info">
                          <p className="order-item-name">{item.itemName}</p>

                          {item.itemColor || item.itemSize ? (
                            <p className="order-item-option">
                              옵션: {item.itemColor} / {item.itemSize}
                            </p>
                          ) : (
                            <p className="order-item-option">옵션 없음</p>
                          )}

                          <p className="order-item-quantity">
                            수량: {item.quantity}개
                          </p>
                        </div>

                        <div className="order-item-price-box">
                          <p className="unit-price">
                            {Number(item.unitPrice).toLocaleString()}원
                          </p>
                          <p className="total-price">
                            {itemTotalPrice.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="order-section">
                <div className="section-header with-description">
                  <div>
                    <h2>주문자 정보</h2>
                    <p className="section-description">
                      회원가입 시 등록한 정보가 자동으로 입력되며,
                      마이페이지-회원정보수정에서 수정 가능합니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="copy-button"
                    onClick={() =>
                      applyMemberInfo(user, {
                        includeOrderer: true,
                        includeShipping: false,
                      })
                    }
                  >
                    회원 정보 다시 불러오기
                  </button>
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
                      placeholder="‘-’ 없이 숫자만 입력해 주세요"
                      value={ordererPhone}
                      onChange={(e) =>
                        setOrdererPhone(e.target.value.replace(/[^0-9]/g, ""))
                      }
                    />
                  </div>

                  <div className="form-row full">
                    <label>이메일</label>
                    <input
                      type="email"
                      inputMode="email"
                      placeholder="example@email.com"
                      value={ordererEmail}
                      onChange={handleOrdererEmailChange}
                      onBlur={handleOrdererEmailBlur}
                      className={ordererEmailError ? "input-error" : ""}
                    />

                    {ordererEmailError && (
                      <span className="field-error-message">
                        {ordererEmailError}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="order-section">
                <div className="section-header with-description">
                  <div>
                    <h2>배송지 정보</h2>
                  </div>

                  <div className="section-button-group">
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

                    <button
                      type="button"
                      className="copy-button"
                      onClick={() =>
                        applyMemberInfo(user, {
                          includeOrderer: false,
                          includeShipping: true,
                        })
                      }
                    >
                      기본 배송지 다시 불러오기
                    </button>
                  </div>
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
                      placeholder="‘-’ 없이 숫자만 입력해 주세요"
                      value={receiverPhone}
                      onChange={(e) =>
                        setReceiverPhone(e.target.value.replace(/[^0-9]/g, ""))
                      }
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

                {/* 쿠폰 섹션 */}
                <div className="coupon-section">
                  <div className="coupon-section-header">
                    <span className="coupon-section-title">쿠폰 적용</span>
                    <span
                      className={`coupon-count-badge${availableCoupons.length === 0 ? " empty" : ""}`}
                    >
                      {availableCoupons.length > 0
                        ? `${availableCoupons.length}장 보유`
                        : "보유 없음"}
                    </span>
                  </div>

                  <select
                    className="coupon-select"
                    value={selectedMemberCouponNo || ""}
                    onChange={(e) =>
                      setSelectedMemberCouponNo(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    disabled={availableCoupons.length === 0}
                  >
                    <option value="">
                      {availableCoupons.length === 0
                        ? "사용 가능한 쿠폰 없음"
                        : "쿠폰을 선택하세요"}
                    </option>
                    {availableCoupons.map((c) => (
                      <option key={c.memberCouponNo} value={c.memberCouponNo}>
                        {c.couponName} —{" "}
                        {c.discountType === "FIXED"
                          ? `${Number(c.discountValue).toLocaleString()}원 할인`
                          : `${c.discountValue}% 할인`}
                      </option>
                    ))}
                  </select>

                  {discountAmount > 0 &&
                    (() => {
                      const applied = availableCoupons.find(
                        (c) =>
                          Number(c.memberCouponNo) ===
                          Number(selectedMemberCouponNo),
                      );
                      return (
                        <div className="coupon-applied-info">
                          <span className="coupon-applied-name">
                            {applied?.couponName}
                          </span>
                          <span className="coupon-applied-discount">
                            -{discountAmount.toLocaleString()}원
                          </span>
                        </div>
                      );
                    })()}
                </div>

                <div className="summary-detail">
                  <div className="summary-row">
                    <span>구매상품</span>
                    <strong>{totalPrice.toLocaleString()}원</strong>
                  </div>

                  <div className="summary-row">
                    <span>배송비</span>
                    <strong>0원</strong>
                  </div>

                  {discountAmount > 0 && (
                    <div className="summary-row">
                      <span>쿠폰 할인</span>
                      <strong style={{ color: "#c62828" }}>
                        -{discountAmount.toLocaleString()}원
                      </strong>
                    </div>
                  )}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row grand-total">
                  <span>총 결제 금액</span>
                  <strong>{finalPrice.toLocaleString()}원</strong>
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
    </>
  );
};

export default OrderWritePage;
