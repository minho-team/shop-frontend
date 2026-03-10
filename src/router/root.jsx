
import { Suspense,lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "../pages/Loading";

const MainHome = lazy(()=>import("../pages/MainHome"));

const root = createBrowserRouter([
    {
        path:'/',
        element:(
            <Suspense fallback={<Loading/>}>
                <MainHome/>
            </Suspense>
        )
    },])

export default root;
