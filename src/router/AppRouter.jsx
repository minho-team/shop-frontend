import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useParams,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/user/Loading";
import { useUser, UserProvider } from "../context/UserContext";

//user
const MainHome = lazy(() => import("../pages/user/MainHome"));
const LoginPage = lazy(() => import("../pages/user/LoginPage"));
const CartPage = lazy(() => import("../pages/user/CartPage"));
const MyPage = lazy(() => import("../pages/user/MyPage"));
const InquiryPage = lazy(() => import("../pages/user/InquiryPage"));
const InquiryWritePage = lazy(() => import("../pages/user/InquiryWritePage"));
const InquiryMyPage = lazy(() => import("../pages/user/InquiryMyPage"));
const RegisterPage = lazy(() => import("../pages/user/RegisterPage"));
const ProductDetailPage = lazy(() => import("../pages/user/ProductDetailPage"));
const FaqDetailPage = lazy(() => import("../pages/user/FaqDetailPage"));
const InquiryMyDetailPage = lazy(
  () => import("../pages/user/InquiryMyDetailPage"),
);
const OrderWritePage = lazy(() => import("../pages/user/OrderWritePage"));
const OrderResultPage = lazy(() => import("../pages/user/OrderResultPage"));
const MyOrderDetailPage = lazy(() => import("../pages/user/MyOrderDetailPage"));
const ReviewWritePage = lazy(() => import("../pages/user/ReviewWritePage"));
const KakaoRedirectPage = lazy(() => import("../pages/user/KakaoRedirectPage"));
const RefundPage = lazy(() => import("../pages/user/RefundPage"));
const PaymentSuccessPage = lazy(
  () => import("../pages/user/PaymentSuccessPage"),
);
const PaymentFailPage = lazy(() => import("../pages/user/PaymentFailPage"));

//admin
const AdminHome = lazy(() => import("../pages/admin/AdminHome"));
const AdminMemberListPage = lazy(
  () => import("../pages/admin/AdminMemberListPage"),
);
const AdminCategoryListPage = lazy(
  () => import("../pages/admin/AdminCategoryListPage"),
);
const AdminCategoryAddPage = lazy(
  () => import("../pages/admin/AdminCategoryAddPage"),
);
const AdminCategoryEditPage = lazy(
  () => import("../pages/admin/AdminCategoryEditPage"),
);
const AdminProductListPage = lazy(
  () => import("../pages/admin/AdminProductListPage"),
);
const AdminProductAddPage = lazy(
  () => import("../pages/admin/AdminProductAddPage"),
);
const AdminProductEditPage = lazy(
  () => import("../pages/admin/AdminProductEditPage"),
);
const AdminProductInventoryPage = lazy(
  () => import("../pages/admin/AdminProductInventoryPage"),
);
const AdminOrderListPage = lazy(
  () => import("../pages/admin/AdminOrderListPage"),
);
const AdminRefundPage = lazy(() => import("../pages/admin/AdminRefundPage"));
const AdminInquiryPage = lazy(() => import("../pages/admin/AdminInquiryPage"));
const AdminFaqPage = lazy(() => import("../pages/admin/AdminFaqPage"));
const AdminOrderDetailPage = lazy(
  () => import("../pages/admin/AdminOrderDetailPage"),
);
const AdminProductDetailPage = lazy(
  () => import("../pages/admin/AdminProductDetailPage"),
);
const AdminMemberDetailPage = lazy(
  () => import("../pages/admin/AdminMemberDetailPage"),
);
const AdminMemberEditPage = lazy(
  () => import("../pages/admin/AdminMemberEditPage"),
);
const AdminRefundDetailPage = lazy(
  () => import("../pages/admin/AdminRefundDetailPage"),
);
const AdminDashboardPage = lazy(
  () => import("../pages/admin/AdminDashboardPage"),
);

// 로그인이 안 돼 있으면 /login페이지로 리다이렉트
const ProtectedRouteWrapper = ({ Component }) => {
  const { user, loading } = useUser();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
};

// 관리자만 통과할 수 있는 가드
const AdminRouteWrapper = ({ Component }) => {
  const { user, loading } = useUser();

  if (loading) return <Loading />;
  if (!user || !user.roles?.includes("ROLE_ADMIN")) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
};

// 라우터 정의
const AppRouterContent = () => {
  const router = createBrowserRouter([
    /*누구나 들어올 수 있는 페이지*/
    { path: "/", element: <MainHome /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/inquiry", element: <InquiryPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/product/detail/:id", element: <ProductDetailPage /> },
    { path: "/faq/detail/:id", element: <FaqDetailPage /> },
    { path: "/member/kakao", element: <KakaoRedirectPage /> },

    /* 관리자만 들어올 수 있는 페이지 */
    {
      path: "/admin/home",
      element: <AdminRouteWrapper Component={AdminHome} />,
    },
    {
      path: "/admin/dashboard",
      element: <AdminRouteWrapper Component={AdminDashboardPage} />,
    },
    {
      path: "/admin/members",
      element: <AdminRouteWrapper Component={AdminMemberListPage} />,
    },
    {
      path: "/admin/categories",
      element: <AdminRouteWrapper Component={AdminCategoryListPage} />,
    },
    {
      path: "/admin/categories/add",
      element: <AdminRouteWrapper Component={AdminCategoryAddPage} />,
    },
    {
      path: "/admin/categories/edit",
      element: <AdminRouteWrapper Component={AdminCategoryEditPage} />,
    },
    {
      path: "/admin/products",
      element: <AdminRouteWrapper Component={AdminProductListPage} />,
    },
    {
      path: "/admin/products/add",
      element: <AdminRouteWrapper Component={AdminProductAddPage} />,
    },
    {
      path: "/admin/products/edit",
      element: <AdminRouteWrapper Component={AdminProductEditPage} />,
    },
    {
      path: "/admin/products/inventory",
      element: <AdminRouteWrapper Component={AdminProductInventoryPage} />,
    },
    {
      path: "/admin/products/detail/:productNo",
      element: <AdminRouteWrapper Component={AdminProductDetailPage} />,
    },

    {
      path: "/admin/orders",
      element: <AdminRouteWrapper Component={AdminOrderListPage} />,
    },
    {
      path: "/admin/orders/refunds",
      element: <AdminRouteWrapper Component={AdminRefundPage} />,
    },

    {
      path: "/admin/inquiries",
      element: <AdminRouteWrapper Component={AdminInquiryPage} />,
    },
    {
      path: "/admin/faqs",
      element: <AdminRouteWrapper Component={AdminFaqPage} />,
    },
    {
      path: "/admin/order/detail/:orderNo",
      element: <AdminRouteWrapper Component={AdminOrderDetailPage} />,
    },
    {
      path: "/admin/member/detail/:memberNo",
      element: <AdminRouteWrapper Component={AdminMemberDetailPage} />,
    },
    {
      path: "/admin/member/edit/:memberNo",
      element: <AdminRouteWrapper Component={AdminMemberEditPage} />,
    },
    {
      path: "/admin/refund/detail/:refundNo",
      element: <AdminRouteWrapper Component={AdminRefundDetailPage} />,
    },

    /*로그인해야만 들어올 수 있는 페이지*/
    {
      path: "/cart",
      element: <ProtectedRouteWrapper Component={CartPage} />,
    },
    {
      path: "/mypage",
      element: <ProtectedRouteWrapper Component={MyPage} />,
    },
    {
      path: "/inquiry/write",
      element: <ProtectedRouteWrapper Component={InquiryWritePage} />,
    },
    {
      path: "/inquiry/my",
      element: <ProtectedRouteWrapper Component={InquiryMyPage} />,
    },
    {
      path: "/inquiry/my/detail/:id",
      element: <ProtectedRouteWrapper Component={InquiryMyDetailPage} />,
    },
    {
      path: "/order/write",
      element: <ProtectedRouteWrapper Component={OrderWritePage} />,
    },
    {
      path: "/order/result",
      element: <ProtectedRouteWrapper Component={OrderResultPage} />,
    },
    {
      path: "/my/order/detail/:orderNo",
      element: <ProtectedRouteWrapper Component={MyOrderDetailPage} />,
    },
    {
      path: "/my/review/write/:orderItemNo",
      element: <ProtectedRouteWrapper Component={ReviewWritePage} />,
    },
    {
      path: "/refund/write",
      element: <ProtectedRouteWrapper Component={RefundPage} />,
    },
    {
      path: "/payment/success",
      element: <ProtectedRouteWrapper Component={PaymentSuccessPage} />,
    },
    {
      path: "/payment/fail",
      element: <ProtectedRouteWrapper Component={PaymentFailPage} />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default function AppRouter() {
  return (
    <UserProvider>
      <AppRouterContent />
    </UserProvider>
  );
}
