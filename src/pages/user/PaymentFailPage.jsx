import { useSearchParams } from "react-router-dom";

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div>
      <h2>결제 실패</h2>
      <p>코드: {code}</p>
      <p>메시지: {message}</p>
    </div>
  );
};

export default PaymentFailPage;