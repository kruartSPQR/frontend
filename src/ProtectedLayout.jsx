import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";

export default function ProtectedLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/dashboard">MyApp</Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/orders">Orders</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/payments">Payments</Link>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center gap-3">
                            <span className="text-muted small">{user}</span>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container">
                {children}
            </div>
        </div>
    );
}


