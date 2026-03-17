import { useState, useEffect } from "react";
import { Container, Nav } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { logout } from "../api/authApi";
import "../css/Header.css";

const menCategories = {
  아우터: [
    { id: 111, name: "코트" },
    { id: 112, name: "파카" },
    { id: 113, name: "자켓" },
    { id: 114, name: "가디건" },
  ],
  상의: [
    { id: 121, name: "니트" },
    { id: 122, name: "셔츠" },
    { id: 123, name: "스웨트 셔츠" },
    { id: 124, name: "긴팔" },
    { id: 125, name: "반팔" },
  ],
  하의: [
    { id: 131, name: "긴바지" },
    { id: 132, name: "반바지" },
    { id: 133, name: "데님" },
  ],
  악세서리: [
    { id: 141, name: "가방" },
    { id: 142, name: "슈즈" },
    { id: 143, name: "주얼리" },
    { id: 144, name: "잡화" },
  ],
};

const womenCategories = {
  아우터: [
    { id: 211, name: "코트" },
    { id: 212, name: "파카" },
    { id: 213, name: "자켓" },
    { id: 214, name: "가디건" },
  ],
  상의: [
    { id: 221, name: "니트" },
    { id: 222, name: "셔츠" },
    { id: 223, name: "스웨트 셔츠" },
    { id: 224, name: "긴팔" },
    { id: 225, name: "반팔" },
  ],
  하의: [
    { id: 231, name: "긴바지" },
    { id: 232, name: "반바지" },
    { id: 233, name: "데님" },
  ],
  악세서리: [
    { id: 241, name: "가방" },
    { id: 242, name: "슈즈" },
    { id: 243, name: "주얼리" },
    { id: 244, name: "잡화" },
  ],
};

const menSectionIds = {
  아우터: 11,
  상의: 12,
  하의: 13,
  악세서리: 14,
};

const womenSectionIds = {
  아우터: 21,
  상의: 22,
  하의: 23,
  악세서리: 24,
};

const Header = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("keyword") || "";
  });

  const { user, setUser } = useUser();
  const nav = useNavigate();
  const location = useLocation();

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchKeyword(params.get("keyword") || "");
  }, [location.search]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      nav("/");
    } catch (err) {
      console.log("로그아웃 실패", err);
    }
  };

  const moveCategory = (categoryId) => {
    const params = new URLSearchParams(location.search);

    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }

    nav(`/?${params.toString()}`);
    setOpenMenu(null);
  };

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    const params = new URLSearchParams(location.search);

    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }

    nav(`/?${params.toString()}`);
    setOpenMenu(null);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const renderMegaMenu = (
    categories,
    sectionIds,
    mainCategoryId,
    previewImages,
  ) => {
    return (
      <div className="mega-menu">
        <Container fluid className="mega-menu-inner">
          <div className="mega-menu-side">
            <Nav.Link
              as="button"
              className="mega-side-link"
              onClick={() => moveCategory(mainCategoryId)}
            >
              ALL
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/products?filter=new"
              className="mega-side-link"
            >
              NEW
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/products?filter=outlet"
              className="mega-side-link outlet"
            >
              OUTLET
            </Nav.Link>
          </div>

          <div className="mega-menu-columns">
            {Object.entries(categories).map(([title, items]) => (
              <div key={title} className="mega-column">
                <h6
                  style={{ cursor: "pointer" }}
                  onClick={() => moveCategory(sectionIds[title])}
                >
                  {title}
                </h6>

                {items.map((item) => (
                  <Nav.Link
                    as="button"
                    key={item.id}
                    className="mega-item"
                    onClick={() => moveCategory(item.id)}
                  >
                    {item.name}
                  </Nav.Link>
                ))}
              </div>
            ))}
          </div>

          <div className="mega-menu-right">
            <div className="mega-preview-box">
              <img
                src={previewImages[0]}
                alt="카테고리 미리보기 1"
                className="mega-preview-image"
              />
            </div>

            <div className="mega-preview-box">
              <img
                src={previewImages[1]}
                alt="카테고리 미리보기 2"
                className="mega-preview-image"
              />
            </div>
          </div>
        </Container>
      </div>
    );
  };

  return (
    <header className="header-wrapper">
      <div className="top-banner">
        1. 신규회원! 3000원 할인쿠폰 즉시 사용가능!
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
                  to="/admin/home"
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
          <div className="brand-logo-image">
            <img src="/images/logo.png" alt="ERDIN 로고" />
          </div>
          <div className="brand-copy">
            <strong>ERDIN</strong>
            <span>SELECT SHOP</span>
          </div>
        </Link>
      </Container>

      <div className="nav-area" onMouseLeave={() => setOpenMenu(null)}>
        <Container fluid className="nav-row">
          <div className="nav-left-group">
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
                <Nav.Link
                  as="button"
                  className="nav-link-custom"
                  onClick={() => moveCategory(1)}
                >
                  남성
                </Nav.Link>
              </div>

              <div
                className="nav-hover-item"
                onMouseEnter={() => setOpenMenu("/women")}
              >
                <Nav.Link
                  as="button"
                  className="nav-link-custom"
                  onClick={() => moveCategory(2)}
                >
                  여성
                </Nav.Link>
              </div>
            </Nav>
          </div>

          <div className="header-search-box">
            <input
              type="text"
              className="header-search-input"
              placeholder="상품명을 검색하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              type="button"
              className="header-search-btn"
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </Container>

        {openMenu === "/men" &&
          renderMegaMenu(menCategories, menSectionIds, 1, [
            "/images/menu-men-1.jpg",
            "/images/menu-men-2.jpg",
          ])}

        {openMenu === "/women" &&
          renderMegaMenu(womenCategories, womenSectionIds, 2, [
            "/images/menu-women-1.jpg",
            "/images/menu-women-2.jpg",
          ])}
      </div>
    </header>
  );
};

export default Header;
