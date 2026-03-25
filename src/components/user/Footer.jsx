import { Link } from "react-router-dom";
import "../../css/common/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top-menu">
        <Link to="/" className="footer-top-link">
          홈으로
        </Link>

        <span className="footer-top-link disabled">회사소개</span>
        <span className="footer-top-link disabled">이용약관</span>
        <span className="footer-top-link disabled">개인정보처리방침</span>
        <span className="footer-top-link disabled">이용안내</span>
      </div>

      <div className="footer-main">
        <div className="footer-col footer-company">
          <h2 className="footer-logo">ERDIN SELECT SHOP</h2>

          <p>COMPANY : 에르딘(주) / CEO : 강민호</p>
          <p>CALL CENTER : 1111-2222</p>
          <p>
            ADDRESS : 서울특별시 강남구 테헤란로14길 6 남도빌딩 2F, 3F,
            4F, 5F, 6F
          </p>
          <p>개인정보관리책임자 : 강민호</p>
          <p>
            사업자등록번호 : 333-33-33333{" "}
          </p>
          <p>통신판매업 신고번호 : 제3333-서울-0333호</p>
        </div>

        <div className="footer-col footer-center">
          <div className="footer-block">
            <h3>CS CENTER</h3>
            <strong className="footer-phone">1111-2222</strong>
            <p>월 - 금 : 09:00 ~ 17:50</p>
            <p>토,일,공휴일 CLOSE</p>
            <p>점심시간 : 12:50 ~ 14:00</p>
          </div>

          <div className="footer-divider" />

          <div className="footer-block">
            <h3>RETURN / EXCHANGE</h3>
            <p>
              서울특별시 강남구 테헤란로14길 6 남도빌딩 2F, 3F, 4F,
              5F, 6F (에르딘)
            </p>
          </div>
        </div>

        <div className="footer-col footer-bank">
          <h3>BANK ACCOUNT</h3>
          <p>신한 111-222-333333</p>
          <p>예금주: 에르딘</p>
          <div className="footer-bank-line" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;