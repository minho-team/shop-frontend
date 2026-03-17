import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const AdminProductDetailPage = () => {

    //화면이 랜더링될때 가장 위쪽 스크롤로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { productNo } = useParams();
    return (<>
        <AdminHeader />
        <AdminLayout>
            <p>AdminProductDetailPage</p>
            <p>상품 번호:{productNo}</p>

        </AdminLayout>
    </>)
}

export default AdminProductDetailPage;