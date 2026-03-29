import { useNavigate } from "react-router-dom";
import { logout } from "../../api/common/authApi.jsx";
import { useUser } from "../../context/UserContext.jsx";
import "../../css/admin/AdminHeader.css";

const AdminHeader = ({ pageTitle }) => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogout = async () => {
    try {
      await logout();

      // 프론트 저장값 정리
      localStorage.removeItem("member");
      localStorage.removeItem("login");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("member");
      sessionStorage.removeItem("login");

      // 가장 중요: 전역 로그인 상태 초기화
      setUser(null);

      alert("로그아웃 되었습니다.");

      navigate("/", { replace: true });
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="admin-header-left">
          <h2
            className="admin-logo"
            onClick={() => navigate("/admin/dashboard")}
          >
            SHOP ADMIN
          </h2>
        </div>

        <div className="admin-header-right">
          <span className="admin-user">관리자님</span>
          <div>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
