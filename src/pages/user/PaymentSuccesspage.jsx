import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPayment } from "../../api/user/ordersApi";

const PaymentSuccessPage = () => {
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

      try {
        const result = await confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });

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

export default PaymentSuccessPage;