// src/pages/Dashboard.jsx
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return <div className="container-centered">Loading...</div>;
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6 text-center">
                    <h2 className="mb-4">Welcome, {user}!</h2>
                    <div className="d-grid gap-3 mb-4">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate("/orders")}>My Orders</button>
                        <button className="btn btn-success btn-lg" onClick={() => navigate("/payments")}>Payments</button>
                    </div>
                    <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
                </div>
            </div>
        </div>
    );
}