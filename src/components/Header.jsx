import { useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../css//Header.css";

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

  const renderMegaMenu = (categories, basePath) => {
    return (
      <div
        className="mega-menu"
        onMouseEnter={() => setOpenMenu(basePath)}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="mega-menu-inner">
          <div className="mega-menu-side">
            <Link to={`${basePath}`} className="mega-side-link">
              ALL
            </Link>
            <Link to={`${basePath}/new`} className="mega-side-link">
              NEW
            </Link>
            <Link to={`${basePath}/outlet`} className="mega-side-link outlet">
              OUTLET
            </Link>
          </div>

          <div className="mega-menu-columns">
            {Object.entries(categories).map(([title, items]) => (
              <div key={title} className="mega-column">
                <h6>{title}</h6>
                {items.map((item) => (
                  <Link
                    key={item}
                    to={`${basePath}/category/${encodeURIComponent(item)}`}
                    className="mega-item"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="mega-menu-right">
            <div className="mega-preview-box">이미지영역1</div>
            <div className="mega-preview-box">이미지영역2</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <header
      className="header-wrapper"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <Navbar expand="lg" className="header-navbar">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            민호팀
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar-nav" />

          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="main-nav">
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

            <Nav className="icon-text-nav ms-auto">
              <Nav.Link as={Link} to="/contact" className="nav-link-custom">
                문의
              </Nav.Link>
              <Nav.Link as={Link} to="/mypage" className="nav-link-custom">
                마이페이지
              </Nav.Link>
              <Nav.Link as={Link} to="/search" className="nav-link-custom">
                검색
              </Nav.Link>
              <Nav.Link as={Link} to="/wishlist" className="nav-link-custom">
                찜
              </Nav.Link>
              <Nav.Link as={Link} to="/cart" className="nav-link-custom">
                장바구니
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {openMenu === "/men" && renderMegaMenu(menCategories, "/men")}
      {openMenu === "/women" && renderMegaMenu(womenCategories, "/women")}
    </header>
  );
};

export default Header;