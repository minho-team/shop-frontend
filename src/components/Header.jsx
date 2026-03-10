import { useState } from "react";
import { Container, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { logout } from "../api/authApi";
import "../css/Header.css";

const menCategories = {
  아우터: ["코트", "패딩", "자켓", "가디건"],
  상의: ["니트", "셔츠", "스웨트 셔츠", "긴팔", "반팔"],
  하의: ["긴바지", "반바지", "데님"],
  악세서리: ["가방", "슈즈", "주얼리", "잡화"],
};

const womenCategories = {
  아우터: ["코트", "자켓", "가디건", "블레이저"],
  상의: ["블라우스", "니트", "셔츠", "긴팔", "반팔"],
  하의: ["슬랙스", "스커트", "데님"],
  악세서리: ["가방", "슈즈", "주얼리", "잡화"],
};

const Header = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const { user, setUser } = useUser();
  const nav = useNavigate();

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      nav("/");
    } catch (err) {
      console.log("로그아웃 실패", err);
    }
  };

  const renderMegaMenu = (categories, basePath) => {
    return (
      <div className="mega-menu">
        <Container fluid className="mega-menu-inner">
          <div className="mega-menu-side">
            <Nav.Link as={Link} to={`${basePath}`} className="mega-side-link">
              ALL
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={`${basePath}/new`}
              className="mega-side-link"
            >
              NEW
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={`${basePath}/outlet`}
              className="mega-side-link outlet"
            >
              OUTLET
            </Nav.Link>
          </div>

          <div className="mega-menu-columns">
            {Object.entries(categories).map(([title, items]) => (
              <div key={title} className="mega-column">
                <h6>{title}</h6>
                {items.map((item) => (
                  <Nav.Link
                    as={Link}
                    key={item}
                    to={`${basePath}/category/${encodeURIComponent(item)}`}
                    className="mega-item"
                  >
                    {item}
                  </Nav.Link>
                ))}
              </div>
            ))}
          </div>

          <div className="mega-menu-right">
            <div className="mega-preview-box">이미지영역1</div>
            <div className="mega-preview-box">이미지영역2</div>
          </div>
        </Container>
      </div>
    );
  };

  return (
    <header className="header-wrapper">
      <div className="top-banner">
        1.신규회원! 3000원 할인쿠폰 즉시 사용가능!
      </div>

      <Container fluid className="utility-row">
        <div className="utility-inner">
          <Nav className="utility-left">
            {!user && (
              <>
                <Nav.Link as={Link} to="/login" className="utility-link">
                  로그인
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="utility-link">
                  회원가입
                </Nav.Link>
              </>
            )}

            <Nav.Link as={Link} to="/cart" className="utility-link">
              장바구니
            </Nav.Link>
            <Nav.Link as={Link} to="/mypage" className="utility-link">
              마이페이지
            </Nav.Link>
            <Nav.Link as={Link} to="/inquiry" className="utility-link">
              문의
            </Nav.Link>
          </Nav>

          {user && (
            <Nav className="utility-right">
              {isAdmin && (
                <Nav.Link
                  as={Link}
                  to="/admin"
                  className="utility-link admin-page-btn"
                >
                  관리자 페이지로
                </Nav.Link>
              )}

              <span className="utility-link utility-user-text">
                {user.memberId}님
              </span>

              <Nav.Link
                as="button"
                onClick={handleLogout}
                className="utility-link utility-logout-btn"
              >
                로그아웃
              </Nav.Link>
            </Nav>
          )}
        </div>
      </Container>

      <Container fluid className="brand-row">
        <Link to="/" className="brand-center">
          <div className="brand-logo-image">LOGO</div>
          <div className="brand-copy">
            <strong>민호팀</strong>
            <span>쇼핑몰</span>
          </div>
        </Link>
      </Container>

      <div className="nav-area" onMouseLeave={() => setOpenMenu(null)}>
        <Container fluid className="nav-row">
          <button type="button" className="menu-button" aria-label="menu">
            <span />
            <span />
            <span />
          </button>

          <Nav className="category-nav">
            <div
              className="nav-hover-item"
              onMouseEnter={() => setOpenMenu("/men")}
            >
              <Nav.Link as={Link} to="/men" className="nav-link-custom">
                남성
              </Nav.Link>
            </div>

            <div
              className="nav-hover-item"
              onMouseEnter={() => setOpenMenu("/women")}
            >
              <Nav.Link as={Link} to="/women" className="nav-link-custom">
                여성
              </Nav.Link>
            </div>
          </Nav>
        </Container>

        {openMenu === "/men" && renderMegaMenu(menCategories, "/men")}
        {openMenu === "/women" && renderMegaMenu(womenCategories, "/women")}
      </div>
    </header>
  );
};

export default Header;