import { useNavigate } from "react-router-dom";
import "../../css/admin/AdminHeader.css";

const AdminHeader = ({ pageTitle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: 로그아웃 로직
    alert("로그아웃 처리 필요");
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        {/* 왼쪽 - 로고 */}
        <div className="admin-header-left">
          <h2
            className="admin-logo"
            onClick={() => navigate("/admin/dashboard")}
          >
            SHOP ADMIN
          </h2>
        </div>

        {/* 오른쪽 - 관리자 정보 */}
        <div className="admin-header-right">
          <span className="admin-user">관리자님</span>

          <button className="admin-logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
