import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/Loading";
import { useUser, UserProvider } from "../context/UserContext";

const MainHome = lazy(() => import("../pages/MainHome"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const AdminHome = lazy(() => import("../pages/AdminHome"));
const CartPage = lazy(() => import("../pages/CartPage"));
const MyPage = lazy(() => import("../pages/MyPage"));
const InquiryPage = lazy(() => import("../pages/InquiryPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));

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
        { path: "/inquiry", element: <InquiryPage/> },
        { path: "/register", element: <RegisterPage/> },

        /* 관리자마 들어올 수 있는 페이지 */
        { path: "/admin", element: <AdminRouteWrapper Component={AdminHome} /> },


        /*로그인해야만 들어올 수 있는 페이지*/
        { path: "/cart", element: <ProtectedRouteWrapper Component={CartPage} /> },
        { path: "/mypage", element: <ProtectedRouteWrapper Component={MyPage} /> },
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