import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPayment } from "../../api/user/ordersApi";

const TempPaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        alert("결제 승인 정보가 올바르지 않습니다.");
        navigate("/");
        return;
      }

      // 결제 전 저장해둔 장바구니 상품 번호(cartItemNo) 목록 복원
      const savedCartItemNos = sessionStorage.getItem(`cartOrder:${orderId}`);
      const orderedCartItemNos = savedCartItemNos
        ? JSON.parse(savedCartItemNos)
        : [];

      // 결제 전 저장해둔 쿠폰 번호 복원
      const savedCouponNo = sessionStorage.getItem(`couponOrder:${orderId}`);
      const memberCouponNo = savedCouponNo ? Number(savedCouponNo) : null;

      try {
        const result = await confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
          orderedCartItemNos,
          memberCouponNo,
        });

        // 결제 승인 후 더 이상 필요 없는 임시 저장 데이터 삭제
        sessionStorage.removeItem(`cartOrder:${orderId}`);
        sessionStorage.removeItem(`couponOrder:${orderId}`);

        navigate("/order/result", {
          state: {
            orderNo: result.orderNo,
            totalPrice: result.amount,
            createdAt: result.approvedAt,
            ordererName: result.ordererName,
            items: result.items,
          },
          replace: true,
        });
      } catch (error) {
        console.error("결제 승인 실패:", error);
        alert("결제 승인에 실패했습니다.");
        navigate("/payment/fail", { replace: true });
      }
    };

    run();
  }, [searchParams, navigate]);

  return <div>결제 승인 처리 중...</div>;
};

export default TempPaymentSuccessPage;
