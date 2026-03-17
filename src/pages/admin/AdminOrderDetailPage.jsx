import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { useParams } from "react-router-dom";

const AdminOrderDetailPage = () => {

    const { orderNo } = useParams();
    return (<>
        <AdminHeader />
        <AdminLayout>
            <p>어드민 주문 디테일</p>
            <p>{orderNo}</p>
        </AdminLayout>

    </>)
}

export default AdminOrderDetailPage;