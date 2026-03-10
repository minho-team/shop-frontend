import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/Loading";
import { useUser, UserProvider } from "../context/UserContext";

const MainHome = lazy(() => import("../pages/MainHome"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const AdminHome = lazy(() => import("../pages/AdminHome"));

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
        { path: "/login", element: <LoginPage /> },
        { path: "/", element: <MainHome /> },
        // { path: "/main", element: <ProtectedRouteWrapper Component={MainPage} /> },
        { path: "/admin", element: <AdminRouteWrapper Component={AdminHome} /> },
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