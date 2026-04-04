import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/user/Loading";
import { useUser, UserProvider } from "../context/UserContext";

// ================================================
// 사용자 페이지
// ================================================
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
const ReviewEditPage = lazy(() => import("../pages/user/ReviewEditPage"));
const KakaoRedirectPage = lazy(() => import("../pages/user/KakaoRedirectPage"));
const RefundWritePage = lazy(() => import("../pages/user/RefundWritePage"));
const TempPaymentSuccessPage = lazy(
  () => import("../pages/user/TempPaymentSuccessPage"),
);
const PaymentFailPage = lazy(() => import("../pages/user/PaymentFailPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/user/PrivacyPolicyPage"));
const RoulettePage = lazy(() => import("../pages/user/RoulettePage"));

// ================================================
// 관리자 페이지
// ================================================
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
// 쿠폰 관리 페이지 (관리자 전용) - 쿠폰 생성/삭제/전체 지급
const AdminCouponManagePage = lazy(
  () => import("../pages/admin/AdminCouponManagePage"),
);

// ================================================
// 로그인 필요 가드 - 비로그인 시 /login 으로 이동
// ================================================
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

// ================================================
// 관리자 전용 가드 - ROLE_ADMIN 없으면 / 으로 이동
// ================================================
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

// ================================================
// 라우터 정의
// ================================================
const AppRouterContent = () => {
  const router = createBrowserRouter([
    // ── 누구나 접근 가능 ──────────────────────────
    { path: "/", element: <MainHome /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/inquiry", element: <InquiryPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/product/detail/:id", element: <ProductDetailPage /> },
    { path: "/faq/detail/:id", element: <FaqDetailPage /> },
    { path: "/member/kakao", element: <KakaoRedirectPage /> },
    { path: "/privacy", element: <PrivacyPolicyPage /> },

    // ── 관리자 전용 ───────────────────────────────
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
    {
      path: "/admin/dashboard",
      element: <AdminRouteWrapper Component={AdminDashboardPage} />,
    },
    // 쿠폰 관리 - 관리자만 접근 가능
    {
      path: "/admin/coupons",
      element: <AdminRouteWrapper Component={AdminCouponManagePage} />,
    },

    // ── 로그인 필요 ───────────────────────────────
    { path: "/cart", element: <ProtectedRouteWrapper Component={CartPage} /> },
    { path: "/mypage", element: <ProtectedRouteWrapper Component={MyPage} /> },
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
      path: "/my/review/edit/:reviewNo",
      element: <ProtectedRouteWrapper Component={ReviewEditPage} />,
    },
    {
      path: "/refund/write",
      element: <ProtectedRouteWrapper Component={RefundWritePage} />,
    },
    {
      path: "/payment/success",
      element: <ProtectedRouteWrapper Component={TempPaymentSuccessPage} />,
    },
    {
      path: "/payment/fail",
      element: <ProtectedRouteWrapper Component={PaymentFailPage} />,
    },
    // ★ 룰렛 페이지 - 로그인한 회원만 접근 가능
    {
      path: "/roulette",
      element: <ProtectedRouteWrapper Component={RoulettePage} />,
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
