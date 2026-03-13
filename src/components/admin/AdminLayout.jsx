import Header from "../Header";
import Footer from "../Footer";
import AdminNavbar from "./AdminNavbar";
import "../../css/admin/AdminLayout.css";

const AdminLayout = ({ children, pageTitle }) => {
  return (
    <div className="admin-layout-wrapper">

      <AdminNavbar />

      <main className="admin-content-wrap">
        <div className="admin-content-inner">
          {pageTitle && (
            <div className="admin-page-title-box">
              <h2 className="admin-page-title">{pageTitle}</h2>
            </div>
          )}
          <div className="admin-page-content">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default AdminLayout;
