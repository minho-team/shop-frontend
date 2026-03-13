import { Link, useLocation } from "react-router-dom";
import "../../css/admin/AdminNavbar.css";

const AdminNavbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-inner">
        <ul className="admin-menu-list">
          <li className={`admin-menu-item ${location.pathname === "/admin" ? "active" : ""}`}>
            <Link to="/admin">대시보드</Link>
          </li>

          <li className={`admin-menu-item dropdown ${isActive("/admin/members") ? "active" : ""}`}>
            <button type="button" className="admin-menu-button">
              회원 관리
            </button>
            <ul className="admin-dropdown-menu">
              <li>
                <Link to="/admin/members">회원 목록</Link>
              </li>
            </ul>
          </li>

          <li className={`admin-menu-item dropdown ${isActive("/admin/categories") ? "active" : ""}`}>
            <button type="button" className="admin-menu-button">
              카테고리 관리
            </button>
            <ul className="admin-dropdown-menu">
              <li>
                <Link to="/admin/categories">카테고리 목록</Link>
              </li>
              <li>
                <Link to="/admin/categories/add">카테고리 추가</Link>
              </li>
              <li>
                <Link to="/admin/categories/edit">카테고리 수정</Link>
              </li>
            </ul>
          </li>

          <li className={`admin-menu-item dropdown ${isActive("/admin/products") ? "active" : ""}`}>
            <button type="button" className="admin-menu-button">
              상품 관리
            </button>
            <ul className="admin-dropdown-menu">
              <li>
                <Link to="/admin/products">상품 목록</Link>
              </li>
              <li>
                <Link to="/admin/products/add">상품 등록</Link>
              </li>
              <li>
                <Link to="/admin/products/edit">상품 수정</Link>
              </li>
              <li>
                <Link to="/admin/products/inventory">상품 옵션 / 재고 관리</Link>
              </li>
            </ul>
          </li>

          <li className={`admin-menu-item dropdown ${isActive("/admin/orders") ? "active" : ""}`}>
            <button type="button" className="admin-menu-button">
              주문 관리
            </button>
            <ul className="admin-dropdown-menu">
              <li>
                <Link to="/admin/orders">주문 목록</Link>
              </li>
              <li>
                <Link to="/admin/orders/refunds">환불 관리</Link>
              </li>
            </ul>
          </li>

          <li className={`admin-menu-item dropdown ${isActive("/admin/inquiries") || isActive("/admin/faqs") ? "active" : ""}`}>
            <button type="button" className="admin-menu-button">
              문의 관리
            </button>
            <ul className="admin-dropdown-menu">
              <li>
                <Link to="/admin/inquiries">1:1 문의</Link>
              </li>
              <li>
                <Link to="/admin/faqs">FAQ 관리</Link>
              </li>
            </ul>
          </li>

          <li className="admin-menu-item admin-user-page-link">
            <Link to="/">사용자 페이지로</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;