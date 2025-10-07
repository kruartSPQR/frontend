// src/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";

export default function PrivateRoute({ children }) {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div className="container-centered">Loading...</div>;
    }

    return isLoggedIn ? children : <Navigate to="/login" />;
}