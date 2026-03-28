import "../../css/common/TestNoticeBanner.css";

const TestNoticeBanner = () => {
  return (
    <section className="test-notice-banner">
      <div className="test-notice-inner">
        <span className="test-notice-label">TEST NOTICE</span>
        <h4>본 페이지는 테스트 목적의 페이지입니다.</h4>
        <p>
          실제 판매 상품이 아니며, 테스트 결제 환경으로 운영됩니다. 실제 청구 및 배송은 이루어지지 않습니다.
        </p>
      </div>
    </section>
  );
};

export default TestNoticeBanner;