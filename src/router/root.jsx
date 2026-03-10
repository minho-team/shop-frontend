
import { Suspense,lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "../pages/Loading";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OrderlistPage from "../pages/OrderlistPage";

const MainHome = lazy(()=>import("../pages/MainHome"));

const root = createBrowserRouter([
    {
        path:'/',
        element:(
            <Suspense fallback={<Loading/>}>
                <MainHome/>
            </Suspense>
        )
    },
    {
        path:'/mypage',
        element:(
            <Suspense fallback={<Loading/>}>
                <LoginPage/>
            </Suspense>
        )
    },
    {
        path:'/registerPage',
        element:(
            <Suspense fallback={<Loading/>}>
                <RegisterPage/>
            </Suspense>
        )
    },
    {
        path:'/orderlist',
        element:(
            <Suspense fallback={<Loading/>}>
                <OrderlistPage/>
            </Suspense>
        )
    },



])

export default root;
