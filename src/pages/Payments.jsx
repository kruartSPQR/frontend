import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../api";

export default function Payments() {
    const { user, userId } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user || userId) {
            fetchPayments();
        } else {
            setLoading(false);
        }
    }, [user, userId]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError("");
            const emailLike = user || userId;
            const res = await api.get(`/payments/user/${encodeURIComponent(emailLike)}`);
            setPayments(res.data);
        } catch (err) {
            
            if (err.response?.status === 404) {
                setPayments([]);
                setError("");
            } else {
                setError("Failed to fetch payments");
                console.error("Error fetching payments:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container-centered">Loading...</div>;

    return (
        <div className="container">
            <h2 className="mb-4">My Payments</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {payments.length === 0 && !error ? (
                <div className="alert alert-info">No payments found</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Order ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payments.map(payment => (
                            <tr key={payment.id}>
                                <td>{payment.id}</td>
                                <td>{payment.orderId}</td>
                                <td>${payment.amount}</td>
                                <td>
                                    <span className={`badge ${
                                        payment.status === 'SUCCESS' || payment.status === 'COMPLETED'
                                            ? 'bg-success'
                                            : payment.status === 'FAILED'
                                                ? 'bg-danger'
                                                : 'bg-warning'
                                    }`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td>{new Date(payment.timestamp).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}