import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Orders() {
    const { user, userId } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [payingOrderId, setPayingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/orders/email/${user}`);
            setOrders(res.data);
            setError("");
        } catch (err) {
            const backendMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data;
            setError(backendMsg || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            await api.delete(`/orders/${id}`);
            fetchOrders();
        } catch (err) {
            const backendMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data;
            setError(backendMsg || "Failed to delete order");
        }
    };

    const handlePay = async (orderId) => {
        if (!window.confirm("Are you sure you want to pay for this order?")) return;

        setPayingOrderId(orderId);
        try {
            await api.post(`/orders/pay/${orderId}`);
            // Обновляем заказы после успешной оплаты
            setTimeout(() => {
                fetchOrders();
            }, 2000); // Даем время на обработку платежа
            alert("Payment initiated successfully! Status will update shortly.");
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data || "Payment failed";
            alert(`Payment error: ${errorMessage}`);
        } finally {
            setPayingOrderId(null);
        }
    };

    const calculateOrderTotal = (order) => {
        if (!order.orderItems || order.orderItems.length === 0) return 0;
        return order.orderItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    if (loading) return <div className="container-centered">Loading...</div>;

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Orders</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/orders/new")}
                >
                    Create New Order
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {orders.length === 0 ? (
                <div className="alert alert-info">No orders found</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Items</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>
                                    {order.orderItems && order.orderItems.map((item, index) => (
                                        <div key={index}>
                                            {item.itemName} (x{item.quantity}) - ${item.price}
                                        </div>
                                    ))}
                                </td>
                                <td>${calculateOrderTotal(order).toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${
                                        order.status === 'PAID'
                                            ? 'bg-success'
                                            : order.status === 'PENDING'
                                                ? 'bg-warning'
                                                : order.status === 'FAILED'
                                                    ? 'bg-danger'
                                                    : 'bg-secondary'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{new Date(order.creationDate).toLocaleDateString()}</td>
                                <td>
                                    {order.status === 'PENDING' && (
                                        <button
                                            className="btn btn-sm btn-success me-2"
                                            onClick={() => handlePay(order.id)}
                                            disabled={payingOrderId === order.id}
                                        >
                                            {payingOrderId === order.id ? "Paying..." : "Pay"}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => navigate(`/orders/edit/${order.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(order.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}