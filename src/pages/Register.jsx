import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link } from "react-router-dom";

export default function Register() {
    const { register } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            await register(email, password);
            setMsg("Registered successfully! You can login now.");
            setEmail("");
            setPassword("");
        } catch {
            setMsg("Error while registering");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2 className="mb-4 text-center">Register</h2>
            {msg && (
                <div className={`alert ${msg.includes("successfully") ? "alert-success" : "alert-danger"}`}>
                    {msg}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    className="btn btn-success w-100 mb-3"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            <div className="text-center">
                <span>Already have an account? </span>
                <Link to="/login">Login</Link>
            </div>
        </div>
    );
}