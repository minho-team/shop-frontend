import AdminHeader from "../../components/admin/AdminHeader";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../css/admin/AdminHome.css";



const AdminHome = () => {
  return (
    <>
      <AdminHeader />
      <AdminLayout pageTitle="관리자 대시보드">
        <div className="admin-home-wrap">
          <section className="admin-home-card">
            <h3 className="admin-home-card-title">관리자 홈</h3>
          </section>

          <section className="admin-home-card">
            <h4 className="admin-home-card-title">추후 연결할 메뉴</h4>
            <ul className="admin-home-menu-list">
              <li>회원 관리</li>
              <li>카테고리 관리</li>
              <li>상품 관리</li>
              <li>주문 관리</li>
              <li>문의 관리</li>
            </ul>
          </section>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminHome;
