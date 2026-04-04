import { useNavigate } from "react-router-dom";
import "../../css/user/RegisterResultPage.css";
import Header from "../../components/user/Header";

const RegisterResultPage = () => {
  const navigate = useNavigate();

  return (
    <>
    <Header/>
    <div className="register-result-page">
      <div className="register-result-container">
        <section className="result-top-box">

          <div className="result-icon">✓</div>

          <h1 className="result-main-title">
            회원가입이 완료되었습니다
          </h1>

          <p className="result-message">
            환영합니다!
            <br />
            지금 바로 다양한 상품을 만나보세요.
          </p>

          <div className="coupon-box">
            <p className="coupon-title">
              🎉 신규 가입 기념 쿠폰이 발급되었습니다
            </p>
            <p className="coupon-desc">
              3,000원 할인 쿠폰이 지급되었어요.
              로그인 후 마이페이지에서 확인할 수 있어요!
            </p>
          </div>

          <div className="result-button-wrap">           
            <button
              className="result-dark-button"
              onClick={() => navigate("/login")}
            >
              로그인하기
            </button>
          </div>
        </section>
      </div>
    </div>
    </>
    
  );
};

export default RegisterResultPage;