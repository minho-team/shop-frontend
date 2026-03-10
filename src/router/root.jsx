
import { Suspense,lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "../pages/Loading";
import ProductDetail from "../pages/ProductDetail";
import ListPage from "../pages/ListPage";
import ReadComponent from "../product/ReadComponent";
import ReadPage from "../pages/product/ReadPage";

const MainPage = lazy(()=>import("../pages/MainPage"))
const MenBottomPage = lazy(()=>import("../pages/MenBottomPage"))
const MenTopPage = lazy(()=>import("../pages/MenTopPage"))

const root = createBrowserRouter([
    {
        path:'/read/:no',
        element:(
            <Suspense fallback={<Loading/>}>
                <ReadPage/>
            </Suspense>
        )
    },])

export default root;
