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
          <h2 className="footer-logo">쇼핑몰 팀프로젝트</h2>

          <p>포트폴리오 용 테스트 페이지입니다.</p>
          <p>CALL CENTER : 1111-2222</p>
          <p>
            ADDRESS : 포트폴리오 용 테스트 페이지입니다.
          </p>
          <p>개인정보관리책임자 : 강민호</p>
          <p>
            포트폴리오 용 테스트 페이지입니다.{" "}
          </p>
          <p>포트폴리오 용 테스트 페이지입니다.</p>
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
              포트폴리오 용 테스트 페이지입니다.
            </p>
          </div>
        </div>

        <div className="footer-col footer-bank">
          <h3>프로젝트명: 에르딘(쇼핑몰)</h3>
          <p>운영주체: kh국비 교육과정 팀프로젝트</p>
          <p>문의 이메일: busster@naver.com (팀장 강민호)</p>
          <div className="footer-bank-line" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;