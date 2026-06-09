import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import AuthRouteFallback from "./AuthRouteFallback";

const PrivateRoute = () => {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isRestoring = useAuthStore((state) => state.isRestoring);
    const restoreAuthSession = useAuthStore((state) => state.restoreAuthSession);

    useEffect(() => {
        restoreAuthSession();
    }, [restoreAuthSession]);

    if (isRestoring) {
        return <AuthRouteFallback />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default PrivateRoute;
