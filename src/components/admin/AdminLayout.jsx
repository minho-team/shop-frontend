import AdminHeader from "./AdminHeader";
import Footer from "../user/Footer";
import AdminNavbar from "./AdminNavbar";
import "../../css/admin/AdminLayout.css";

const AdminLayout = ({ children, pageTitle, contentClassName = "" }) => {
  return (
    <div className="admin-layout-wrapper">
      <AdminHeader pageTitle={pageTitle} />
      <AdminNavbar />

      <main className="admin-content-wrap">
        <div className={`admin-content-inner ${contentClassName}`}>
          <div className="admin-page-content">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLayout;
